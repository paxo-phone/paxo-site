import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export class UserService {
  private fields: Array<string> = ['id', 'username', 'email', 'type', 'createdAt', 'updatedAt']
  private updateFields: Array<string> = ['username', 'email']

  public async create (request: HttpContextContract['request']) {
    const data = request.all()
    let user = await User.create(data)
    await user.save()
    return user
  }

  public getCreateFields () {
    return {
      username: '@username',
      email: 'user.name@example.com',
      password: '',
    }
  }

  public async read (id: number, isForEditing: boolean = false) {
    const user = await User.findOrFail(id)
    return user?.serialize({
      fields: isForEditing ? this.updateFields : this.fields,
    })
  }

  /**
   * Returns all projects serialized (except password and rememberMeToken) and paginated.
   */
  public async readAll () {
    const users = await User.query().paginate(1) // TODO: change the number of users/page
    return users.serialize({
      fields: this.fields,
    })
  }

  public async update (id: number, request: HttpContextContract['request']) {
    let user = await User.findOrFail(id)
    const data = request.body()

    Object.entries(data).forEach(([key, value]) => {
      user[key] = value
    })

    await user.save()
  }

  public async delete (id: number) {
    const user = await User.findOrFail(id)
    await user.delete()
  }
}
