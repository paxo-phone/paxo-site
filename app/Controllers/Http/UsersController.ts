import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthFlow, AuthFlowStep } from 'App/Middleware/AuthFlow'

import User from "App/Models/User"
import EmailValidator from 'App/Validators/EmailValidator'
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class UsersController {
  public async index({ view }: HttpContextContract) {
    return view.render('auth/index')
  }

  public async check({ request, response }: HttpContextContract) {
    const data = await request.validate(new EmailValidator())
    const flow = AuthFlow.getCookie(request)

    const user = await User
      .query()
      .where('email', data.email)
      .first()

    flow.email = data.email
    if (user) {
      flow.uid = user.id
      flow.progress(AuthFlowStep.LOGIN_PASSWORD, response)
    } else {
      flow.progress(AuthFlowStep.REGISTER_DETAILS, response)
    }
  }

  public async register({ request, view }: HttpContextContract) {
    const flow = AuthFlow.getCookie(request)
    return view.render('auth/register', {
      email: flow.email
    })
  }

  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate(new RegisterValidator())
    const flow = AuthFlow.getCookie(request)

    const user = await User.create(data)
    flow.uid = user.id
    // TODO verify email in flow

    flow.progress(AuthFlowStep.COMPLETE, response)
  }

  public async login({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public async loginProcess({ auth, request, response, session }: HttpContextContract) {
    const flow = AuthFlow.getCookie(request)
    const password = request.input('password')

    try {
      await auth.use('web').verifyCredentials(flow.email || "", password)
      flow.progress(AuthFlowStep.COMPLETE, response)
    } catch {
      session.flash({ error: 'Invalid credentials' })
      response.redirect().back()
    }
  }

  public async complete({ auth, request, session, response }: HttpContextContract) {
    const flow = AuthFlow.getCookie(request)
    flow.endFlow(response)

    if (flow.uid) {
      await auth.loginViaId(flow.uid)
    } else {
      session.flash({ error: "Paradox !" }) // idk what to put in there
    }
  }

  public async logoutProcess({ auth, response, session }: HttpContextContract) {
    await auth.use('web').logout()
    session.flash({ success: 'Log out successfully' })
    response.redirect().toRoute('auth')
  }
}
