import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import App, { AppCategory } from '../../Models/App'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class AppsController {
  public async index({ view, params, request }: HttpContextContract) {
    const query = request.qs()["query"]
    const cat: number = params['category']
    let apps: App[]

    if (query) {
      apps = await App.query()
        .orderBy("downloads", "desc")
        .orWhereLike("name", `%${query}%`)
        .orWhereLike("desc", `%${query}%`)
        .limit(15)
    } else {
      const q = App.query()
        .orderBy("downloads", "desc")
        .limit(15)

      if (cat) {
        q.where('category', cat)
      }

      apps = await q
    }

    return view.share({
      appCategories: [
        AppCategory.PRODUCTIVITY,
        AppCategory.UTILITIES,
        AppCategory.COMMUNICATION,
        AppCategory.GAMES,
        AppCategory.MULTIMEDIA,
        AppCategory.OTHER
      ],
      category: cat,
      apps,
      query
    }).render('apps/index')
  }

  public async show({ view, params }: HttpContextContract) {
    const app = await App.query()
      .where('id', params.id)
      .preload('author')
      .firstOrFail()

    return view.share({ app }).render('apps/product')
  }

  public async create({view}: HttpContext) {
    return view.render('apps/create')
  }

  public async createProcess() {
    const data = request.body()
    const imgUrl = ""
    const img = request.file('img')

    if (img) {
      const filename = img.filename + string.generateRandom(8) + (img.extname ? "." + img.extname : "")
      await img.moveToDisk('/appicons', {
        name: filename
      })
      imgUrl = process.env.ACCESS_ADDRESS + "/uploads/appicons/" + filename
    }

    let newApp = App.create({
      userId: 1, // auth.user.id
      name: data.name,
      desc: data.desc,
      image: data.image,
      source_url: data.source_url,
      release : data.release,
      category: data.categories
    })
  }
}

