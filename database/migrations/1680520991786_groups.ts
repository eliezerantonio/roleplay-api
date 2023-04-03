import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Groups extends BaseSchema {
  protected tableName = 'groups'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable()
      table.string('description').notNullable()
      table.string('chronic').notNullable()
      table.string('schedule').notNullable()
      table.string('location').notNullable()
      table.integer('master').unsigned().references('id').inTable('users').notNullable()

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
