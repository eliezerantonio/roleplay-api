import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class PasswordController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = request.only(['email', 'resetPasswordUrl'])

    const user = await User.findByOrFail('email', email)

    await Mail.send((message) => {
      message
        .from('no-replay@releplay.com')
        .to(email)
        .subject('Roleplay: recuperação de Senha')
        .htmlView('email/forgotpassword', {
          productName: 'Roleplay',
          name: user.username,
          resetPasswordUrl: resetPasswordUrl,
        })
    })
    return response.noContent()
  }
}
