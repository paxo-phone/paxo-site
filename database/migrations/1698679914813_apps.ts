import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { AppCategory } from 'App/Models/App'

export default class extends BaseSchema {
  protected tableName = 'apps'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('owner_id')
        .unsigned()
        .references('users.github_id')
        .onDelete('CASCADE')

      table.integer('repo_id').notNullable()
      table.string('name', 100).notNullable().defaultTo("")
      table.string('desc', 350).nullable().defaultTo("")
      table.integer('repo_stars').defaultTo(0)

      table.enum('category', Object.values(AppCategory)).notNullable()
      table.bigint("downloads").unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
