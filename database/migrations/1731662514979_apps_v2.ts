import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'apps'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('image', 'releases')
      table.string('source', 300).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('image', 300).nullable()
      table.string('releases', 300).nullable()
      table.dropColumn('source')
    })
  }
}
