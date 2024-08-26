import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { models } from './AdminModelController'
import JWT from 'App/lib/jwt'
import User from 'App/Models/User'

export default class AdminController {
  public async index({ bouncer, view }: HttpContextContract) {
    await AdminController.checks(bouncer)

    return view.render('admin/index', {
      models: Object.keys(models),
    })
  }

  public async confirmRegister({ request, response, session, view, bouncer }: HttpContextContract) {
    await AdminController.checks(bouncer)

    let user_object
    try {
      user_object = JWT.verify(request.input('user_object'))
    } catch {
      session.flash({ error: 'Invalid confirmation token' })
      return response.redirect().back()
    }

    return view.render('admin/confirm_register', {
      user_object
    })
  }

  public async confirmRegisterProcess({ request, response, session, bouncer }: HttpContextContract) {
    await AdminController.checks(bouncer)
    const user = await User.create(request.body())

    session.flash({ success: `User ${user.name} successfully created` })
    return response.redirect().toRoute('adminPanel.index')
  }

  public static async checks(bouncer: HttpContextContract['bouncer']) {
    if (process.env.UNSAFE_ADMIN_PANEL) return
    await bouncer.authorize('adminPanel')
  }
}
