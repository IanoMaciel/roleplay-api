import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import Hash from '@ioc:Adonis/Core/Hash'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', (group) => {
  test('it should create an user', async (assert) => {
    const userPayload = { email: 'test@test.com', username: 'test', password: 'test123', avatar: 'http://test.com' }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)

    assert.exists(body.user, 'User undefined')
    assert.exists(body.user.id, 'Id undefined')
    assert.equal(body.user.email, userPayload.email)
    assert.equal(body.user.username, userPayload.username)
    assert.equal(body.user.avatar, userPayload.avatar)
    assert.notExists(body.user.password, 'Password defined')
  })

  test('it should return 409 when email is already in use', async (assert) => {
    const { email } = await UserFactory.create()
    const { body } = await supertest(BASE_URL).post('/users').send({
      email,
      username: 'test',
      password: 'test122',
      avatar: 'http://test.com'
    }).expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'email')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 409 when username is already in use', async (assert) => {
    const { username } = await UserFactory.create()
    const { body } = await supertest(BASE_URL).post('/users').send({
      username,
      email: 'test@test.com',
      password: 'test222',
      avatar: 'http://test.com'
    }).expect(409)

    assert.exists(body.message)
    assert.exists(body.code)
    assert.exists(body.status)
    assert.include(body.message, 'username')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test('it should return 422 when required data is not provided', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid email address', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({
      test: 'test@',
      password: 'p123456',
      username: 'ianooo_',
      avatar: 'http://ianodev.com'
    }).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should return 422 when providing an invalid password', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({
      test: 'test@test.com',
      password: '1',
      username: 'ianooo_',
      avatar: 'http://ianodev.com'
    }).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('it should update an user', async (assert) => {
    const { id, password } = await UserFactory.create()
    const email = 'test@test.com'
    const avatar = 'https://test.com.br'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`).send({
        email,
        avatar,
        password
      }).expect(200)

    assert.exists(body.user, 'user undefined')
    assert.equal(body.user.email, email)
    assert.equal(body.user.avatar, avatar)
    assert.equal(body.user.id, id)
  })

  test('it should update the password of the user', async (assert) => {
    const user = await UserFactory.create()
    const password = '1234567'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`).send({
        email: user.email,
        avatar: user.avatar,
        password
      }).expect(200)

    assert.exists(body.user, 'user undefined')
    assert.equal(body.user.id, user.id)

    await user.refresh()

    assert.isTrue(await Hash.verify(user.password, password))
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
