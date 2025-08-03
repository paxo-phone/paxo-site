import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { v4 as uuidv4 } from 'uuid'
import App from 'App/Models/App'
import Release, { ReleaseStatus } from 'App/Models/Release'
import { schema } from '@ioc:Adonis/Core/Validator'
import { DateTime } from 'luxon'

import Extract from 'extract-zip'
import fs from 'fs/promises'
import fg from 'fast-glob'

import GitHubAppService from 'App/Services/GitHubAppService' 

import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'
import path from 'path'

export default class ReleasesController {

  public async create({ view, params }: HttpContextContract) {
    const app = await App.findOrFail(params.id)
    return view.render('releases/create', { app })
  }

  /**
   * Gère la soumission du formulaire pour une nouvelle version.
   */
  public async store({ request, params, response, session, auth }: HttpContextContract) {
    const appId = params.id
    const user = auth.user!
    const releaseUuid = uuidv4()
    const localWorkingDirectory = Application.tmpPath(`extraction_release_${releaseUuid}`)

    try {
      const app = await App.findOrFail(appId)
      if (app.userId !== user.id) {
        session.flash({ error: "Vous n'êtes pas autorisé à mettre à jour cette application." })
        return response.redirect().toPath('/')
      }

      // 1. Valider le fichier ZIP
      const newReleaseSchema = schema.create({
        app_zip: schema.file({
          size: '10mb',
          extnames: ['zip'],
        }),
      })
      const payload = await request.validate({ schema: newReleaseSchema })

      // 2. Extraire ZIP
      await fs.mkdir(localWorkingDirectory, { recursive: true })
      await payload.app_zip.move(localWorkingDirectory, { name: 'source.zip' })
      const zipFilePath = path.join(localWorkingDirectory, 'source.zip')
      await Extract(zipFilePath, { dir: localWorkingDirectory })
      await fs.unlink(zipFilePath)

      //3. 
      let finalAppDirectory = localWorkingDirectory
      const extractedItems = await fs.readdir(localWorkingDirectory)
      if (extractedItems.length === 1) {
        const singleItemPath = path.join(localWorkingDirectory, extractedItems[0])
        if ((await fs.stat(singleItemPath)).isDirectory()) {
          finalAppDirectory = singleItemPath
        }
      }
      //4. 
      const filesToUpload = await fg('**/*', { cwd: finalAppDirectory, onlyFiles: true })
      for (const file of filesToUpload) {
        const localFilePath = path.join(finalAppDirectory, file)
        const drivePath = `releases/${releaseUuid}/${file}`
        await Drive.put(drivePath, await fs.readFile(localFilePath))
      }

      //5.
      const newRelease = new Release()
      newRelease.appId = appId
      newRelease.uuid =  releaseUuid
      newRelease.status = ReleaseStatus.PENDING
      newRelease.version = `Update-${DateTime.now().toFormat('yyyy-LL-dd_HH-mm')}`
      newRelease.notes = 'Mise à jour des fichiers de l\'application.'

      await newRelease.save()
      await newRelease.load('app', (appQuery) => {
        appQuery.preload('author')
      })

      // 6. 
      await GitHubAppService.commitNewRelease(newRelease, finalAppDirectory)
         .catch(err => console.error("Erreur non bloquante dans le backup de la release:", err));
      
      session.flash({ success: 'Nouvelle version soumise avec succès pour validation !' })
      // On redirige vers la page de gestion de l'app
      return response.redirect().toRoute('StoreController.myapp', { id: appId })

    } catch (error) {
      console.error("Erreur lors de la soumission de la release :", error.messages || error)
      session.flash({ error: "Une erreur est survenue. Veuillez vérifier le fichier et réessayer." })
      return response.redirect().back()
    }
  }
}
/*
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
}
*/
