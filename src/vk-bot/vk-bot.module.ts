import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserModule } from 'src/user/user.module'
import { UserService } from 'src/user/user.service'
import { GoogleDriveService } from 'src/google-drive/google-drive.service'

@Module({
	imports: [ConfigModule, UserModule],
	providers: [UserService, PrismaService, GoogleDriveService]
})
export class VkBotModule {}
