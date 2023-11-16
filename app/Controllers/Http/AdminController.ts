import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminController {
  private MODELS: Array<string> = [
    'users',
    'pressArticles',
    'projects',
    'tutorials',
  ]

  public async index({ bouncer, view }: HttpContextContract) {
    await this.checks(bouncer)

    return view.render('admin/index', {
      models: this.MODELS,
    })
  }

  private async checks(bouncer: HttpContextContract['bouncer']) {
    if (process.env.UNSAFE_ADMIN_PANEL) return
    await bouncer.authorize('viewAdminPanel')
  }
}
