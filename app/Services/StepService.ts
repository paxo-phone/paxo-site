import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Step from 'App/Models/Step'

export class StepService {
  private fields: Array<string> =
    ['id', 'name', 'content', 'videoUrl', 'stepIndex', 'tutorial', 'createdAt', 'updatedAt']
  private updateFields: Array<string> = ['name', 'content', 'videoUrl', 'stepIndex']

  public async create (request: HttpContextContract['request']) {
    const data = request.all()

    let step = await Step.create(data)
    await step.save()
    return step
  }

  public getCreateFields () {
    return {
      name: 'Lorem ipsum...',
      content: 'Lorem ipsum...',
      videoUrl: 'https://example.com',
      stepIndex: '0...',
      tutorial_id: '0...',
    }
  }

  public async read (id: number, isForEditing: boolean = false) {
    const step = await Step.find(id)
    return step?.serialize({
      fields: isForEditing ? this.updateFields : this.fields,
    })
  }

  /**
   * Returns all tutorials serialized and paginated.
   */
  public async readAll () {
    let steps = await Step.query().paginate(1) // TODO: change the number of steps/page
    return steps.serialize({
      fields: this.fields,
    })
  }

  public async update (id: number, request: HttpContextContract['request']) {
    let step = await Step.findOrFail(id)
    const data = request.all()

    Object.entries(data).forEach(([key, value]) => {
      step[key] = value
    })

    await step.save()
  }

  public async delete (id: number) {
    const step = await Step.findOrFail(id)
    await step.delete()
  }
}
