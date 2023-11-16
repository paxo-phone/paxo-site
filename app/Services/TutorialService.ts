import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tutorial from 'App/Models/Tutorial'

export class TutorialService {
  private fields: Array<string> =
    ['id', 'name', 'description', 'content', 'createdAt', 'updatedAt']
  private updateFields: Array<string> = ['name', 'description', 'content']

  public async create(request: HttpContextContract['request']) {
    const data = request.all()

    const tutorial = await Tutorial.create(data)
    await tutorial.save()
    return tutorial
  }

  public getCreateFields() {
    return {
      name: 'Lorem ipsum...',
      description: 'Lorem ipsum...',
      content: '# Lorem ipsum'
    }
  }

  public async read(id: number, isForEditing: boolean = false) {
    const tutorial = await Tutorial.find(id)
    return tutorial?.serialize({
      fields: isForEditing ? this.updateFields : this.fields,
    })
  }

  /**
   * Returns all tutorials serialized and paginated.
   */
  public async readAll() {
    const tutorials = await Tutorial.query().paginate(1) // TODO: change the number of tutos/page
    return tutorials.serialize({
      fields: this.fields,
    })
  }

  public async update(id: number, request: HttpContextContract['request']) {
    const tutorial = await Tutorial.findOrFail(id)
    const data = request.all()

    Object.entries(data).forEach(([key, value]) => {
      tutorial[key] = value
    })

    await tutorial.save()
  }

  public async delete(id: number) {
    const tutorial = await Tutorial.findOrFail(id)
    await tutorial.delete()
  }
}
