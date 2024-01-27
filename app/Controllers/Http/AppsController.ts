import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App, { AppCategory } from '../../Models/App'

export default class AppsController {
  public async index({ view }: HttpContextContract) {
    return view.share({
      appCategories: [
        AppCategory.COMMUNICATION, AppCategory.GAMES, AppCategory.OTHER, AppCategory.UTILITIES
      ]
    }).render('apps/index')
  }

  public async show({ view, params }: HttpContextContract) {
    const app = await App.query()
      .where('id', params.id)
      .preload('author')
      .firstOrFail()

    return view.share({ app }).render('apps/product')
  }
}
