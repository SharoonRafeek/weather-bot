import { Controller, Get, Put, Param, Body, Delete } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UpdateUserDto } from './update-user.dto';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}
  @Get('/users')
  async getAllUsers() {
    return this.telegramService.getAllUsers();
  }

  @Put(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.telegramService.updateUserByUserId(userId, updateUserDto);
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.telegramService.deleteUserByUserId(userId);
  }
}
