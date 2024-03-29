import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LinkTokens extends BaseSchema {
  protected tableName = 'link_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('token', 225).notNullable().unique()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
