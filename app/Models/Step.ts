import { DateTime } from 'luxon'
import {BaseModel, BelongsTo, belongsTo, column} from '@ioc:Adonis/Lucid/Orm'
import Tutorial from "App/Models/Tutorial";

export default class Step extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public content: string

  @column()
  public videoUrl: string

  @column()
  public stepIndex: number

  @belongsTo(() => Tutorial)
  public tutorial: BelongsTo<typeof Tutorial>

  @column()
  public tutorialId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public async getLink(direction: string) {
    switch (direction) {
      case "+":
        const length = await Step
          .query()
          .where('tutorial_id', this.tutorialId)
          .then((data) => data.length)

        if (this.stepIndex + 1 >= length) {
          return `onclick=location.href='/tutorials/t/${this.tutorialId}/end'`
        }

        return `hx-get=/tutorials/t/${this.tutorialId}/view?index=${this.stepIndex + 1}`

      case "-":
        if (this.stepIndex - 1 <= -1) {
          return `onclick=location.href='/tutorials/t/${this.tutorialId}'`
        }

        return `hx-get=/tutorials/t/${this.tutorialId}/view?index=${this.stepIndex - 1}`
    }
  }

  public async getMessage(direction: string) {
    switch (direction) {
      case "+":
        const length = await Step
          .query()
          .where('tutorial_id', this.tutorialId)
          .then((data) => data.length)

        if (this.stepIndex + 1 >= length) {
          return 'Terminé'
        }
        return `Etape ${this.stepIndex + 2}`

      case "-":
        if (this.stepIndex - 1 <= -1) {
          const tutorial = await Tutorial.findOrFail(this.tutorialId)
          return tutorial.name
        }

        return `Etape ${this.stepIndex}`
    }
  }
}
