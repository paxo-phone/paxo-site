import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import RegisterValidator from 'App/Validators/RegisterValidator'
import { ValidationException } from '@ioc:Adonis/Core/Validator'


export default class UsersController {
  public async register({ view }: HttpContextContract) {
    return view.render('auth/register')
  }
  
  public async registerProcess({ auth, request, response, session }: HttpContextContract) {
    const validator = new RegisterValidator()
    const data = await request.validate({
      schema: validator.schema,
      messages: validator.messages,
    })

    const user = await User.create(data)
    await auth.login(user)
    
    session.flash({ success: 'Votre compte a été créé avec succès !' })
    return response.redirect().toRoute('dash')
  }



  public async login({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public async loginProcess({ auth, request, response, session }: HttpContextContract) {
    const login = request.input('login')
    const password = request.input('password')

    try {
      const user = await auth.verifyCredentials(login, password)
      await auth.login(user)
      response.redirect().toRoute("dash")
    } catch {
      session.flash({ error: 'Invalid credentials' })
      response.redirect().toRoute('auth.login')
    }
  }

  public async logoutProcess({ auth, response, session }: HttpContextContract) {
    await auth.logout()
    session.flash({ success: 'Log out successfully' })
    response.redirect().toRoute("/")
  }

}
