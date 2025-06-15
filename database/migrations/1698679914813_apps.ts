import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { AppCategory } from 'App/Models/App'

export default class extends BaseSchema {
  protected tableName = 'apps'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id')
        .index()
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')

      table.uuid('uuid').notNullable().unique()
      table.string('name', 100).notNullable().defaultTo("")
      table.string('desc', 500).nullable().defaultTo("")
      table.smallint('category').notNullable()
      table.bigint("downloads").unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
