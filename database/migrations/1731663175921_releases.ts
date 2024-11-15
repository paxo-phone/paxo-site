import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'releases'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')


      table.integer('app_id')
        .references('apps.id')
        .onDelete('CASCADE')

      table.string('commit_sha', 40)
      table.string('download_link').nullable()

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
