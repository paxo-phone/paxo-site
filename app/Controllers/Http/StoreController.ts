import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from 'App/Models/App'
import Release from 'App/Models/Release'


export default class StoreController {
  public async home({ request, view }: HttpContextContract) {
    const app_per_page = 15

    const page = request.input('page', 1)
    const cat = request.input('cat', -1)

    const pager = await App.query()
      .orderBy('downloads')
      .if(cat !== -1, (query) => {
        query.where('category', cat)
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

    if (/^(?:https:\/\/)?github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(request.input('source')) === false) {
      // TODO proper error handling
      session.flash({ error: 'Only HTTP GitHub repositories are supported (for now)' })
      return response.redirect().back()
    }

    app.name = request.input('name')
    app.desc = request.input('desc')
    app.ext_url = request.input('ext_url')
    app.source = request.input('source')
    app.category = request.input('category')

    await app.save();

    return response.redirect(`/store/app/${app.id}`)
  }

  public async new({ view }: HttpContextContract) {
    return view.render('store/new')
  }

  public async post({ auth, request, response, session }: HttpContextContract) {
    const user = auth.use('web').user

    // Should not trigger (backed by auth middleware)
    if (!user)
      return

    if (/^(?:https:\/\/)?github.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(request.input('source')) === false) {
      // TODO proper error handling
      session.flash({ error: 'Only HTTP GitHub repositories are supported (for now)' })
      return response.redirect().back()
    }

    const app = await App.create({
      name: request.input('name'),
      desc: request.input('desc'),
      ext_url: request.input('ext_url'),
      source: request.input('source'),
      category: request.input('category'),
      userId: user.id
    })

    await app.save();

    return response.redirect(`/store/app/${app.id}`)
  }
}
