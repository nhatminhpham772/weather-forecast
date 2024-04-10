import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastController } from './forecast.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [ForecastController],
  providers: [ForecastService],
})
export class ForecastModule { }