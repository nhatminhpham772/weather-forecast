import { Module } from '@nestjs/common';
import { ForecastModule } from './forecast/forecast.module';
import { UserAuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from './hooks/connections/connection.module';
import { postgresOption } from './hooks/connections/connection.provider';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...postgresOption,
      autoLoadEntities: true
    }),
    ConnectionModule,
    ForecastModule,
    UserAuthModule
  ]
})
export class AppModule {}
