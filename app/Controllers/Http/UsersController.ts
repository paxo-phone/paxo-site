import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User';
import { App, Octokit } from 'octokit';
import { readFileSync } from 'node:fs';
import JWT from '../../lib/jwt';

export const authorization_url = "https://github.com/login/oauth/authorize"
  + "?redirect_uri=" + encodeURIComponent(process.env.ACCESS_ADDRESS + "/auth/callback/")
  + "&client_id=" + process.env.GITHUB_CLIENT_ID

const githubApp = new App({
  appId: process.env.GITHUB_APP_ID ?? "",
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY ?? readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH ?? "").toString(),
  oauth: {
    clientId: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
  },
});

export default class UsersController {
  public async login({ response }: HttpContextContract) {
    return response.redirect(authorization_url)
  }

  public async callback({ request, auth, response, view }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        code: schema.string()
      }),
      messages: {
        '*': "The authentication service returned an error"
      }
    })

    const { authentication: token } = await githubApp.oauth.createToken({
      code: data.code
    })
    const octokit = new Octokit({
      auth: token.token
    })

    const { data: userdata } = await octokit.rest.users.getAuthenticated()

    const user = await User.query()
      .where('id', userdata.id)
      .first()

    if (!user) {
      const { data: emaildata } = await octokit.rest.users.listEmailsForAuthenticatedUser()
      let email: string | undefined = undefined
      for (const em of emaildata) {
        if (em.primary) {
          if (em.verified) email = em.email
          break
        }
      }

      const user_object = {
        id: userdata.id,
        name: userdata.name ?? userdata.login,
        email
      }

      // For confirmed registration
      return view.render('auth/post_register', {
        confirm_jwt: JWT.sign(user_object)
      })

      // For free registration
      // user = await User.create(user_object)
      // await user.save()
    }

    await auth.use('web').loginViaId(userdata.id)
    return response.redirect().toRoute("dash")
  }

  public async logout({ auth, response, session }: HttpContextContract) {
    await auth.use('web').logout()
    session.flash({ success: 'Log out successfully' })
    response.redirect().toRoute('apps')
  }
}
