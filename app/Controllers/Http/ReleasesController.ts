import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Release from 'App/Models/Release'
import App from 'App/Models/App'
import path from 'path'
import GitLib from 'App/lib/git'
/*
export default class ReleasesController {

  public async manage({ params, view, auth, response }: HttpContextContract) {
    const user = auth.use('web').user
    if (!user) return // Backed by auth middleware

    const app = await App.findOrFail(params.id)

    if (app.userId !== user.id) {
      return response.redirect().toPath('/store')
    }

    const releases = await Release.query()
      .where('appId', app.id)
      .orderBy('id', 'desc')
      .exec()

    return view.render('store/myreleases', {
      app,
      releases
    })
  }

  public async download({ params, response, request }: HttpContextContract) {
    const app = await App.findOrFail(params.appid)

    let release: Release

    if (request.input('r')) {
      release = await Release.findOrFail(request.input('r'))
    } else {
      release = await Release.query()
        .where('appId', app.id)
        .orderBy('id', 'desc')
        .firstOrFail()
    }

    if (release.appId !== app.id) {
      return response.redirect().toPath('/store')
    }

    if (release.downloadLink) {
      return response.redirect().toPath(release.downloadLink)
    } else {
      const url = new URL(app.source)
      url.pathname = path.join(url.pathname, 'archive', release.commitSha + '.zip')

      return response.redirect().toPath(url.toString())
    }
  }

  public async source({ params, response, request }: HttpContextContract) {
    const app = await App.findOrFail(params.appid)

    if (request.input('r')) {
      const release = await Release.findOrFail(request.input('r'))
      if (release.appId !== app.id) {
        return response.redirect().toPath('/store')
      }

      const url = new URL(app.source)
      url.pathname = path.join(url.pathname, '/tree', release.commitSha)
      return response.redirect(url.toString())
    }

    return response.redirect().toPath(app.source)
  }

  public async changelog({ params, response }: HttpContextContract) {
    const app = await App.findOrFail(params.appid)

    const release = await Release.findOrFail(params.relid)

    if (release.appId !== app.id) {
      return response.redirect().toPath('/store')
    }

    if (!release.changelog) {
      return response.redirect().toPath('/store')
    }

    return response.redirect(release.changelog)
  }

  public async new({ params, auth, response, view }: HttpContextContract) {
    const user = auth.use('web').user
    if (!user) return // Backed by auth middleware

    const app = await App.findOrFail(params.id)

    if (app.userId !== user.id) {
      return response.redirect().toPath('/store')
    }

    const branches = await GitLib.safeListBranches(app.source)

    return view.render('store/newrelease', {
      app,
      branches
    })
  }

  public async create({ params, auth, response, request, session }: HttpContextContract) {
    const user = auth.use('web').user
    if (!user) return // Backed by auth middleware

    const app = await App.findOrFail(params.id)

    if (app.userId !== user.id) {
      return response.redirect().toPath('/store')
    }

    let commitSha: string
    if (request.input('branch')) {
      commitSha = await GitLib.getRefHeadCommit(app.source, "heads/" + request.input('branch'))
    } else {
      commitSha = request.input('commit')

      if (!commitSha || !/^[0-9a-f]{40}$/.test(commitSha)) {
        session.flash({ error: 'Please input a valid and complete commit SHA1' })
        return response.redirect().back()
      }
    }

    if (!commitSha || !/^[0-9a-f]{40}$/.test(commitSha)) {
      session.flash({ error: 'Unable to get head commit' })
      return response.redirect().back()
    }

    const rel = await Release.create({
      appId: app.id,
      commitSha: commitSha,
      name: request.input('name'),
      changelog: request.input('changelog'),
      downloadLink: "" // not implemented yet
    })

    await rel.save()

    return response.redirect().toPath(`/store/app/${app.id}/releases/manage`)
  }

}*/