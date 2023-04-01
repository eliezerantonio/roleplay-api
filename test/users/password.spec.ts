import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {
  test('it should sen and email with forgot passwords instructions', async (assert) => {
    const { email, username } = await UserFactory.create()

    Mail.trap((message) => {
      assert.deepEqual(message.to, [
        {
          address: email,
        },
      ])

      assert.deepEqual(message.from, {
        address: 'no-replay@releplay.com',
      })
      assert.equal(message.subject, 'Roleplay: recuperação de Senha')
      assert.include(message.html!, username)
    })

    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: email,
        resetPasswordUrl: 'url',
      })
      .expect(204)

    Mail.restore()
  })
  // test('it should create a reset password token', async (assert) => {
  //   const user = await UserFactory.create()

  //   await supertest(BASE_URL)
  //     .post('/forgot-password')
  //     .send({
  //       email: user.email,
  //       resetPasswordUrl: 'url',
  //     })
  //     .expect(204)

  //   const tokens = await user.related('tokens').query()
  //   assert.isNotEmpty(tokens)
  // })

  test.only('it should return 422 when required data is not provided or data in invalid', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/forgot-password').send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
