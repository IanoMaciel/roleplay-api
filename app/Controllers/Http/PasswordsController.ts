import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserFactory } from 'Database/factories'

export default class PasswordsController {
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = request.only(['email'])
    await Mail.send((message) => {
      message
        .from('no-replay@roleplay.com')
        .to(email)
        .subject('Roleplay: Recuperação de senha')
        .text('Clique no link abaixo para redefinição de senha')
    })
    return response.noContent()

  }
}
