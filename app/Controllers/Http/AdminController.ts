import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { models } from './AdminModelController'

export default class AdminController {
  public async index({ bouncer, view }: HttpContextContract) {
    await this.checks(bouncer)

    return view.render('admin/index', {
      models: Object.keys(models),
    })
  }

  private async checks(bouncer: HttpContextContract['bouncer']) {
    if (process.env.UNSAFE_ADMIN_PANEL) return
    await bouncer.authorize('viewAdminPanel')
  }
}
