import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app';
import { Octokit } from '@octokit/core';
import User from 'App/Models/User';

export const authorization_url = "https://github.com/login/oauth/authorize?"
  + "redirect_uri=" + encodeURIComponent(process.env.ACCESS_ADDRESS + "/auth/callback/") + "&"
  + "client_id=" + process.env.GITHUB_CLIENT_ID

const githubAuth = createOAuthAppAuth({
  clientType: "oauth-app",
  clientId: process.env.GITHUB_CLIENT_ID ?? "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
});

export default class UsersController {
  public async login({ response }: HttpContextContract) {
    return response.redirect(authorization_url)
  }

  public async callback({ request, auth, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        code: schema.string({}, [
          rules.regex(/^[a-zA-Z0-9_/-]+$/)
        ])
      }),
      messages: {
        '*': "The authentication service returned an error"
      }
    })

    const octokit = await githubAuth({
      type: 'oauth-user',
      code: data.code,
      factory: (options) => {
        return new Octokit({
          authStrategy: createOAuthUserAuth,
          auth: options,
        });
      },
    })
    const { data: userdata } = await octokit.request("GET /user")

    let user = await User.query()
      .where('id', userdata.id)
      .first()

    if (!user) { // Create the god damn user
      user = await User.create({
        id: userdata.id,
        name: userdata.name ?? userdata.login
      })
    } else { // Refresh informations
      if (user.name != (userdata.name ?? userdata.login)) {
        user.name = userdata.name ?? userdata.login
        await user.save()
      }
    }

    await auth.login(user)
    return response.redirect().toRoute("dash")
  }

  public async logout({ auth, response, session }: HttpContextContract) {
    await auth.use('web').logout()
    session.flash({ success: 'Log out successfully' })
    response.redirect().toRoute('apps')
  }
}
