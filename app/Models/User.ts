import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, beforeSave, column, hasMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import LinkToken from './LinkToken'
import Group from 'App/Models/Group'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  username: string

  @column()
  email: string

  @column({ serializeAs: null })
  password: string

  @column()
  avatar: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => LinkToken, {
    foreignKey: 'userId',
  })
  public tokens: HasMany<typeof LinkToken>

  @manyToMany(() => Group, {
    pivotTable: 'groups_users'
  })
  public groups: ManyToMany<typeof Group>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password)
      user.password = await Hash.make(user.password)
  }
}
