import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  location: String,
});
