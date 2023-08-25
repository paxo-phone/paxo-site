import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tutorials'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.string('description')
      table.string('end_title')
      table.string('end_text')
      table.string('end_gif').defaultTo('https://media2.giphy.com/media/cQNRp4QA8z7B6/giphy.gif?cid=ecf05e47ohjkohlyjituly1p8eksruightei9lq4e60ghwoz&ep=v1_gifs_search&rid=giphy.gif&ct=g')
      table.integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
