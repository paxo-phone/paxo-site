import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ReleaseStatus } from 'App/Models/Release' // On importe l'enum pour la valeur par défaut

export default class extends BaseSchema {
  protected tableName = 'releases'

  public async up() {
    // On utilise createTable pour créer la nouvelle table
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // La clé étrangère qui lie cette release à une application
      // onDelete('CASCADE') signifie que si une App est supprimée, toutes ses releases le seront aussi. C'est une bonne pratique.
      table.integer('app_id').unsigned().references('id').inTable('apps').onDelete('CASCADE').notNullable()

      table.string('uuid').notNullable().unique()
      table.string('version').notNullable()
      table.text('notes', 'longtext').notNullable() // Les notes de version peuvent être longues
      
      // On stocke le statut comme une chaîne de caractères, avec une valeur par défaut
      table.string('status').notNullable().defaultTo(ReleaseStatus.PENDING)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
