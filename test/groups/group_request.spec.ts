import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { GroupFactory, UserFactory } from 'Database/factories'
import test from 'japa'

import supertest from 'supertest'
const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let token = ''
let user = {} as User
test.group('Group Request', (group) => {
  test('it should create a group request', async (assert) => {
    const { id } = await UserFactory.create()
    const group = await GroupFactory.merge({ master: id }).create()

    const { body } = await await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(201)

    assert.exists(body.groupRequest, 'GroupRequest undefined')
    assert.equal(body.groupRequest.userId, user.id)
    assert.equal(body.groupRequest.groupId, group.id)
    assert.equal(body.groupRequest.status, 'PENDING')
  })

  test('it should 409 when group request already exists', async (assert) => {
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
  })

  test('it should return 422 when ur is already in he group', async (assert) => {
    const groupPayload = {
      name: 'test',
      description: 'test',
      schedule: 'test',
      location: 'test',
      chronic: 'test',
      master: user.id,
    }

    //Master is added o group

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

  test.only('it should list group requests by master', async (assert) => {
    const master = await UserFactory.create()

    const group = await GroupFactory.merge({ master: master.id }).create()

    const response = await supertest(BASE_URL)
      .post(`/groups/${group.id}/requests`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const groupRequest = response.body.groupRequest

    const { body } = await supertest(BASE_URL)
      .get(`/groups/${group.id}/requests?master=${master.id}`)
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

  group.before(async () => {
    const plainPassword = 'test'
    const newUser = await UserFactory.merge({ password: plainPassword }).create()

    const { body } = await supertest(BASE_URL)
      .post('/sessions')
      .send({ email: newUser.email, password: plainPassword })
      .expect(201)

    token = body.token.token
    user = newUser
  })

  group.after(async () => {
    await supertest(BASE_URL).delete('/sessions').set('Authorization', `Bearer ${token}`)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
