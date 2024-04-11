import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from '../../hooks/database/base.service';
import { Token } from '../entities/token.entity';
import { User } from '../entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dotenv from 'dotenv'
import { UserService } from './user.service';

dotenv.config()

@Injectable()
export class UserAuthService extends BaseService<User> {
    constructor(
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {
        super(userRepository)
    }

    @Cron(CronExpression.EVERY_WEEKEND)
    async deleteToken(): Promise<DeleteResult> {
        return await this.tokenRepository.delete({
            check_valid: false,
            refresh_token: null
        })
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findUserByEmail(email)

        if (user && (await this.isMatch(password, user.password)))
            return {
                id: user.id,
                email: user.email,
            }
        return null
    }

    async saveRefreshTokenToCookies(refresh: string, res: Response, time: number): Promise<void> {
        const cookieOptions = {
            httpOnly: true,
            expires: this.VNTime(time),
            secure: process.env.NODE_ENV === 'production'
        }

        res.cookie('user_token', refresh, {
            path: '/',
            sameSite: 'none',
            domain: '',
            httpOnly: cookieOptions.httpOnly,
            expires: cookieOptions.expires,
            secure: cookieOptions.secure
        })
    }

    async saveToken(parent = null, refresh: Token, email: string): Promise<Token> {
        const user = await this.userService.findUserByEmail(email)

        refresh.user = user
        refresh.parent = parent

        return await this.tokenRepository.save(refresh)
    }

    async signin(email: string): Promise<any> {
        const user = await this.userService.findUserByEmail(email)
        if(user.isActive === false) {
            await this.userService.createOtp(user)

            throw new BadRequestException('Vui lòng kiểm tra otp trong hòm thư')
        }

        const payload = {
            email: user.email,
            id: user.id
        }

        const accessToken = this.jwtService.sign(payload)
        const refresh = new Token()

        this.saveToken(null, refresh, user.email)

        return {
            metadata: {
                id: user.id,
                email: user.email,
                email_notification: user.email_notification,
                city: user.city,
                jwt_token: accessToken
            },
            refresh: refresh.refresh_token
        }
    }

    async deleteStolenToken(stolenToken: string): Promise<any> {
        const stolen = await this.tokenRepository.findOne({
            relations: { parent: true },
            where: { refresh_token: stolenToken }
        })

        if (!stolen)
            throw new NotFoundException('logged_out')

        if (!stolen.parent)
            await this.tokenRepository.delete({ refresh_token: stolen.refresh_token })
        else
            await this.tokenRepository.delete({ refresh_token: stolen.parent.refresh_token })

        return "NEVER TRY AGAIN"
    }

    async refreshTokenInCookies(req: string, res: Response): Promise<any> {
        if (!req) {
            throw new NotFoundException('user_token_not_found')
        }

        const usedToken = await this.tokenRepository.findOne({
            relations: { user: true, parent: true },
            where: { refresh_token: req }
        })

        if (!usedToken) {
            throw new NotFoundException('used_token_not_found')
        }

        if (usedToken.check_valid) {
            usedToken.check_valid = false
            await this.tokenRepository.save(usedToken)
        } else {
            await this.saveRefreshTokenToCookies('', res, 0)
            return this.deleteStolenToken(req)
        }

        const user = await this.userService.findUserByEmail(usedToken.user.email)

        const payload = {
            email: user.email,
            id: user.id
        }

        const accessToken = this.jwtService.sign(payload)
        const refresh = new Token()

        const parentToken = usedToken?.parent ? usedToken.parent : usedToken

        await this.saveToken(parentToken, refresh, usedToken.user.email)

        return {
            metadata: {
                id: user.id,
                email: user.email,
                email_notification: user.email_notification,
                city: user.city,
                jwtToken: accessToken
            },
            refresh: refresh.refresh_token
        }
    }
}
