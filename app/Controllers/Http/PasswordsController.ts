import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { randomBytes } from 'crypto'
import { promisify } from 'util'

export default class PasswordsController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email, resetPasswordUrl  } = request.only(['email', 'resetPasswordUrl'])
    const user = await User.findByOrFail('email', email)

    // random token
    const random = await promisify(randomBytes)(24)
    const token = random.toString('hex')

    //creates token in the database and relates to the user
    await user.related('tokens').updateOrCreate(
      { userId: user.id },
      { token }
    )

    const resetPasswordUrlWithToken = `${resetPasswordUrl}?token=${token}`
    await Mail.send((message) => {
      message
        .from('no-replay@roleplay.com')
        .to(email)
        .subject('Roleplay: Recuperação de senha')
        .htmlView('email/forgotpassword', {
          productName: 'Roleplay',
          name: user.username,
          resetPasswordUrl: resetPasswordUrlWithToken,
        })
    })
    return response.noContent()

  }
}
