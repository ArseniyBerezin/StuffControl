import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async findUserByNick(nick: string) {
		return await this.prismaService.user.findUnique({where: {nick}})
	}

	async register(vkUserId, nickname, email, fraction, role) {
		const oldUser = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})
		if (oldUser) return
		const newUser = await this.prismaService.user.create({
			data: {
				userId: vkUserId,
				nick: nickname,
				email,
				fraction,
				role
			}
		})

		return { newUser }
	}

	async delete(nick) {
		await this.prismaService.user.delete({ where: { nick } })
		return 'Успешно!'
	}

	async editUser(nick: string, fraction: string, role: string) {
		const user = await this.prismaService.user.findFirst({ where: { nick } })
		if (!user) return
		const edtitedUser = await this.prismaService.user.update({
			where: { nick },
			data: {
				role,
				fraction
			}
		})
	}

	async findUserByFractions(fractions: string | string[]) {
		// Приведение `fractions` к массиву, если это строка
		const fractionsArray = Array.isArray(fractions) ? fractions : [fractions]

		return await this.prismaService.user.findMany({
			where: {
				fraction: {
					in: fractionsArray
				}
			}
		})
	}
}
