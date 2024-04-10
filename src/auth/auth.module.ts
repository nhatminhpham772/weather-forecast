import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Token } from './entities/token.entity';
import { User } from './entities/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UserAuthService } from './services/auth.service';
import { UserStrategy } from './user.strategy';
import { UserAuthController } from './controllers/auth.controller';
import * as dotenv from 'dotenv'

dotenv.config()

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'user' }),
        JwtModule.register({
            global: true,
            secret: process.env.USER_SECRET,
            signOptions: { expiresIn: '7d' }
        }),
        TypeOrmModule.forFeature([Token, User]),
        ScheduleModule.forRoot()
    ],
    providers: [
        UserAuthService,
        UserStrategy,
    ],
    controllers: [
        UserAuthController,
    ]
})
export class UserAuthModule {}
