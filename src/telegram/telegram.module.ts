import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from './users.schema';
import { TelegramController } from './telegram.controller';
import { UsersModel } from './users.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Users', schema: UsersSchema }]),
  ],
  providers: [TelegramService, UsersModel],
  controllers: [TelegramController],
})
export class TelegramModule {}
