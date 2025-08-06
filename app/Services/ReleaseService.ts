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
      console.log(`Chemin de l'ancienne app: ${oldAppFilesPath}`)
      console.log(`Chemin de la nouvelle release: ${newReleaseFilesPath}`)
      
      // Vérifier si le répertoire parent des releases existe
      const releasesDir = path.dirname(newReleaseFilesPath)
      console.log(`Vérification du répertoire parent des releases: ${releasesDir}`)
      
      if (!(await fs.pathExists(releasesDir))) {
        console.error(`Le répertoire parent des releases n'existe pas: ${releasesDir}`)
        throw new Error(`Le répertoire parent des releases n'existe pas: ${releasesDir}`)
      }
      
      // Lister tous les sous-répertoires dans le répertoire releases
      console.log(`Contenu du répertoire releases:`)
      const releases = await fs.readdir(releasesDir)
      console.log(releases)
      
      // Chercher le répertoire exact
      if (!(await fs.pathExists(newReleaseFilesPath))) {
        console.error(`Le répertoire de la release n'existe pas: ${newReleaseFilesPath}`)
        
        // Chercher une correspondance partielle
        const partialUuid = release.uuid.substring(0, 8)
        console.log(`Recherche d'une correspondance avec l'UUID partiel: ${partialUuid}`)
        
        const matchingRelease = releases.find(dir => 
          dir.includes(release.uuid) || 
          dir.includes(partialUuid) ||
          dir.includes(release.id.toString())
        )
        
        if (matchingRelease) {
          console.log(`Répertoire trouvé: ${matchingRelease}`)
          const actualReleasePath = path.join(releasesDir, matchingRelease)
          console.log(`Chemin complet: ${actualReleasePath}`)
          
          // Vérifier que c'est bien un répertoire
          const stats = await fs.stat(actualReleasePath)
          if (!stats.isDirectory()) {
            throw new Error(`Le chemin trouvé n'est pas un répertoire: ${actualReleasePath}`)
          }
          
          await this.performMove(actualReleasePath, oldAppFilesPath, app.name)
          return
        }
        
        // Si aucune correspondance n'est trouvée, essayer de trouver un répertoire qui pourrait correspondre
        console.log(`Aucune correspondance exacte trouvée. Essai avec d'autres critères...`)
        
        // Chercher un répertoire contenant l'ID de la release
        const idMatch = releases.find(dir => dir.includes(release.id.toString()))
        if (idMatch) {
          console.log(`Répertoire trouvé par ID: ${idMatch}`)
          const actualReleasePath = path.join(releasesDir, idMatch)
          await this.performMove(actualReleasePath, oldAppFilesPath, app.name)
          return
        }
        
        // Chercher un répertoire contenant l'UUID de l'app
        const appUuidMatch = releases.find(dir => dir.includes(app.uuid))
        if (appUuidMatch) {
          console.log(`Répertoire trouvé par UUID d'app: ${appUuidMatch}`)
          const actualReleasePath = path.join(releasesDir, appUuidMatch)
          await this.performMove(actualReleasePath, oldAppFilesPath, app.name)
          return
        }
        
        // Si rien n'est trouvé, lever une erreur détaillée
        throw new Error(`Impossible de trouver le répertoire de la release. UUID: ${release.uuid}, ID: ${release.id}. Répertoires disponibles: ${releases.join(', ')}`)
      }
      
      // Si le répertoire exact existe
      await this.performMove(newReleaseFilesPath, oldAppFilesPath, app.name)
    } catch (error) {
      console.error(`Échec critique lors de la publication de la release ${release.id}:`, error)
      throw error 
    }
  }
  
  private async performMove(sourcePath: string, destPath: string, appName: string) {
    console.log(`Déplacement des fichiers de ${sourcePath} vers ${destPath}`)
    
    // Vérifier que le répertoire source existe
    if (!(await fs.pathExists(sourcePath))) {
      throw new Error(`Le répertoire source n'existe pas: ${sourcePath}`)
    }
    
    // Vérifier que le répertoire parent de destination existe
    const destParentDir = path.dirname(destPath)
    if (!(await fs.pathExists(destParentDir))) {
      console.log(`Création du répertoire parent de destination: ${destParentDir}`)
      await fs.ensureDir(destParentDir)
    }
    
    // Supprimer l'ancien répertoire s'il existe
    if (await fs.pathExists(destPath)) {
      console.log(`Suppression de l'ancien répertoire: ${destPath}`)
      await fs.remove(destPath)
    }
    
    // Déplacer les fichiers
    console.log(`Déplacement de ${sourcePath} vers ${destPath}`)
    await fs.move(sourcePath, destPath)
    console.log(`Publication réussie. Les fichiers de l'app ${appName} sont à jour.`)
  }
}

export default new ReleaseService()