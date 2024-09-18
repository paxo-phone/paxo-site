import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'press_articles'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('rank')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
