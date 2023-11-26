import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { GroupFactory, UserFactory } from 'Database/factories'
import User from 'App/Models/User'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let token = ''
let user = {} as User

test.group('Group request', (group) => {
  test('it should create a group request', async (assert) => {
    const { id } = await UserFactory.create()
    const group = await GroupFactory.merge({ master: id }).create()
    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(201)

    assert.exists(body.groupRequest, 'GroupRequest undefined')
    assert.equal(body.groupRequest.userId, user.id) //pessoa autenticada que solicitou participar da mesa
    assert.equal(body.groupRequest.groupId, group.id)
    assert.equal(body.groupRequest.status, 'PENDING')
  })

  group.before(async () => {
    const plainPassword = '1234567'
    const newUser = await UserFactory.merge({ password: plainPassword }).create()
    const { body } = await supertest(BASE_URL).post('/sessions').send({
      email: newUser.email,
      password: plainPassword
    }).expect(201)

    token = body.token.token
    user = newUser
  })

  group.after(async () => {
    await supertest(BASE_URL)
      .delete('/sessions')
      .set('Authorization', `Bearer ${token}`)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
