import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { randomBytes } from 'node:crypto'
import Drive from '@ioc:Adonis/Core/Drive'
import axios from "axios"

/*import Tutorial from 'App/Models/Tutorial'
import PressArticle from 'App/Models/PressArticle'
import Project from 'App/Models/Project'
import File from 'App/Models/File'*/
import Review from 'App/Models/App'


export const models: { [key: string]: LucidModel } = { // Models available in the admin panel
  /*Tutorial,
  PressArticle,
  Project,
  File*/
  Review
} 

export default class AdminModelController {
   public async review({ view, params, session, response }: HttpContextContract) {
    try {
      const appsToReview = await Review.query() // Review est un alias pour App
        .where('review', 0) // Cherche les applications où review est false (0)
        .preload('author')
        .orderBy('created_at', 'asc');

      return view.render('adminmodel/review', {
        model: params.model,
        items: appsToReview,
      });
    } catch (error) {
      // Retourner une vue d'erreur ou un message approprié
      session.flash({ error: 'Une erreur est survenue lors du chargement des applications à valider.' });
      return response.redirect().back(); // Ou vers une page d'erreur
    }
  }

  public async reviewApp({ view, params,session }: HttpContextContract) {
    console.log('[POINT DE CONTRÔLE B] --- Entrée dans la méthode reviewApp ---');
    try{
      console.log(`[POINT DE CONTRÔLE C] --- Entrée dans le bloc try, recherche de l'ID: ${params.id} ---`);
      const app = await Review.findOrFail(params.id);
      // findOrFail est parfait : il trouve l'app ou renvoie une erreur 404
      // 2. On précharge les relations dont on pourrait avoir besoin (ex: l'auteur)
      await app.load('author');

      // 3. On rend la nouvelle vue 'reviewapp.edge' en lui passant l'application
      return view.render('adminmodel/reviewapp', {
        model: params.model, // Pour les titres et les futures routes
        app: app,            // L'objet contenant les détails de l'app
      });
    }
    catch (error) {
      // Gérer l'erreur si l'application n'est pas trouvée
      console.error('[POINT DE CONTRÔLE D] --- ERREUR ATTRAPÉE ---', error);
      session.flash({ error: "Une erreur est survenue lors du chargement de l'applications." });
      return view.render('errors/not_found'); // Afficher une page d'erreur 404
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
