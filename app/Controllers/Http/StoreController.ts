import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from 'App/Models/App'
import Release from 'App/Models/Release'
import AppValidator from 'App/Validators/AppValidator' // Importez votre validateur
import Application from '@ioc:Adonis/Core/Application' // Pour construire des chemins de fichiers
import { cuid } from '@ioc:Adonis/Core/Helpers'


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
    const app = await App.query()
      .preload('author')
      .where('id', params.id)
      .firstOrFail()

    const releases = await Release.query()
      .where('appId', app.id)
      .orderBy('id', 'desc')
      .exec()

    const author = app.author

    return view.render('store/app', {
      app,
      author,
      releases
    })
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
  }

  public async new({ view }: HttpContextContract) {
    return view.render('store/new')
  }

  public async post({ auth, request, response, session }: HttpContextContract) {
    const user = auth.use('web').user
    if (!user) {
      session.flash({ error: 'Authentification requise.' })
      return response.redirect().back()
    }

    try {
      // Valider la requête en utilisant AppValidator
      const payload = await request.validate(AppValidator)

      const appZipFile = payload.app_zip // Accès au fichier validé

      // Générer un nom de fichier unique pour éviter les conflits
      const zipFileName = `${cuid()}.${appZipFile.extname}`

      // Déplacer le fichier uploadé vers le dossier 'uploads/app_zips' dans le dossier public
      // Assurez-vous que ce dossier existe: public/uploads/app_zips
      await appZipFile.moveToDisk('../../public/uploads/app_zips', { name: zipFileName }, 'local')


      if (appZipFile.state !== 'moved' || !appZipFile.filePath) {
        session.flash({ error: `Erreur lors du téléversement du fichier ZIP : ${appZipFile.errors[0]?.message || 'Chemin de fichier non disponible après déplacement.'}` })
        return response.redirect().back()
      }
      // Chemin relatif accessible publiquement pour stocker dans la DB
      const publicZipPath = `/uploads/app_zips/${zipFileName}`

      // Créer l'application dans la base de données
      const app = await App.create({
        userId: user.id,
        name: payload.name,
        desc: payload.desc,
        category: payload.category as App['category'],
        // Vous pourriez vouloir ajouter une colonne à votre modèle App pour stocker ce chemin
        // zipPath: publicZipPath, // Exemple
        downloads: 0,
      })

      // Créer une release initiale pour cette application
      // (Adaptez cette logique si nécessaire)
      try {
        await Release.create({
          appId: app.id,
          name: '1.0.0 - Version Initiale', // Ou un nom plus descriptif
          commitSha: 'initial_upload', // Ou un placeholder
          changelog: 'Première version de l\'application.',
          downloadLink: publicZipPath, // Lien vers le fichier ZIP téléversé
        })
      } catch (releaseError) {
        console.error(`Échec de la création de la release initiale pour l'app ${app.id}:`, releaseError.message)
        // Vous pouvez choisir de flasher un avertissement ici
        session.flash({ warning: 'Application créée, mais la release initiale n\'a pas pu être générée.' })
      }

      session.flash({ success: 'Application créée avec succès ! Une première release a été générée.' })
      return response.redirect().toRoute('StoreController.myapp', { id: app.id }) // ou une autre route appropriée

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

