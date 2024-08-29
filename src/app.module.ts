import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VkBotService } from './vk-bot/vk-bot.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { VkBotModule } from './vk-bot/vk-bot.module';
import { GoogleDriveModule } from './google-drive/google-drive.module';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, VkBotModule, GoogleDriveModule],
  controllers: [AppController],
  providers: [AppService, VkBotService, PrismaService],
})
export class AppModule {}
