import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GroupRequests extends BaseSchema {
  protected tableName = 'groups_requests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('group_id').unsigned().references('id').inTable('users').notNullable()
      table.enum('status', ['PENDING', 'ACCEPTED']).defaultTo('PENDING').notNullable()

      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
