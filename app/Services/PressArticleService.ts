import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PressArticle from 'App/Models/PressArticle'

export class PressArticleService {
  private fields: Array<string> = ['id', 'name', 'description', 'newspaper', 'link', 'imageLink', 'createdAt', 'updatedAt']
  private updateFields: Array<string> = ['name', 'description', 'newspaper', 'link', 'imageLink']

  public async create(request: HttpContextContract['request']) {
    const data = request.all()

    const pressArticle = await PressArticle.create(data)
    await pressArticle.save()
    return pressArticle
  }

  public getCreateFields() {
    return {
      title: '',
      description: '',
      newspaper: '',
      link: '',
      imageLink: ''
    }
  }

  public async read(id: number, isForEditing: boolean = false) {
    // TODO: fix bug here (doesn't returns the wanted serialized item for editing)
    const pressArticle = await PressArticle.find(id)
    return pressArticle?.serialize({
      fields: isForEditing ? this.updateFields : this.fields,
    })
  }

  /**
   * Returns all articles serialized and paginated.
   */
  public async readAll() {
    const pressArticles = await PressArticle.query().paginate(1) // TODO: change the number of articles/page
    return pressArticles.serialize({
      fields: ['id', 'name', 'description', 'newspaper', 'link', 'imageLink', 'createdAt', 'updatedAt'],
    })
  }

  public async update(id: number, request: HttpContextContract['request']) {
    const pressArticle = await PressArticle.findOrFail(id)
    const data = request.all()

    Object.entries(data).forEach(([key, value]) => {
      pressArticle[key] = value
    })

    await pressArticle.save()
  }

  public async delete(id: number) {
    const pressArticle = await PressArticle.findOrFail(id)
    await pressArticle.delete()
  }
}
