import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    const user = await User.create({id: 1, name: 'test', email: 'test@example.com'})
    user.save()
  }
}
