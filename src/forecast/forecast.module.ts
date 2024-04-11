import { Module } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ForecastController } from './forecast.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { UserService } from '../auth/services/user.service';
import { Otp } from '../auth/entities/otp.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([User, Otp]),
  ],
  controllers: [ForecastController],
  providers: [ForecastService, UserService],
})
export class ForecastModule { }