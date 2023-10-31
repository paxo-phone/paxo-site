import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserElevation } from 'App/Models/User'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').unsigned().notNullable()

      table.boolean('verified').defaultTo(false)
      table.enum('elevation', Object.values(UserElevation)).defaultTo(UserElevation.DEFAULT)

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
