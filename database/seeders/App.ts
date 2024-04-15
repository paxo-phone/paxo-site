import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import App, {AppCategory} from 'App/Models/App'

export default class extends BaseSeeder {
  public async run () {
    const app = await App.create({
      userId: 1, 
      name: "test app",
      desc: "test app descr",
      releases: "0.1.0",
      source_url: "https://github.com/paxo-phone/paxo-site",
      category: AppCategory.OTHER,
    })
    app.save()
  }
}
