import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminController {
  private MODELS: Array<string> = [
    "users",
    "projects",
    "tutorials",
    "steps"
  ]

  public async index({ bouncer, view }: HttpContextContract) {
    await this.checks(bouncer)

    return view.render('admin/index', {
      models: this.MODELS
    })
  }

  private async checks(bouncer: HttpContextContract['bouncer']) {
    await bouncer.authorize('viewAdminPanel')
  }
}
