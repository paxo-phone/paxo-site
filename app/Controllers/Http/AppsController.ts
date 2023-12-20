import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App from 'App/Models/App'

export default class AppsController {
  public async index({ view }: HttpContextContract) {
    return view.share({ trending_apps }).render('apps/index')
  }

  public async show({ view, params }: HttpContextContract) {
    const app = await App.query()
      .where('id', params.id)
      .preload('author')
      .firstOrFail()

    return view.share({ app }).render('apps/product')
  }
}

// Clocks variables
export const trending_apps: App[][] = []
