import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
// import EmailValidator from 'App/Validators/EmailValidator'
import RegisterValidator from 'App/Validators/PasswordValidator'
import { OauthService, OauthServiceConfig } from 'App/lib/oauth'
import JWT from 'App/lib/jwt';
import { AccountValidator, OauthRegisterChecker, OauthRegisterChecker, OauthRegisterValidator, OauthValidator } from 'App/Validators/AuthValidators';
import { format } from "util";

export default class UsersController {
  public async index({ view }: HttpContextContract) {
    return view.share({
      google_authorization: OauthServiceConfig[OauthService.GOOGLE].authorization_uri,
      github_authorization: OauthServiceConfig[OauthService.GITHUB].authorization_uri
    }).render('auth/index')
  }

  public async login({ auth, request, response, session }: HttpContextContract) {
    // const data = await request.validate(new LoginValidator())
    try {
      await auth.attempt(request.input('uid'), request.input('password'))
      response.redirect().toRoute('dash')
    } catch {
      session.flash({ error: "Invalid credentials" })
      response.redirect().back()
    }
  }

  public async register({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async store({ request, auth, response }: HttpContextContract) {
    const data = await request.validate(new RegisterValidator())
    const user = await User.create(data)

    auth.login(user)
    response.redirect().toRoute('dash')
  }

  public async oauthGoogle(ctx: HttpContextContract) { return await UsersController.oauth(OauthService.GOOGLE, ctx) }
  public async oauthGithub(ctx: HttpContextContract) { return await UsersController.oauth(OauthService.GITHUB, ctx) }

  public static async oauth(service: OauthService, { request, auth, response, session }: HttpContextContract) {
    const config = OauthServiceConfig[service]
    const input_data = await request.validate(new OauthValidator())

    const user_data = await config.getMinimalData(input_data.code)

    // Get user from database
    const user = await User
      .query()
      .where(config.column, user_data.id)
      .first()

    if (user) {
      await auth.login(user)
      return response.redirect().toRoute('dash')
    } else {
      if (config.completeProfile) await config.completeProfile(user_data)

      try {
        await request.validate(new AccountValidator({ email: user_data.profile["email"] }))
      } catch (err) {
        session.flash({ error: format(err.messages.email[0], config.name) })
        return response.redirect().toRoute('auth')
      }

      return response.redirect().withQs({
        username: user_data.username,
        oauth_profile: JWT.sign({ data: user_data.profile })
      }).toRoute('oauth.register')
    }
  }

  public async oauthRegister({ request, view }: HttpContextContract) {
    return view.share({
      username: request.input("username"),
      oauth_profile: request.input("oauth_profile")
    }).render("auth/oauth_register")
  }

  public async oauthCheck({ request }: HttpContextContract) {
    try {
      await request.validate(new OauthRegisterChecker())
      return { available: true }
    } catch {
      return { available: false }
    }
  }

  public async oauthStore({ request, auth, response }: HttpContextContract) {
    const data = await request.validate(new OauthRegisterValidator())

    const oauth_profile = JWT.verify(data.oauth_profile)
    const user = await User.create(Object.assign(oauth_profile.data, { username: data.username }))

    await auth.login(user)
    return response.redirect().toRoute('dash')
  }

  public async logout({ auth, response, session }: HttpContextContract) {
    await auth.use('web').logout()
    session.flash({ success: 'Logged out successfully' })
    response.redirect('/')
  }
}