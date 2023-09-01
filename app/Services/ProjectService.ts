import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Project from 'App/Models/Project'

export class ProjectService {
  private fields: Array<string> = ['id', 'name', 'description', 'link', 'createdAt', 'updatedAt']
  private updateFields: Array<string> = ['name', 'description', 'link']

  public async create (request: HttpContextContract['request']) {
    const data = request.all()

    let project = await Project.create(data)
    await project.save()
    return project
  }

  public getCreateFields () {
    return {
      name: 'Lorem ipsum...',
      description: 'Lorem ipsum...',
      link: 'https://example.com',
    }
  }

  public async read (id: number, isForEditing: boolean = false) {
    const project = await Project.find(id)
    return project?.serialize({
      fields: isForEditing ? this.updateFields : this.fields,
    })
  }

  /**
   * Returns all projects serialized and paginated.
   */
  public async readAll () {
    let projects = await Project.query().paginate(1) // TODO: change the number of projects/page
    return projects.serialize({
      fields: ['id', 'name', 'description', 'link', 'createdAt', 'updatedAt'],
    })
  }

  public async update (id: number, request: HttpContextContract['request']) {
    let project = await Project.findOrFail(id)
    const data = request.all()

    Object.entries(data).forEach(([key, value]) => {
      project[key] = value
    })

    await project.save()
  }

  public async delete (id: number) {
    const project = await Project.findOrFail(id)
    await project.delete()
  }
}
