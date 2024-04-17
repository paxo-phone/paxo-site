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

  public async create({view}: HttpContextContract) {
    return view.render('apps/create')
  }

  public async createProcess({auth, request, response}: HttpContextContract) {
    const data = request.body()
    let imgUrl = ""
    const img = request.file('img')

    if(!auth.user) return response.status(403)

    if (img) {
      const filename = img.fileName + string.generateRandom(8) + (img.extname ? "." + img.extname : "")
      await img.moveToDisk('/appicons', {
        name: filename
      })
      imgUrl = process.env.ACCESS_ADDRESS + "/uploads/appicons/" + filename
    }

    let newApp = App.create({
      userId: auth.user.id,
      name: data.name,
      desc: data.desc,
      image: data.image,
      source_url: data.source_url,
      releases : data.releases,
      category: data.categories
    })
  }

  public async getAppJson({params,response}: HttpContextContract) {
    const app = await App.findOrFail(params["id"])
    return response.send(app.toJSON())
  }
}

