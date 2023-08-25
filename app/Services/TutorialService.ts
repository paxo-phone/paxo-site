import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tutorial from "App/Models/Tutorial";

export class TutorialService {
  private fields: Array<string> = ['id', 'name', 'description', 'endTitle', 'endText', 'endGif', 'user', 'createdAt', 'updatedAt']
  private updateFields: Array<string> = ['name', 'description', 'endTitle', 'endText', 'endGif']

  public async create(request: HttpContextContract['request']) {
    const data = request.all()

    let tutorial = await Tutorial.create(data)
    await tutorial.save()
    return tutorial
  }

  public getCreateFields() {
    return {
      name: "Lorem ipsum...",
      description: "Lorem ipsum...",
      endTitle: "Lorem ipsum...",
      endText: "Lorem ipsum...",
      endGif: "https://example.com",
      user_id: "0..."
    }
  }

  public async read(id: number, isForEditing: boolean = false) {
    const tutorial = await Tutorial.find(id)
    return tutorial?.serialize({
      fields: isForEditing ? this.updateFields : this.fields
    })
  }

  /**
   * Returns all tutorials serialized and paginated.
   */
  public async readAll() {
    let tutorials = await Tutorial.query().paginate(1)  // TODO: change the number of tutos/page
    return tutorials.serialize({
      fields: this.fields
    })
  }

  public async update(id: number, request: HttpContextContract['request']) {
    let tutorial = await Tutorial.findOrFail(id)
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
