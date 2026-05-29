import { Module, Global } from '@nestjs/common';
import { DATABASE_CONNECTION, connectToDatabase } from './config/database.config';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async () => {
        return connectToDatabase();
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
