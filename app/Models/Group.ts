import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, ManyToMany, ModelQueryBuilderContract, belongsTo, column, manyToMany, scope } from '@ioc:Adonis/Lucid/Orm'
import User from './User'


type Builder = ModelQueryBuilderContract<typeof Group>

export default class Group extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public schedule: string

  @column()
  public location: string

  @column()
  public chronic: string

  @column()
  public master: number

  @belongsTo(() => User, {
    foreignKey: 'master'
  })
  public masterUser: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'groups_users'
  })
  public players: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static withPlayer = scope((query: Builder, userId: number) => {
    query.whereHas('players', (query) => {
      query.where('id', userId)
    })
  })

  public static withText = scope((query: Builder, text: string) => {
    query.where('name', 'LIKE', `%${text}%`)
      .orWhere('description', 'LIKE', `%${text}%`)
  })
}
