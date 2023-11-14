import { DateTime } from 'luxon'
import { BaseModel, HasMany, beforeSave, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import LinkToken from './LinkToken'

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

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password)
      user.password = await Hash.make(user.password)
  }
}
