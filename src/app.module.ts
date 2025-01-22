import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [WhatsappModule, ClientsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
