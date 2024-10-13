import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    const user = await User.create({id: 1, username: 'test', email: 'test@example.com', password: 'password', type: 0});
    user.save()
  }
}