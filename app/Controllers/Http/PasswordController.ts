import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { randomBytes } from 'crypto'
import { promisify } from 'util'

export default class PasswordController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = request.only(['email', 'resetPasswordUrl'])

    const user = await User.findByOrFail('email', email)

    const random = await promisify(randomBytes)(24)

    const token = random.toString('hex')

    await user.related('tokens').updateOrCreate({ userId: user.id }, { token })

    const resetPasswordUrlWithToken = `${resetPasswordUrl}?token=${token}`

    await Mail.send((message) => {
      message
        .from('no-replay@releplay.com')
        .to(email)
        .subject('Roleplay: recuperação de Senha')
        .htmlView('email/forgotpassword', {
          productName: 'Roleplay',
          name: user.username,
          resetPasswordUrl: resetPasswordUrlWithToken,
        })
    })
    return response.noContent()
  }
}
