import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SessionsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const { email, password } = request.only(['email', 'password'])

    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '2hours',
    })

    return response.created({ user: auth.user, token })
  }

  public async destroy({ response, auth }: HttpContextContract) {
    await auth.logout()
    return response.ok({})
  }
}
