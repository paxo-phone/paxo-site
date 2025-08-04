import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path'

import App, { ReviewCategory } from 'App/Models/App'
import Release, { ReleaseStatus } from 'App/Models/Release'

import Review from 'App/Models/App'
import Database from '@ioc:Adonis/Lucid/Database'
import ReleaseService from 'App/Services/ReleaseService'
import GitHubAppService from 'App/Services/GitHubAppService'

import Drive from '@ioc:Adonis/Core/Drive'
import { LocalDriver } from '@adonisjs/core/build/standalone'


/*import { randomBytes } from 'node:crypto'
import Drive from '@ioc:Adonis/Core/Drive'
import axios from "axios"*/

/*import Tutorial from 'App/Models/Tutorial'
import PressArticle from 'App/Models/PressArticle'
import Project from 'App/Models/Project'
import File from 'App/Models/File'*/

export const models: { [key: string]: LucidModel } = { // Models available in the admin panel
  /*Tutorial,
  PressArticle,
  Project,
  File*/
  Review
} 

export default class AdminModelController {
  public async index({ view }: HttpContextContract) {
    // 1. Compter les nouvelles applications en attente
    const pendingAppsCount = await App.query()
      .where('review', ReviewCategory.WAITING)
      .count('* as total')

    // 2. Compter les nouvelles releases en attente
    const pendingReleasesCount = await Release.query()
      .where('status', ReleaseStatus.PENDING)
      .count('* as total')

      const appsToReview = await App.query()
        .where('review', ReviewCategory.WAITING)
        .preload('author')
        .orderBy('created_at', 'asc');

      // 2. Récupérer la liste des MISES À JOUR (RELEASES) en attente
      const releasesToReview = await Release.query()
        .where('status', ReleaseStatus.PENDING)
        .preload('app', (appQuery) => {
          appQuery.preload('author')
        })
        .orderBy('created_at', 'asc');

    // 3. Rendre la vue des onglets
    return view.render('adminmodel/index', { // On utilise une nouvelle vue
      pendingApps: pendingAppsCount[0].$extras.total,
      pendingReleases: pendingReleasesCount[0].$extras.total,
      apps: appsToReview,
      releases: releasesToReview,
    })
  }

  /*******************************/ 
  /*   REVIEW APPS    */
  /*******************************/ 
  public async reviewApp({ view, params, session }: HttpContextContract) {
    try{
      const app = await Review.findOrFail(params.id);

      await app.load('author');

      return view.render('adminmodel/reviewapp', {
        app: app,           
        model: Object.keys(models.Review),  
        id: params.id, 
      });
    }
    catch (error) {
      session.flash({ error: "Une erreur est survenue lors du chargement de l'applications." });
      return view.render('errors/not_found'); 
    }
  }

  public async explorerApp({ view, params, session, response }: HttpContextContract) {
    try{
      const app = await Review.findOrFail(params.id)

      const disk = Drive.use()
      if (!(disk instanceof LocalDriver)) {
        throw new Error("L'explorateur de fichiers n'est supporté que pour le driver 'local'.")
      }

      const searchDirectory = disk.makePath(`apps/${app.uuid}/`)

      console.log('[CHEMIN DE RECHERCHE ABSOLU] :', searchDirectory)

      const entries = await fg('**/*', { 
        cwd: searchDirectory,
        stats: true
      })
      const fileList = entries.map(entry => ({
        path: entry.path,
        isDirectory: entry.stats ? entry.stats.isDirectory() : false
      })).sort((a, b) => a.path.localeCompare(b.path));

      return view.render('adminmodel/explorerapp', {
        app,
        model: params.model,
        fileList: fileList.sort(),
      })
    }catch (error) {
    console.error("Erreur lors de l'exploration des fichiers de l'application :", error)
        session.flash({ error: "Impossible d'explorer les fichiers de cette application." })
        return response.redirect().back()
    }
}

  public async fileApp({ params, response, view, session}: HttpContextContract) {
    const relativeFilePath = params['*'].join('/')

    const app = await App.findOrFail(params.id)
    const drivePath = `apps/${app.uuid}/${relativeFilePath}`;

    try {
      const fileExtension = path.extname(relativeFilePath).toLowerCase()
      switch (fileExtension) {
        case '.lua':
        case '.json':

          const codeContentBuffer = await Drive.get(drivePath)
          const codeContent = codeContentBuffer.toString('utf-8')

          return view.render('adminmodel/fileapp', {
            app,
            model: params.model,
            fileName: relativeFilePath,
            language: fileExtension === '.lua' ? 'lua' : 'json', // Pour Prism.js
            codeContent,
          })

        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.svg':
          // Pour les images, on les envoie directement au navigateur
          return response.download(drivePath)

        default:
          // Pour tous les autres types de fichiers, on propose un téléchargement forcé
          return response.download(drivePath, true)
      }
    } catch (error) {
      session.flash({ error: `Erreur lors du service du fichier ${drivePath}:` });
      return view.render('errors/not_found'); 
    }
  }

  public async approveApp({ params, response, session }: HttpContextContract) {
    const app = await Review.findOrFail(params.id);
    app.review = ReviewCategory.APPROVED;
    app.comment = null; // Clear any previous rejection comment
    await app.save();

    GitHubAppService.moveApp(app, 'Pending', 'Published')
    .catch(err => console.error(`Échec du déplacement GitHub pour l'app ${app.id}:`, err));

    session.flash({ success: `L'application "${app.name}" a été approuvée.` });
    return response.redirect().toRoute('adminPanel.model.view', { model: Object.keys(models.Review),  });
  }

  public async rejectApp({ params, request, response, session }: HttpContextContract) {
    const app = await Review.findOrFail(params.id);
    
    // Get the comment from the form submission
    const comment = request.input('comment');

    // Basic validation: ensure a comment was provided
    if (!comment || comment.trim() === '') {
      session.flash({ error: 'Un commentaire est obligatoire pour rejeter une application.' });
      return response.redirect().back();
    }

    app.review = ReviewCategory.REJECTED;
    app.comment = comment; // Save the comment
    await app.save();

    GitHubAppService.moveApp(app, 'Pending', 'Rejected')
      .catch(err => console.error(`Échec du déplacement GitHub pour l'app ${app.id}:`, err));

    session.flash({ success: `L'application "${app.name}" a été rejetée.` });
    return response.redirect().toRoute('adminPanel.model.view', { model: Object.keys(models.Review),  });
  }

  /*******************************/ 
  /*  REVIEW RELEASES CONROLLER  */ 
  /*******************************/ 
  public async reviewRelease({ view, params, session, response }: HttpContextContract) {
    try {
      // On utilise .query() pour pouvoir pré-charger les relations
      const releaseToReview = await Release.query()
        .where('id', params.id)
        // C'est ici que la magie opère :
        .preload('app', (appQuery) => {
          // 1. On charge l'application associée à cette release...
          appQuery.preload('author') // 2. ...et pour cette application, on charge son auteur.
        })
        .firstOrFail() // Renvoie une erreur 404 si la release n'est pas trouvée

      // On rend la vue en lui passant l'objet 'release' complet
      return view.render('adminmodel/reviewrelease', { // J'utilise un nom de vue plus clair
        release: releaseToReview,
        model: Object.keys(models.Review),  
        id: params.id, 
      })

    } catch (error) {
      console.error("Erreur lors du chargement de la release à valider :", error)
      session.flash({ error: 'Impossible de charger la mise à jour pour la validation.' })
      return response.redirect().back()
    }
  }

  public async approveRelease({ params, response, session }: HttpContextContract) {
    // On utilise une transaction pour s'assurer que TOUT réussit, ou que RIEN n'est fait.
    // Si la mise à jour des fichiers échoue, les changements en base de données seront annulés.
    const trx = await Database.transaction()

    try {
      // 1. On trouve la release à approuver et on la verrouille pour la transaction
      const releaseToApprove = await Release.findOrFail(params.id, { client: trx })
      
      // 2. On archive toutes les autres releases "LIVE" de la même application
      await Release.query({ client: trx })
        .where('app_id', releaseToApprove.appId)
        .where('status', ReleaseStatus.LIVE)
        .update({ status: ReleaseStatus.ARCHIVED })

      // 3. On passe la nouvelle version en "LIVE"
      releaseToApprove.status = ReleaseStatus.LIVE
      await releaseToApprove.save()

      // 4. === ON APPELLE LE SERVICE POUR METTRE À JOUR LES FICHIERS ===
      // Cette opération fait maintenant partie de la transaction globale.
      await ReleaseService.publishRelease(releaseToApprove)

      await GitHubAppService.moveRelease(releaseToApprove, 'Pending', 'Published');

      // 5. Si tout a réussi, on valide la transaction
      await trx.commit()

      session.flash({ success: 'La release a été approuvée et les fichiers de l\'application ont été mis à jour.' })

    } catch (error) {
      // Si une erreur se produit (dans la DB ou dans les fichiers), on annule tout.
      await trx.rollback()
      console.error("Échec de l'approbation de la release :", error)
      session.flash({ error: 'Une erreur critique est survenue lors de l\'approbation.' })
    }

    return response.redirect().back()
  }

  public async rejectRelease({ params, response, session }: HttpContextContract) {
    const releaseToReject = await Release.findOrFail(params.id)
    
    const drivePath = `releases/${releaseToReject.uuid}`;
    await fs.remove(drivePath)

    await GitHubAppService.moveRelease(releaseToReject, 'Pending', 'Rejected'); 

    await releaseToReject.delete()

    session.flash({ success: 'La release a été rejetée et supprimée.' })
    return response.redirect().back()
  }

  public async explorerRelease({ view, params, response, session }: HttpContextContract) {
    try{
      const release = await Release.query()
      .where('id', params.id)
      .preload('app') 
      .firstOrFail()

      const disk = Drive.use()

      if (!(disk instanceof LocalDriver)) {
        throw new Error("L'explorateur de fichiers n'est supporté que pour le driver 'local'.")
      }
      
      const drivePath = `releases/${release.uuid}`;
      const searchDirectory = disk.makePath(drivePath)


      console.log('[CHEMIN DE RECHERCHE] :', searchDirectory);

      const entries = await fg('**/*', { 
        cwd: searchDirectory,
        stats: true
      })
      console.log('[ENTRÉES TROUVÉES] :', entries);
      const fileList = entries.map(entry => ({
        path: entry.path,
        isDirectory: entry.stats ? entry.stats.isDirectory() : false
      })).sort((a, b) => a.path.localeCompare(b.path));
      console.log('[LISTE DE FICHIERS] :', fileList);
      return view.render('adminmodel/explorerrelease', {
        release,
        app: release.app, 
        fileList: fileList,
      })
    }catch (error) {
      console.error("Erreur lors de l'exploration des fichiers de la release :", error)
      session.flash({ error: "Impossible d'explorer les fichiers de cette release." })
      return response.redirect().back()
    }
  }

  public async fileRelease({ params, response, view, session }: HttpContextContract) {
    try {
      //1.
      const relativeFilePath = params['*'].join('/')
      
      const release = await Release.query()
        .where('id', params.id)
        .preload('app') 
        .firstOrFail()
      
      //2.
      const drivePath = `releases/${release.uuid}/${relativeFilePath}`;

      
      console.log('[DEBUG] Tentative de lecture du fichier :', drivePath)

      const fileExtension = path.extname(relativeFilePath).toLowerCase()

      //3.
      switch (fileExtension) {
        case '.lua':
        case '.json':

          const codeContentBuffer = await Drive.get(drivePath)
          const codeContent = codeContentBuffer.toString('utf-8')
          
          return view.render('adminmodel/filerelease', {
            release,
            app: release.app, // On peut aussi passer l'app à la vue
            fileName: relativeFilePath,
            language: fileExtension === '.lua' ? 'lua' : 'json',
            codeContent,
          })

        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.svg':

          return response.download(drivePath)
        default:
          return response.download(drivePath, true)
      }
    } catch (error) {
      console.error(`Erreur lors du service du fichier:`, error)
      session.flash({ error: `Le fichier demandé n'a pas pu être chargé.` });
      return response.notFound('<h1>Fichier introuvable</h1>'); 
    }
  }
  /*
  public async index({ params, request, view }: HttpContextContract) {
    const items = await models[params.model].query()
      .paginate(request.input('page', 1), 5)
    return view.render('adminmodel/index', {
      model: params.model,
      items: items.map((val) => val.toJSON())
    })
  }

  public async create({ params, view }: HttpContextContract) {
    const fields: string[] = []
    models[params.model].$columnsDefinitions.forEach((val) => {
      if (val.isPrimary) return
      fields.push(val.columnName)
    })

    return view.render('adminmodel/create', {
      model: params.model,
      fields
    })
  }

  public async createProcess({ params, response, request }: HttpContextContract) {
    const data = request.body()

    const file = request.file('file')
    if (file) {
      const filename = randomBytes(8).toString('hex') + (file.extname ? "." + file.extname : "")
      await file.moveToDisk('/', {
        name: filename
      })
      data.file = filename
    }

    const item = await models[params.model].create(data)

    return response.redirect().toRoute('adminPanel.model.view', {
      model: params.model,
      id: item.$getAttribute("id"),
    })
  }

  public async injectProcess({ params, response, request }: HttpContextContract) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = request.input("data")
    for (const entry of data) {
      if (entry.id) await models[params.model].updateOrCreate({ id: entry.id }, entry)
      else await models[params.model].create(entry)
    }

    return response.status(201)
  }

  public async view({ params, view }: HttpContextContract) {
    const item = await models[params.model].query()
      .where('id', params.id)
      .firstOrFail()

    return view.render('adminmodel/view', {
      model: params.model,
      item: item.toJSON()
    })
  }

  public async update({ params, view }: HttpContextContract) {
    const item = await models[params.model].query()
      .where('id', params.id)
      .firstOrFail()

    return view.render('adminmodel/update', {
      model: params.model,
      item: item.toJSON(),
      id: params.id,
    })
  }

  public async updateProcess({ bouncer, params, response, request }: HttpContextContract) {
    const body = request.body()
    const item = await models[params.model].query()
      .where('id', params.id)
      .firstOrFail()

    // If user is editing a User, change the authorize rule (custom rule for user editing)
    if (!process.env.UNSAFE_ADMIN_PANEL) {
      if (params.model == "User") {
        await bouncer.authorize('editUserOnAdminPanel', item)
      } else {
        await bouncer.authorize('editModelOnAdminPanel', item)
      }
    }

    const file = request.file('file')
    if (file) {
      if (body.file) delete body.file // In case filename is included in main body
      await file.moveToDisk('/', {
        name: item.$getAttribute('file'),
      })

      //Invalidate cloudflare cache
      if (process.env.CLOUDFLARE_TOKEN) cf_invalidate(await Drive.getUrl(item.$getAttribute('file')))

    }

    // Convert keys case (dirty)
    for (const key of Object.keys(body)) {
      if (key.indexOf("_") != -1) {
        let index = 0
        let newkey = key
        while ((index = newkey.indexOf("_", index)) != -1) {
          console.log(index)
          newkey = newkey.replace("_" + key[index + 1], key[index + 1].toUpperCase())
        }
        body[newkey] = body[key]
      }
    }

    await Object.assign(item, body).save()

    return response.redirect().toRoute('adminPanel.model.view', {
      model: params.model,
      id: params.id,
    })
  }

  public async deleteProcess({ bouncer, params, response }: HttpContextContract) {
    const item = await models[params.model].query()
      .where('id', params.id)
      .firstOrFail()

    // If user is editing a User, change the authorize rule (custom rule for user editing)
    if (!process.env.UNSAFE_ADMIN_PANEL) {
      if (params.model == "User") {
        await bouncer.authorize('editUserOnAdminPanel', item)
      } else {
        await bouncer.authorize('editModelOnAdminPanel', item)
      }
    }

    await item.delete()
    return response.redirect().toRoute('adminPanel.model.index', {
      model: params.model
    })
  }*/
}
/*
async function cf_invalidate(path: string) {
  axios.post('https://api.cloudflare.com/client/v4/zones/' + process.env.CLOUDFLARE_ZONE + '/purge_cache', {
    files: [
      process.env.ACCESS_ADDRESS + path
    ]
  }, {
    headers: {
      Authorization: 'Bearer ' + process.env.CLOUDFLARE_TOKEN,
      "Content-Type": "application/json"
    }
  })
    .then((data) => {
      if (!data.data.success) {
        console.error("Error while wiping the cloudflare cache")
        console.error(data.data.errors)
      }
    }, (reason) => {
      console.error("Error while wiping the cloudflare cache")
      console.error(reason)
    })
}*/
