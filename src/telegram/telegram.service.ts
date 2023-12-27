import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import { UpdateUserDto } from './update-user.dto';

dotenv.config();

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(@InjectModel('Users') private readonly userModel: Model<any>) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  }

  onModuleInit() {
    this.initialize();
    this.scheduleWeatherUpdates();
  }

  async getAllUsers() {
    return this.userModel.find().exec();
  }

  async updateUserByUserId(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { userId },
      updateUserDto,
      { new: true },
    );

    if (updatedUser) {
      console.log(`User with userId ${userId} found and updated:`, updatedUser);
    } else {
      console.log(`User with userId ${userId} not found`);
    }

    return updatedUser;
  }

  async deleteUserByUserId(userId: string): Promise<any> {
    const deletedUser = await this.userModel.findOneAndDelete({ userId });

    if (deletedUser) {
      console.log(`User with userId ${userId} deleted:`, deletedUser);
    } else {
      console.log(`User with userId ${userId} not found`);
    }

    return deletedUser;
  }

  private initialize() {
    this.bot.start((ctx) => this.welcomeMessage(ctx));
    this.bot.on('text', (ctx) => this.handleTextMessage(ctx));

    this.bot.launch().then(() => console.log('Telegram bot started'));
  }

  private async welcomeMessage(ctx: Context) {
    await this.saveUser(ctx.message.from.id, null);

    await ctx.reply('Welcome to the Weather Bot!');
    await ctx.reply(
      'To get the current weather, please share your location or provide a city name.',
    );
  }

  private async handleTextMessage(ctx: any) {
    const locationString = ctx.message.text;

    if (locationString) {
      try {
        const weatherInfo = await this.getWeatherInfoByCityName(locationString);

        if (weatherInfo) {
          await this.saveUser(ctx.message.from.id, locationString);

          await ctx.reply(`Here is the current weather in ${locationString}:`);
          await ctx.reply(`Temperature: ${weatherInfo.temperature}°C`);
          await ctx.reply(`Description: ${weatherInfo.description}`);
        } else {
          await ctx.reply(
            `Sorry, I couldn't find weather data for the location: ${locationString}`,
          );
        }
      } catch (error) {
        console.error('Error fetching weather data:', error.message);
        await ctx.reply(
          'Sorry, an error occurred while fetching weather data.',
        );
      }
    } else {
      await ctx.reply(
        'Please provide a location (e.g., city name) for weather updates.',
      );
    }
  }

  private async getWeatherInfoByCityName(
    cityName: string,
  ): Promise<{ temperature: number; description: string } | null> {
    try {
      const apiKey = process.env.WEATHER_API_KEY;
      const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
        cityName,
      )}&aqi=no`;

      const response = await axios.get(apiUrl);
      const temperature = response.data.current.temp_c;
      const description = response.data.current.condition.text;

      return { temperature, description };
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      return null;
    }
  }

  private async saveUser(
    userId: number,
    location: string | null,
  ): Promise<void> {
    try {
      const existingUser = await this.userModel.findOne({ userId });

      if (existingUser) {
        await this.userModel.updateOne({ userId }, { $set: { location } });
      } else {
        await this.userModel.create({ userId, location });
      }
    } catch (error) {
      console.error('Error saving user data:', error.message);
    }
  }

  private scheduleWeatherUpdates() {
    cron.schedule('* * * * *', async () => {
      try {
        const users = await this.userModel.find();
        for (const user of users) {
          if (user.location) {
            try {
              const weatherInfo = await this.getWeatherInfoByCityName(
                user.location,
              );
              if (weatherInfo) {
                await this.bot.telegram.sendMessage(
                  user.userId,
                  `Weather Update for ${user.location}:\nTemperature: ${weatherInfo.temperature}°C\nDescription: ${weatherInfo.description}`,
                );
              }
            } catch (error) {
              console.error(
                `Error sending weather update to user ${user.userId}:`,
                error.message,
              );

              // Handle specific errors, e.g., 403 Forbidden
              if (error.code === 403) {
                // You can implement specific handling for this error, such as logging, updating user status, etc.
                // For now, continue to the next user.
                continue;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error scheduling weather updates:', error.message);
      }
    });
  }
}
