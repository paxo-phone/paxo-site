import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"
import Device from 'App/Models/Device'

export default class UsersController {
  public async register({ view, auth, response }: HttpContextContract) {
    if (await auth.check()) { return response.redirect().toRoute('users.dashboard') }
    return view.render('users/register')
  }

  public async store({ auth, request, response, session }: HttpContextContract) {
    const validator = schema.create({
      username: schema.string({}, [
        rules.regex(/^[a-zA-Z0-9_\.]+$/),  // Letters, numbers, _ and .
        rules.unique({ table: 'users', column: 'username' }),
        rules.minLength(3)
      ]),
      email: schema.string({}, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email' })
      ]),
      password: schema.string({}, [
        rules.confirmed()
      ])
    })
    const data = await request.validate({ schema: validator })

    const user = await User.create(data)
    await auth.use('web').loginViaId(user.id)

    session.flash({ success: 'Account created successfully. Welcome!' })

    return response.redirect().toRoute('users.dashboard')
  }

  public async login({ view, auth, request, response }: HttpContextContract) {
    const deviceToken: string = request.cookie('DEVICE_TOKEN')
    if (deviceToken) { await Device.performDeviceAuth(deviceToken, auth, request.header('User-Agent')) }

    if (await auth.check()) {
      let redirection = request.input('to')
      return redirection ? response.redirect().toPath(redirection) : response.redirect().toRoute('users.dashboard')
    }

    return view.render('users/login')
  }

  public async loginProcess({ auth, request, response, session }: HttpContextContract) {
    const uid = request.input('uid')
    const password = request.input('password')

    try {
      await auth.use('web').attempt(uid, password)
      await Device.postLogin(request.cookie('DEVICE_TOKEN'), response.cookie, request.header('User-Agent'))
      session.flash({ success: 'Logged in successfully' })

      let redirection = request.input('to')
      return redirection ? response.redirect().toPath(redirection) : response.redirect().toRoute('users.dashboard')
    } catch {
      session.flash({ error: 'Invalid credentials' })
      return response.redirect().toRoute('users.login')
    }
  }

  public async logoutProcess({ auth, response, session }: HttpContextContract) {
    await auth.use('web').logout()
    session.flash({ success: 'Logged out successfully' })
    response.redirect().toRoute('users.login')
  }

  public async dashboard({ auth, view }) {
    const user = auth.use('web').user
    return view.render("users/dashboard", {
      user: user
    })
  }
}
