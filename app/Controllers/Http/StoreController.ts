import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from 'App/Models/App'
import Release from 'App/Models/Release'
import AppValidator from 'App/Validators/AppValidator' // Importez votre validateur
import Application from '@ioc:Adonis/Core/Application' // Pour construire des chemins de fichiers
import { v4 as uuidv4 } from 'uuid'
import { AppCategory } from 'App/Models/App' // Assurez-vous que cette importation est correcte
import Extract from 'extract-zip'
import path from 'path'
import fs from 'fs/promises'

export default class StoreController {
  public async home({ request, view }: HttpContextContract) {
    const app_per_page = 15

    const page = request.input('page', 1)
    const cat = request.input('cat', -1)

    const pager = await App.query()
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

      return view.render('store/app', {
              app,
              author:app.author,
          })
    }
    catch (error) {
      console.error('Error fetching app:', error)
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
    const user = auth.use('web').user
    if (!user) {
      session.flash({ error: 'Authentification requise.' })
      return response.redirect().back()
    }

    const appUuid = uuidv4() // Génération d'un UUID unique pour l'application

    try {
      const validatedData = await request.validate(AppValidator)
      const appZipFile = validatedData.app_zip

      await appZipFile.move(Application.tmpPath(`apps/${appUuid}`), {
        name : `${appUuid}`, // It's good practice to keep the .zip extension
        overwrite: false,
      })

      if (appZipFile.state !== 'moved' || !appZipFile.filePath) {
        session.flash({ error: 'Erreur lors du déplacement du fichier ZIP.' })
        if (appZipFile.errors) {
          console.error('Erreurs de déplacement du fichier:', appZipFile.errors)
        }
        return response.redirect().back()
      }

      // 5. Définir le dossier où le contenu sera extrait
      const contentDirectory = Application.tmpPath(`apps/${appUuid}/`)
      const zipFilePath = appZipFile.filePath // Chemin du fichier ZIP déplacé

      // 6. Créer le dossier de destination AVANT de tenter d'extraire
      await fs.mkdir(contentDirectory, { recursive: true })

      // 7. Extraire le zip EN UTILISANT LE BON CHEMIN
      await Extract(zipFilePath, { dir: contentDirectory })
      console.log(`Fichier extrait avec succès dans ${contentDirectory}`)

      // 8. (Optionnel mais recommandé) Nettoyer le fichier .zip original
      await fs.unlink(zipFilePath)

      const newApp = await App.create({
            userId: user.id,
            uuid: appUuid, // Génération d'un UUID unique pour l'application
            name: validatedData.name,
            desc: validatedData.desc,
            category: validatedData.category as unknown as AppCategory,
            downloads: 0,
          })

    await newApp.save()

    

    // Créer une release initiale pour cette application
    // (Adaptez cette logique si nécessaire)
    /*
    try {
      await Release.create({
        appId: newApp.id,
        name: '1.0.0 - Version Initiale', // Ou un nom plus descriptif
        commitSha: 'initial_upload', // Ou un placeholder
        changelog: 'Première version de l\'application.',
        downloadLink: appZipFile.filePath, // Lien vers le fichier ZIP téléversé
      })
    } catch (releaseError) {
      console.error(`Échec de la création de la release initiale pour l'app ${newApp.id}:`, releaseError.message)
      // Vous pouvez choisir de flasher un avertissement ici
      session.flash({ warning: 'Application créée, mais la release initiale n\'a pas pu être générée.' })
    }*/

    session.flash({ success: 'Application créée avec succès !' })
    return response.redirect().toRoute('StoreController.myapp', { id: newApp.id }) // ou une autre route appropriée

    } catch (error) {
      if (error.messages) { // Erreur de validation d'AdonisJS
        session.flashAll() // Renvoyer les anciennes entrées au formulaire
        session.flash({ error: 'Veuillez corriger les erreurs dans le formulaire.' })
        console.error('Erreur de validation:', error.messages)
      } else {
        console.error('Erreur lors de la création de l\'application:', error)
        session.flash({ error: 'Une erreur est survenue lors de la création de l\'application.' })
      }
      return response.redirect().back()
    }
  }
}

