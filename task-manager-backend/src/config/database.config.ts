import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleOptions => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager',
});
