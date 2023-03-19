import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
test.group('User', () => {
  test.only('it should create an user', async () => {
    const userPayload = { email: 'test@example.com', username: 'test', password: 'test' }

    await supertest(BASE_URL).post('/users').send(userPayload).expect(201)
  })
})
