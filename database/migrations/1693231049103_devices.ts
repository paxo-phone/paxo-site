import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id")
      table.string("token", 180).notNullable().unique()
      table.integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')
      table.timestamp('latest_connexion').notNullable()
      table.string("user_agent", 128)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
