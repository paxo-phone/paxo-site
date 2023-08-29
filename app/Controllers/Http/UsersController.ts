import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User"
import Device from 'App/Models/Device'
import { DateTime } from 'luxon'

export default class UsersController {
  public async register({ view, auth, response }: HttpContextContract) {
    if (await auth.check()) { return response.redirect().toRoute('users.dashboard') }
    return view.render('users/register')
  }

  public async store({ request, response, session }: HttpContextContract) {
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

    /*const user =*/ await User.create(data)

    // If you prefer to login after register
    //await auth.use('web').loginViaId(user.id)
    //session.flash({ success: 'Account created successfully. Welcome!' })
    //return response.redirect().toRoute('users.dashboard')

    session.flash({ success: 'Account created successfully.' })
    return response.redirect().toRoute('users.login')
  }

  public async login({ view, auth, request, response }: HttpContextContract) {
    const deviceToken: string = request.cookie(Device.COOKIE_TOKEN)
    if (deviceToken) {
      if (!await Device.performDeviceAuth(deviceToken, auth, request.header('User-Agent'))) { response.clearCookie(Device.COOKIE_TOKEN) }
    }

    if (await auth.check()) {
      let redirection = request.input('to')
      return redirection ? response.redirect().toPath(redirection) : response.redirect().toRoute('users.dashboard')
    }

    return view.render('users/login')
  }

  public async loginProcess({ auth, request, response, session }: HttpContextContract) {
    const uid = request.input('uid')
    const password = request.input('password')
    const remember_me = request.input('remember_me')

    try {
      await auth.use('web').attempt(uid, password)
      if (remember_me) {
        let newToken = await Device.postLogin(request.cookie(Device.COOKIE_TOKEN), request.header('User-Agent'), auth.user?.id)
        if (newToken) { response.cookie(Device.COOKIE_TOKEN, newToken, { expires: DateTime.now().plus({ days: 90 }).toBSON() }) }
      }
      session.flash({ success: 'Logged in successfully' })

      let redirection = request.input('to')
      return redirection ? response.redirect().toPath(redirection) : response.redirect().toRoute('users.dashboard')
    } catch {
      session.flash({ error: 'Invalid credentials' })
      return response.redirect().toRoute('users.login')
    }
  }

  public async logoutProcess({ auth, request, response, session }: HttpContextContract) {
    const token = request.cookie(Device.COOKIE_TOKEN)
    try {
      if (token) {
        await (await Device.getDeviceFromToken(token)).delete()
        response.clearCookie(Device.COOKIE_TOKEN)
      }
    } catch { }
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
