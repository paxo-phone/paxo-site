import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserType } from 'App/Models/User'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('username', 128).notNullable().unique()
      table.string('picture', 255).nullable().unique()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).nullable()
      table.enum('type', Object.values(UserType)).defaultTo(UserType.DEFAULT)

      table.integer('github_id').unsigned().nullable().unique()
      table.bigint('google_id').unsigned().nullable().unique()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
