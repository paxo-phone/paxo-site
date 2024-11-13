import BaseSchema from '@ioc:Adonis/Lucid/Schema'

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

      table.string('name', 100).notNullable().defaultTo("")
      table.string('desc', 350).nullable().defaultTo("")
      table.string('source_url', 300).nullable()
      table.string('image', 300).nullable()
      table.string('path', 300).nullable()

      table.smallint('category').notNullable()
      table.bigint("downloads").unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
