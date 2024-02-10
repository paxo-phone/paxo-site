import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App, { AppCategory } from '../../Models/App'

export default class AppsController {
  public async index({ view, params }: HttpContextContract) {
    return view.share({
      appCategories: [
        AppCategory.PRODUCTIVITY,
        AppCategory.UTILITIES,
        AppCategory.COMMUNICATION,
        AppCategory.GAMES,
        AppCategory.MULTIMEDIA,
        AppCategory.OTHER
      ],
      category: params['category']
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
