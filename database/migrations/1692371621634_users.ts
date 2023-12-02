import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id').unsigned().notNullable()
      table.string('name', 255).notNullable()

      table.boolean('verified').defaultTo(false)
      table.boolean('mod').defaultTo(false)
      table.boolean('dev').defaultTo(false)
      table.boolean('admin').defaultTo(false)

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
