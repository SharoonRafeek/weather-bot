import { model } from 'mongoose';
import { UsersSchema } from './users.schema';

export const UsersModel = model('Users', UsersSchema);
