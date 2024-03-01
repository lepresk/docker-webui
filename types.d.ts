export interface Container {
  'CONTAINER ID': string
  'IMAGE': string
  'CREATE': string
  'STATUS': string
  'PORTS': string
  'NAMES': string
}

export type ViewParam = {
  output: string
  containerId: string
  containerName: string
}
