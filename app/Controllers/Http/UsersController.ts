import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthFlowStep } from 'App/Middleware/AuthFlow'

import User from "App/Models/User"
import EmailValidator from 'App/Validators/EmailValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class UsersController {
  public async index({ view }: HttpContextContract) {
    return view.render('auth/index')
  }

  public async check({ request, response }: HttpContextContract) {
    if (!request.flow) return
    const data = await request.validate(new EmailValidator())

    const user = await User
      .query()
      .where('email', data.email)
      .first()

    request.flow.email = data.email
    if (user) {
      request.flow.uid = user.id
      request.flow.progress(AuthFlowStep.LOGIN_PASSWORD, response)
    } else {
      request.flow.progress(AuthFlowStep.REGISTER_DETAILS, response)
    }
  }

  public async register({ request, view }: HttpContextContract) {
    if (!request.flow) return
    return view.render('auth/register', {
      email: request.flow.email
    })
  }

  public async store({ request, response }: HttpContextContract) {
    if (!request.flow) return
    const data = await request.validate(new RegisterValidator())

    const user = await User.create(data)
    request.flow.uid = user.id
    // TODO verify email in flow

    request.flow.progress(AuthFlowStep.COMPLETE, response)
  }

  public async login({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public async loginProcess({ auth, request, response, session }: HttpContextContract) {
    if (!request.flow) return
    const password = request.input('password')

    try {
      await auth.use('web').verifyCredentials(request.flow.email || "", password)
      request.flow.progress(AuthFlowStep.LOGIN_2FA, response)
    } catch {
      session.flash({ error: 'Invalid credentials' })
      response.redirect().back()
    }
  }

  public async complete({ auth, request, session, response }: HttpContextContract) {
    if (!request.flow) return
    request.flow.endFlow(response)

    if (request.flow.uid) {
      await auth.loginViaId(request.flow.uid)
    } else {
      session.flash({ error: "Paradox !" }) // idk what to put in there
    }
  }

  public async cancelFlow({ request, response }: HttpContextContract) {
    if (!request.flow) return
    request.flow.endFlow(response, '/auth')
  }

  public async logoutProcess({ auth, response, session }: HttpContextContract) {
    await auth.use('web').logout()
    session.flash({ success: 'Log out successfully' })
    response.redirect().toRoute('auth')
  }
}
