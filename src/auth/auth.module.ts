import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import { User } from './entities/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UserAuthService } from './services/auth.service';
import { UserStrategy } from './strategies/user.strategy';
import { UserAuthController } from './controllers/auth.controller';
import * as dotenv from 'dotenv'
import { Otp } from './entities/otp.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

dotenv.config()

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'user' }),
        JwtModule.register({
            global: true,
            secret: process.env.USER_SECRET,
            signOptions: { expiresIn: '7d' }
        }),
        TypeOrmModule.forFeature([Token, User, Otp]),
        ScheduleModule.forRoot()
    ],
    providers: [
        UserAuthService,
        UserService,
        UserStrategy,
        JwtStrategy
    ],
    controllers: [
        UserAuthController,
        UserController
    ]
})
export class UserAuthModule {}
