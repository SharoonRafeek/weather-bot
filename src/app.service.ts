import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './admin.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}
  async login({
    email,
    name,
    image,
  }: {
    email: string;
    name: string;
    image: string;
  }): Promise<any> {
    const admin = await this.adminModel.findOne({ email: email });
    if (!admin) {
      const newAdmin = new this.adminModel({ email, name, image });
      await newAdmin.save();
      return newAdmin;
    } else {
      console.log(admin);
      return admin;
    }
  }
}
