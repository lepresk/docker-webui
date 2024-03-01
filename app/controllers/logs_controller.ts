import { HttpContext } from '@adonisjs/core/http'
import { exec, spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Container, ViewParam } from '../../types.js'

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
        // @ts-ignore
        containerData[header] = values[index]
      })
      return containerData
    })

    return containerInfo as Container[]
  }

  /**
   * Listing of containers
   *
   * @param view
   */
  async index({ view }: HttpContext) {
    this.containers = await this.getContainers()

    return view.render('logs/index.edge', {
      containers: this.containers,
    })
  }

  /**
   * View Container log Action
   * @param view
   * @param params
   */
  async view({ view, params }: HttpContext) {
    const containerId = params.id

    const outputChunks: Buffer[] = []

    const containerName = await this.getContainerName(containerId)

    const result = await new Promise<ViewParam>((resolve, reject) => {
      const dockerLogsProcess = spawn('docker', ['logs', containerId])
      dockerLogsProcess.stdout.on('data', (chunk: Buffer) => {
        outputChunks.push(chunk)
      })

      dockerLogsProcess.on('close', (code) => {
        if (code === 0) {
          const output = Buffer.concat(outputChunks).toString('utf-8')
          resolve({ output, containerId, containerName })
        } else {
          reject(new Error(`Error code ${code} when running 'docker logs'`))
        }
      })

      dockerLogsProcess.on('error', (error) => {
        reject(error)
      })
    })

    return view.render('logs/view', result)
  }

  /**
   * Download Container log Action
   *
   * @param response
   * @param params
   */
  async download({ response, params }: HttpContext) {
    const containerId = params.id

    const outputChunks: Buffer[] = []
    const containerName = await this.getContainerName(containerId)

    const output = await new Promise<string>((resolve, reject) => {
      const dockerLogsProcess = spawn('docker', ['logs', containerId])
      dockerLogsProcess.stdout.on('data', (chunk: Buffer) => {
        outputChunks.push(chunk)
      })

      dockerLogsProcess.on('close', (code) => {
        if (code === 0) {
          const consoleOutput = Buffer.concat(outputChunks).toString('utf-8')
          // Envoyer le contenu des journaux Docker dans la réponse
          resolve(consoleOutput)
        } else {
          reject(new Error(`Error code ${code} when running 'docker logs'`))
        }
      })

      dockerLogsProcess.on('error', (error) => {
        reject(error)
      })
    })

    const filaname = `${containerName}.log`
    const filepath = app.publicPath(filaname)
    await fs.writeFile(filepath, output)

    response.attachment(filepath, filaname)
  }

  private async getContainerName(containerId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const dockerInspectProcess = spawn('docker', ['inspect', `--format='{{.Name}}'`, containerId])

      let containerName = ''

      dockerInspectProcess.stdout.on('data', (data: Buffer) => {
        containerName += data.toString()
      })

      dockerInspectProcess.on('close', (code) => {
        if (code === 0) {
          // Supprimer les caractères de saut de ligne et les guillemets autour du nom
          containerName = containerName.replace(/(\r\n|\n|\r|')/gm, '')
          containerName = containerName.substring(1) // supprimer le premier caractère qui est une barre oblique
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
