import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Octokit } from '@octokit/core'
import App from 'App/Models/App'
import { createAppAuth } from "@octokit/auth-app"
import { readFileSync } from "node:fs"

export default class AppsController {
  public async index({ view }: HttpContextContract) {
    return view.share({ trending_apps }).render('apps/index')
  }

  public async show({ view, params, response }: HttpContextContract) {
    const app = await App.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    if (app.updatedAt.diffNow().minutes >= 60) {
      const new_app = await updateAppDetails(app)

      if (new_app) return view.share({ new_app }).render('apps/product')
      else return response.abort("Resource not found", 404)
    } else {
      return view.share({ app }).render('apps/product')
    }
  }
}

// App details refreshing
let octokit: Octokit

async function createOctokit() {
  if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY_PATH) {
    const auth = createAppAuth({
      appId: process.env.GITHUB_APP_ID,
      privateKey: readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH).toString(),
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })

    // Retrieve JSON Web Token (JWT) to authenticate as app
    const appAuthentication = await auth({ type: "app" })
    console.log(appAuthentication)

    octokit = new Octokit({
      auth: appAuthentication.token
    })
  } else {
    octokit = new Octokit()
  }
}

export async function updateAppDetails(app: App) {
  if (!octokit) await createOctokit()

  const res = await octokit.request('GET /repositories/{repository_id}', {
    repository_id: app.repoId
  })

  if (res.status == 404) {
    await app.delete()
    return null
  } else if (res.status != 200) {
    return null
  }

  app.name = res.data.name
  app.desc = res.data.description
  app.repoStars = res.data.stargazers_count
  return await app.save()
}

// Clocks variables
export const trending_apps: App[][] = []
