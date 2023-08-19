import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminController {
  public async index({ bouncer, view }: HttpContextContract) {
    await this.checks(bouncer)

    return view.render('admin/index')
  }

  private async checks(bouncer: HttpContextContract['bouncer']) {
    await bouncer.authorize('viewAdminPanel')
  }
}
