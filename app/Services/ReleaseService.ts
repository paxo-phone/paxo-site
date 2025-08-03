import Release from 'App/Models/Release'
import fs from 'fs-extra'

class ReleaseService {
  public async publishRelease(release: Release) {
    await release.load('app')
    const app = release.app

    const oldAppFilesPath = `apps/${app.uuid}`
    const newReleaseFilesPath = `releases/${release.uuid}`

    console.log(`Publication de la release ${release.id} pour l'app ${app.id}...`)
    console.log(`Suppression de l'ancien dossier : ${oldAppFilesPath}`)
    console.log(`Déplacement du nouveau dossier depuis : ${newReleaseFilesPath}`)

    try {
      await fs.remove(oldAppFilesPath)

      await fs.rename(newReleaseFilesPath, oldAppFilesPath)

      console.log(`Publication réussie. Les fichiers de l'app ${app.name} sont à jour.`)
    } catch (error) {
      console.error(`Échec critique lors de la publication de la release ${release.id}:`, error)

      throw error 
    }
  }
}

export default new ReleaseService()