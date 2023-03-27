import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PasswordController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = request.only(['email'])

    await Mail.send((message) => {
      message
        .from('no-replay@releplay.com')
        .to(email)
        .subject('Roleplay: recuperação de Senha')
        .text('Clique no link abaixo para redifinir a sua senha.')
    })
    return response.noContent()
  }
}
