import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramService } from './telegram/telegram.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from './telegram/users.schema';
import { UsersModel } from './telegram/users.model';
import * as dotenv from 'dotenv';
import { Admin, AdminSchema } from './admin.schema';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([
      { name: 'Users', schema: UsersSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, TelegramService, UsersModel],
})
export class AppModule {}
