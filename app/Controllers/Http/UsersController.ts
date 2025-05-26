import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class UsersController {
  public async register({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async registerProcess({ auth, request, response, session  }: HttpContextContract) {
    try {
      console.log('try validation')
      const data = await request.validate(new RegisterValidator())
      console.log('user validated')
      const user = await User.create(data)
      console.log('user created')
      await auth.login(user)
      console.log('registered')
      session.flash('success', 'Post created successfully')
    }
    catch{
      session.flash({error: 'Invalid registration'})
      response.redirect().toRoute('auth.register')
    }
  }


  public async login({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public async loginProcess({ auth, request, response, session }: HttpContextContract) {
    const login = request.input('login')
    const password = request.input('password')

    const redirectTo = request.input('next', '/')

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
