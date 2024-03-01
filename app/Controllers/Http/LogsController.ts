import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext' 
import { exec, spawn } from 'child_process' 

interface Container {
  'CONTAINER ID': string,
  IMAGE: string,
  CREATE: string, 
  STATUS: string,
  PORTS: string,
  NAMES: string
}

export default class LogsController {
  private containers: Container[] = [] 

  private async getContainers(): Promise<Container[]> {
    const output = await new Promise<string>((resolve, reject) => {
      exec('docker ps', (error, stdout, stderr) => {
        if (error) {
          reject(error) 
        } else if (stderr) {
          resolve(stderr) 
        } else {
          resolve(stdout) 
        }
      }) 
    }) 

    const lines = output.trim().split('\n') 
    const headers = lines[0].split(/\s{2,}/) 
    const containerInfo = lines.slice(1).map((line) => {
      const values = line.split(/\s{2,}/) 
      const containerData = {} 
      headers.forEach((header, index) => {
        containerData[header] = values[index] 
      }) 
      return containerData
    }) 

    return containerInfo as Container[] 
  }

  public async index({ view }: HttpContextContract) {
    this.containers = await this.getContainers() 

    return view.render('index.edge', {
      containers: this.containers,
    }) 
  }

  public async view({ view, params }: HttpContextContract) {
    const containerId = params.id 

    const outputChunks: Buffer[] = [] 

    const containerName = await this.getContainerName(containerId) 
    return new Promise<void | string>((resolve, reject) => {
      const dockerLogsProcess = spawn('docker', ['logs', containerId]) 

      dockerLogsProcess.stdout.on('data', (chunk: Buffer) => {
        outputChunks.push(chunk) 
      }) 

      dockerLogsProcess.on('close', (code) => {
        if (code === 0) {
          const output = Buffer.concat(outputChunks).toString('utf-8') 
          resolve(view.render('view', { output, containerId, containerName })) 
        } else {
          reject(`Error code ${code} when running 'docker logs'`) 
        }
      }) 

      dockerLogsProcess.on('error', (error) => {
        reject(error) 
      }) 
    }) 
  }

  public async download({ response, params }: HttpContextContract) {
    const containerId = params.id 

    const outputChunks: Buffer[] = [] 
    const containerName = await this.getContainerName(containerId) 
    return new Promise<void | string>((resolve, reject) => {
      const dockerLogsProcess = spawn('docker', ['logs', containerId]) 

      dockerLogsProcess.stdout.on('data', (chunk: Buffer) => {
        outputChunks.push(chunk) 
      }) 

      dockerLogsProcess.on('close', (code) => {
        if (code === 0) {
          const output = Buffer.concat(outputChunks).toString('utf-8') 

          // Nom du fichier de sortie
          const filename = `docker_logs_${containerName}_${containerId}.txt` 

          // Configurez l'en-tête de la réponse pour indiquer qu'il s'agit d'un téléchargement de fichier
          response.header(
            'Content-Disposition',
            `attachment  filename=${filename}`
          ) 
          response.header('Content-Type', 'text/plain') 

          // Envoyer le contenu des journaux Docker dans la réponse
          resolve(response.send(output)) 
        } else {
          reject(`Error code ${code} when running 'docker logs'`) 
        }
      }) 

      dockerLogsProcess.on('error', (error) => {
        reject(error) 
      }) 
    }) 
  }

  public async getContainerName(containerId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const dockerInspectProcess = spawn('docker', [
        'inspect',
        `--format='{{.Name}}'`,
        containerId,
      ]) 

      let containerName = '' 

      dockerInspectProcess.stdout.on('data', (data: Buffer) => {
        containerName += data.toString() 
      }) 

      dockerInspectProcess.on('close', (code) => {
        if (code === 0) {
          // Supprimer les caractères de saut de ligne et les guillemets autour du nom
          containerName = containerName.replace(/(\r\n|\n|\r|')/gm, '') 
          containerName = containerName.substring(1)  // supprimer le premier caractère qui est une barre oblique
          resolve(containerName) 
        } else {
          reject(`Error code ${code} when running 'docker inspect'`) 
        }
      }) 

      dockerInspectProcess.on('error', (error) => {
        reject(error) 
      }) 
    }) 
  }
}
