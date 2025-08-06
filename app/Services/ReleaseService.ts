import Release from 'App/Models/Release'
import fs from 'fs-extra'

import Drive from '@ioc:Adonis/Core/Drive'
import { LocalDriver } from '@adonisjs/core/build/standalone'

class ReleaseService {
  public async publishRelease(release: Release) {
    await release.load('app')
    const app = release.app

  

    try {
      const disk = Drive.use()
      if (!(disk instanceof LocalDriver)) {
        throw new Error("La publication de release n'est supportée que pour le driver 'local'.")
      }

      const oldAppDrivePath = `apps/${app.uuid}`
      const newReleaseDrivePath = `releases/${release.uuid}`

      const oldAppFilesPath = disk.makePath(oldAppDrivePath)
      const newReleaseFilesPath = disk.makePath(newReleaseDrivePath)
      

      console.log(`Publication de la release ${release.id} pour l'app ${app.id}...`)
      console.log(`Suppression de l'ancien dossier : ${oldAppFilesPath}`)
      console.log(`Déplacement du nouveau dossier depuis : ${newReleaseFilesPath}`)

      await fs.remove(oldAppFilesPath)

      await fs.move(newReleaseFilesPath, oldAppFilesPath)

      console.log(`Publication réussie. Les fichiers de l'app ${app.name} sont à jour.`)
    } catch (error) {
      console.error(`Échec critique lors de la publication de la release ${release.id}:`, error)

      throw error 
    }
  }
}

export default new ReleaseService()