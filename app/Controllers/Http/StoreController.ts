import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from 'App/Models/App'
import AppValidator from 'App/Validators/AppValidator' // Importez votre validateur
import Application from '@ioc:Adonis/Core/Application' // Pour construire des chemins de fichiers
import { v4 as uuidv4 } from 'uuid'
import { AppCategory } from 'App/Models/App' // Assurez-vous que cette importation est correcte
import Extract from 'extract-zip'
import fs from 'fs/promises'
import fg from 'fast-glob'
import Route from '@ioc:Adonis/Core/Route'
import Drive from '@ioc:Adonis/Core/Drive'

import GitHubAppService from 'App/Services/GitHubAppService'
import path from 'path'

export default class StoreController {
  public async home({ request, view }: HttpContextContract) {
    const app_per_page = 15

    const page = request.input('page', 1)
    const cat = request.input('cat', -1)

    const pager = await App.query()
      .where('review',1)
      .orderBy('downloads', 'desc')
      .if(parseInt(cat as string, 10) !== -1, (query) => {
        query.where('category', parseInt(cat as string, 10))
      })
      .paginate(page, app_per_page)

    return view.render('store/store', {
      pager,
    })
  }

  public async myapps({ auth, view }: HttpContextContract) {
    const user = auth.use('web').user

    // Should not trigger (backed by auth middleware)
    if (!user)
      return

    const apps = await App.query()
      .where('userId', user.id)
      .exec()

    return view.render('store/myapps', {
      apps
    })
  }

  public async app({ view, params }: HttpContextContract) {
    try{
      const app = await App.query()
            .preload('author')
            .where('id', params.id)
            .firstOrFail()

      const icon = Application.publicPath(`icons/${app.uuid}.png`)

      return view.render('store/app', {
              app,
              author:app.author,
              icon,
          })
    }
    catch (error) {
      console.error('Error fetching app:', error)
    }
  }

  public async getManifest({ params, response, request }: HttpContextContract) {
    try {
      // 1. On récupère l'App par son UUID pour avoir son nom
      const app = await App.findByOrFail('uuid', params.uuid)
      
      // 2. On construit le chemin du manifest DANS Drive
      const manifestDrivePath = `apps/${app.uuid}/${app.name}/manifest.json`

      // 3. On lit le contenu du fichier depuis Drive
      const manifestContent = await Drive.get(manifestDrivePath)
      const manifest = JSON.parse(manifestContent.toString('utf-8'))

      // 4. On réécrit les URLs des firmwares pour qu'elles pointent vers la route 'apps.firmware'
      for (const build of manifest.builds) {
        for (const part of build.parts) {
          part.path = Route.makeUrl('apps.firmware', { 
            uuid: app.uuid, // On utilise l'UUID de l'APP
            fileName: part.path 
          }, {
            prefixUrl: request.header('origin') || '' 
          });
        }
      }
      return response.json(manifest)

    } catch (error) {
      console.error("Erreur lors de la récupération du manifest :", error)
      return response.notFound({ error: 'Manifest introuvable' })
    }
  }

  /**
   * Sert un fichier de firmware d'une application en le lisant depuis Drive.
   */
  public async getFirmware({ params, response }: HttpContextContract) {
    try {
      // 1. On récupère l'App par son UUID pour avoir son nom
      const app = await App.findByOrFail('uuid', params.uuid)

      // 2. On construit le chemin du fichier DANS Drive
      const firmwareDrivePath = `apps/${app.uuid}/${app.name}/${params.fileName}`

      // 3. On lit le fichier en tant que stream et le sert dans la réponse
      const stream = await Drive.getStream(firmwareDrivePath)
      if (!stream) {
        return response.notFound({ error: 'Fichier de firmware introuvable' })
      }
      response.stream(stream)
      return
    } catch (error) {
      console.error("Erreur lors de la récupération du firmware :", error)
      return response.notFound({ error: 'Fichier de firmware introuvable' })
    }
  }


  public async myapp({ auth, response, view, params }: HttpContextContract) {
    const app = await App.query()
      .preload('author')
      .where('id', params.id)
      .firstOrFail()

    const author = app.author

    const user = auth.use('web').user

    // Should not trigger (backed by auth middleware)
    if (!user)
      return

    if (author.id !== user.id) {
      return response.redirect().toPath('/store/myapps')
    }

    return view.render('store/myapp', {
      app,
      author
    })
  }
/*
  public async update({ auth, request, response, params, session }: HttpContextContract) {
    const app = await App.query()
      .preload('author')
      .where('id', params.id)
      .firstOrFail()

    const user = auth.use('web').user

    // Should not trigger (backed by auth middleware)
    if (!user)
      return

    const author = app.author

    if (author.id !== user.id) {
      return response.redirect().toPath('/store/myapps')
    }

    app.name = request.input('name')
    app.desc = request.input('desc')
    app.category = request.input('category')

    await app.save();

    return response.redirect(`/store/app/${app.id}`)
  }*/

  public async new({ view }: HttpContextContract) {
    return view.render('store/new')
  }

  public async post({ auth, request, response, session }: HttpContextContract) {
    const user = auth.user!
    const appUuid = uuidv4()
    const localWorkingPath = Application.tmpPath(`extraction_${appUuid}`)

    try {
      const validatedData = await request.validate(AppValidator)
      const appZipFile = validatedData.app_zip
      
      // 1. On crée le dossier et on y déplace le ZIP
      await fs.mkdir(localWorkingPath, { recursive: true })
      await appZipFile.move(localWorkingPath, { name: 'source.zip' })
      const zipFilePath = path.join( localWorkingPath,`/source.zip`)
       
      console.log(`step 1 : Done ${localWorkingPath}`)///// 

      // 2. On extrait le ZIP
      await Extract(zipFilePath, { dir: localWorkingPath })
      await fs.unlink(zipFilePath)

      console.log(`step 2 : Done ${localWorkingPath}`) /////

      // 3. On trouve le vrai dossier des fichiers à l'intérieur
      let finalAppDirectory = localWorkingPath
      const extractedItems = await fs.readdir(localWorkingPath)
      if (extractedItems.length === 1) {
        const singleItemPath = path.join(localWorkingPath, extractedItems[0])
        if ((await fs.stat(singleItemPath)).isDirectory()) {
          finalAppDirectory = singleItemPath
        }
      } 

      console.log(`step 3 : Done ${localWorkingPath}`) /////

      // 4. On lit le manifest depuis le dossier local
      const manifestPaths = await fg('**/manifest.json', { cwd: finalAppDirectory, absolute: true, onlyFiles: true })
      if (manifestPaths.length === 0) {
        throw new Error("Le fichier manifest.json est introuvable dans le ZIP.")
      }
      const manifestContent = await fs.readFile(manifestPaths[0], 'utf-8')
      const manifest = JSON.parse(manifestContent)

      console.log(`step 4 : Done ${finalAppDirectory}`) /////

      // 5. On gère l'icône
      const sourceIconPath = path.join(finalAppDirectory, 'icon.png')
      try {
        await fs.access(sourceIconPath)
        const newIconName = `${appUuid}.png`
        const publicIconsDirectory = Application.publicPath('icons')
        await fs.mkdir(publicIconsDirectory, { recursive: true })
        await fs.copyFile(sourceIconPath, path.join(publicIconsDirectory, newIconName))
        } catch (e) {
        console.warn("Le fichier 'icon.png' n'a pas été trouvé dans le ZIP.")
      }

      console.log(`step 5 : Done ${sourceIconPath}`) /////

      // 6. On déplace les fichiers 
      const filesToUpload = await fg('**/*', { cwd: finalAppDirectory, onlyFiles: true })
      for (const file of filesToUpload) {
        const localFilePath = path.join(finalAppDirectory, file)
        const drivePath = `apps/${appUuid}//${file}`
        await Drive.put(drivePath, await fs.readFile(localFilePath))
      }

      console.log(`step 6 : Done apps/${appUuid}/`) /////

      // 7. On crée l'application
      const newApp = await App.create({
        userId: user.id,
        uuid: appUuid,
        name: validatedData.name,
        desc: validatedData.desc,
        category: validatedData.category as unknown as AppCategory,
        downloads: 0,
        capabilities: manifest,
      })
      await newApp.save()
      await newApp.load('author')

      console.log('step 7 : Nouvelle application créée avec les données suivantes :', newApp)

      // 8. On exporte dans la backup 
      await GitHubAppService.commitNewApp(newApp, finalAppDirectory)
    
      session.flash({ success: 'Application créée avec succès !' })
      return response.redirect().toRoute('StoreController.myapp', { id: newApp.id })

    } catch (error) {    
    if (error.messages) { // Erreur de validation
      session.flashAll()
      session.flash({ error: error.messages })
    } else {
      console.error('Erreur lors de la création de l\'application:', error)
      session.flash({ error: `Une erreur est survenue : ${error.message}` })
    }
    return response.redirect().back()
    } finally {
      //9. On nettoie le dossier temporaire
      await fs.rm(localWorkingPath, { recursive: true, force: true }).catch(() => {
        console.warn(`Le dossier de travail ${localWorkingPath} n'a pas pu être nettoyé.`)
      })
    }
  }
}
