import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import User from "App/Models/User"
import RegisterValidator from 'App/Validators/RegisterValidator'

export default class UsersController {
  public async register({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async registerProcess({ auth, request, response, session  }: HttpContextContract) {
    try {
      console.log('TESTESTEST')
      const data = await request.validate(new RegisterValidator())
      const user = await User.create(data)
      await auth.login(user)
      session.flash('success', 'Post created successfully')
      response.redirect().toRoute("dash")
    }
    catch{
      console.log('LOG ERROR')
      session.flash({error: 'Invalid data'})
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
      response.redirect().toPath(redirectTo)
    } catch {
      session.flash({ error: 'Invalid credentials' })
      response.redirect().toRoute('auth.login')
    }
  }

  public async logoutProcess({ auth, response, session }: HttpContextContract) {
    await auth.logout()
    session.flash({ success: 'Log out successfully' })
    response.redirect('/')
  }
}
