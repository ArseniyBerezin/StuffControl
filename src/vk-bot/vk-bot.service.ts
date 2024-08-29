import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleDriveService } from 'src/google-drive/google-drive.service'
import { UserService } from 'src/user/user.service'
import { VK } from 'vk-io'

@Injectable()
export class VkBotService implements OnModuleInit {
	private vk: VK

	constructor(
		private configService: ConfigService,
		private userService: UserService,
		private googleDriveService: GoogleDriveService
	) {
		this.vk = new VK({
			token: this.configService.get<string>('VK_TOKEN')
		})
	}

	async onModuleInit() {
		await this.startLongPolling()
	}

	async startLongPolling() {
		this.vk.updates.on('message_new', async (context, next) => {
			const message = context.text

			if (message.startsWith('/reg')) {
				const args = message.split(' ').slice(1)

				if (args.length !== 5) {
					await context.send(
						'❌ Неверное количество аргументов. Используйте: /reg <vkID> <ник> <эл.почта> <должность> <фракция>'
					)
					return
				}

				const [vkId, nickname, email, role, fraction] = args

				await this.userService.register(+vkId, nickname, email, fraction, role)
				await this.googleDriveService.giveAccessByFraction(fraction, email)

				await context.send(
					`✅ Успех! Вы зарегестрировали администратора ${nickname}, как ${role + ' ' + fraction}`
				)
			}

			if (message.startsWith('/deleteuser')) {
				const args = message.split(' ').slice(1)

				if (args.length !== 1) {
					await context.send(
						'❌ Неверное количество аргументов. Используйте: /deleteuser <ник>'
					)
					return
				}

				const [nickname] = args
				const user = await this.userService.findUserByNick(nickname)
				if(user === undefined || user === null) return await context.send(`❌ Ник администратора указан неверно!`)
				await this.googleDriveService.revokeAccessByFraction(user.fraction, user.email)
				await this.userService.delete(nickname)

				await context.send(`✅ Удалена запись: Ник - ${nickname}. Доступ у администратора ${nickname} к таблицам и формам успешно отозван!`)
			}

			if (message.startsWith('/rankup')) {
				const args = message.split(' ').slice(1)

				if (args.length !== 3) {
					return await context.send(
						'❌ Неверное количество аргументов. Используйте: /rankup <ник> <должность> <фракция>'
					)
				}

				const [nickname, role, fraction] = args
				await this.userService.editUser(nickname, fraction, role)

				await context.send(
					`✅ Успех! Администратору ${nickname} изменили должность на ${role + ' ' + fraction}`
				)
			}

			if (message.startsWith('/find')) {
				const args = message.split(' ').slice(1)

				if (args.length !== 1) {
					return await context.send(
						'❌ Неверное количество аргументов. Используйте: /find <фракция>'
					)
				}
				const [fraction] = args
				const finded = await this.userService.findUserByFractions(fraction)
				if (finded.length <= 0 && finded != undefined)
					return await context.send(
						`❌ По вашему запросу ${fraction} не найдено следящих!`
					)

				const userList = finded
					.map(
						user =>
							`⚡ Ник: ${user.nick}, \n📧 Email: ${user.email}, \n🏢 Фракция: ${user.fraction}, \n☀ Роль: ${user.role}`
					)
					.join('\n\n')
				await context.send(`🕵️‍♂️🕵️‍♀️ Список следящих за ${fraction}:\n\n${userList}`)
			}

			await next()
		})

		this.vk.updates.start().catch()
	}
}
