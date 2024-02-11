import test from 'japa'
import supertest from 'supertest'
import Database from '@ioc:Adonis/Lucid/Database'
import { GroupFactory, UserFactory } from 'Database/factories'
import User from 'App/Models/User'
import GroupRequest from 'App/Models/GroupRequest'

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

  test('it should return 409 when group request already exists', async (assert) => {
    const { id } = await UserFactory.create()
    const group = await GroupFactory.merge({ master: id }).create()
    await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(409)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
    assert.equal(body.message, 'group request already exists')
  })

  test('it should return 422 when user is already in the group', async (assert) => {
    const groupPayload = {
      name: 'test',
      description: 'test description',
      schedule: 'every day',
      location: 'test',
      chronic: 'test lalalalallalala',
      master: user.id
    }

    // master is added to the group
    const response = await supertest(BASE_URL)
      .post('/groups')
      .set('Authorization', `Bearer ${token}`)
      .send(groupPayload)

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${response.body.group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should list group requests by master', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    const response = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const groupRequest = response.body.groupRequest

    const { body } = await supertest(BASE_URL)
      .get(`/groups/${group.id}/requests?master=${master.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.groupRequests, 'GroupRequests undefined')
    assert.equal(body.groupRequests.length, 1)
    assert.equal(body.groupRequests[0].id, groupRequest.id)
    assert.equal(body.groupRequests[0].userId, groupRequest.userId)
    assert.equal(body.groupRequests[0].groupId, groupRequest.groupId)
    assert.equal(body.groupRequests[0].status, groupRequest.status)
    assert.equal(body.groupRequests[0].group.name, group.name)
    assert.equal(body.groupRequests[0].user.username, user.username)
    assert.equal(body.groupRequests[0].group.master, master.id)
  })

  test('it should return an empty list when master has no group requests', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const { body } = await supertest(BASE_URL)
      .get(`/groups/${group.id}/requests?master=${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.groupRequests, 'GroupRequests undefined')
    assert.equal(body.groupRequests.length, 0)
  })

  test('it should return 422 when master is not provied', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL)
      .get(`/groups/${group.id}/requests?master`)
      .set('Authorization', `Bearer ${token}`)
      .expect(422)

    assert.exists(body.code, 'BADE_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should accept a group request', async (assert) => {
    const group = await GroupFactory.merge({ master: user.id }).create()

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const response = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests/${body.groupRequest.id}/accept`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(response.body.groupRequest, 'GroupRequest undefined')
    assert.equal(response.body.groupRequest.userId, user.id)
    assert.equal(response.body.groupRequest.groupId, group.id)
    assert.equal(response.body.groupRequest.status, 'ACCEPTED')

    // validando usuário e mesa quando aceito a solicitação do usuário para
    await group.load('players')
    assert.isNotEmpty(group.players)
    assert.equal(group.players.length, 1)
    assert.equal(group.players[0].id, user.id)
  })

  test('it should return 404 when providing an unexisting group', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const response = await supertest(BASE_URL)
      .post(`/groups/123/requests/${body.groupRequest.id}/accept`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(response.body.code, 'BAD_REQUEST')
    assert.equal(response.body.status, 404)
  })

  test('it should return 404 when providing an unexisting group request', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const response = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests/123/accept`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(response.body.code, 'BAD_REQUEST')
    assert.equal(response.body.status, 404)
  })

  test('it should reject a group request', async (assert) => {
    const group = await GroupFactory.merge({ master: user.id }).create()

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    await supertest(BASE_URL)
      .delete(`/groups/${group.id}/requests/${body.groupRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const groupRequest = await GroupRequest.find(body.groupRequest.id)
    assert.isNull(groupRequest)
  })

  test('it should return 404 when providing an unexisting group for rejection', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    const { body } = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const response = await supertest(BASE_URL)
      .delete(`/groups/123/requests/${body.groupRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(response.body.code, 'BAD_REQUEST')
    assert.equal(response.body.status, 404)
  })

  test('it should return 404 when providing an unexisting group request for rejection', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create()

    await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const response = await supertest(BASE_URL)
      .delete(`/groups/${group.id}/requests/123`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)

    assert.equal(response.body.code, 'BAD_REQUEST')
    assert.equal(response.body.status, 404)
  })

  test('it should update a group', async (assert) => {
    const master = await UserFactory.create();
    const group = await GroupFactory.merge({ master: master.id }).create();

    const payload = {
      name: 'test',
      description: 'test description',
      schedule: 'every day',
      location: 'test',
      chronic: 'test',
    }

    const { body } = await supertest(BASE_URL)
      .patch(`/groups/${group.id}`)
      .send(payload)
      .expect(200)

    assert.exists(body.group, 'Group undefined')
    assert.equal(body.group.name, payload.name)
    assert.equal(body.group.description, payload.description)
    assert.equal(body.group.schedule, payload.schedule)
    assert.equal(body.group.location, payload.location)
    assert.equal(body.group.chronic, payload.chronic)
  })

  test('it should return 404 when providing an unexisting group for update', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch(`/groups/1`)
      .send({})
      .expect(404)

    assert.equal(response.body.code, 'BAD_REQUEST')
    assert.equal(response.body.status, 404)
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
