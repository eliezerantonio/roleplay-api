import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TokenExpiredException from 'App/Exceptions/TokenExpiredException'
import User from 'App/Models/User'
import ForgotPasswordValidator from 'App/Validators/ForgotPasswordValidator'
import ResetPasswordValidator from 'App/Validators/ResetPasswordValidator'
import { randomBytes } from 'crypto'
import { promisify } from 'util'

export default class PasswordController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl } = await request.validate(ForgotPasswordValidator)

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

  public async resetPassword({ request, response }: HttpContextContract) {
    const { token, password } = await request.validate(ResetPasswordValidator)

    const userByToken = await User.query()
      .whereHas('tokens', (query) => {
        query.where('token', token)
      })
      .preload('tokens')
      .firstOrFail()

    const tokenAge = Math.abs(userByToken.tokens[0].createdAt.diffNow('hours').hours)

    if (tokenAge > 2) {
      throw new TokenExpiredException()
    }

    userByToken.password = password
    await userByToken.save()
    await userByToken.tokens[0].delete()

    return response.noContent()
  }
}
