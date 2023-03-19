import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User', () => {
  test.only('it should create an user', async (assert) => {
    const userPayload = {
      email: 'test@example.com',
      username: 'test',
      password: 'test',
      avatar: 'http://image.com/image/1',
    }

    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)

    assert.exists(body.user, 'User Undefined')
    assert.exists(body.id, 'Id Undefined')
    assert.equal(body.email, userPayload.email)
    assert.equal(body.username, userPayload.username)
    assert.equal(body.password, userPayload.password)
    assert.equal(body.avatar, userPayload.avatar)
  })
})
