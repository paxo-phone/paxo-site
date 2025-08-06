import Release from 'App/Models/Release'
import fs from 'fs-extra'
import Drive from '@ioc:Adonis/Core/Drive'
import { LocalDriver } from '@adonisjs/core/build/standalone'
import path from 'path'

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
      console.log(`Ancien chemin de l'app: ${oldAppFilesPath}`)
      console.log(`Nouveau chemin de la release: ${newReleaseFilesPath}`)

      // Check if the source directory exists
      if (!(await fs.pathExists(newReleaseFilesPath))) {
        // Try to find the release directory with a partial UUID match
        const releasesDir = path.dirname(newReleaseFilesPath)
        if (await fs.pathExists(releasesDir)) {
          const releases = await fs.readdir(releasesDir)
          const partialUuid = release.uuid.substring(0, 8)
          const matchingRelease = releases.find(dir => dir.includes(partialUuid))
          
          if (matchingRelease) {
            console.log(`Répertoire de release trouvé avec une correspondance partielle: ${matchingRelease}`)
            // Update the path with the actual directory name
            const actualReleasePath = path.join(releasesDir, matchingRelease)
            console.log(`Mise à jour du chemin de la release vers: ${actualReleasePath}`)
            // Continue with the actual path
            await this.performMove(actualReleasePath, oldAppFilesPath, app.name)
            return
          }
        }
        
        throw new Error(`Le répertoire de la release n'existe pas: ${newReleaseFilesPath}`)
      }
      
      // If we reach here, the source directory exists
      await this.performMove(newReleaseFilesPath, oldAppFilesPath, app.name)
    } catch (error) {
      console.error(`Échec critique lors de la publication de la release ${release.id}:`, error)
      throw error 
    }
  }
  private async performMove(sourcePath: string, destPath: string, appName: string) {
    console.log(`Suppression de l'ancien dossier : ${destPath}`)
    
    // Ensure the parent directory exists
    await fs.ensureDir(path.dirname(destPath))
    
    // Remove the old app directory if it exists
    if (await fs.pathExists(destPath)) {
      await fs.remove(destPath)
    }
    
    // Move the release directory to the app directory
    await fs.move(sourcePath, destPath)
    console.log(`Publication réussie. Les fichiers de l'app ${appName} sont à jour.`)
  }
}

export default new ReleaseService()