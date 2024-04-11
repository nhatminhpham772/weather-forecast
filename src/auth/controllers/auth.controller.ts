import { Body, Controller, Delete, Post, Put, Req, Res, UseGuards, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserAuthService } from "../services/auth.service";
import { UserAuthGuard } from "../guards/user.guard";
import { SignInDto } from "../dtos/sign-in.dto";
import AppResponse, { AppResponseInterface } from "src/config/sections/app.response";

@ApiTags('AUTH')
@Controller('user')
export class UserAuthController {
    private res: AppResponseInterface = AppResponse
    constructor(
        private readonly authService: UserAuthService
    ) { }

    @UseGuards(UserAuthGuard)
    @Post('auth')
    async signin(
        @Req() req,
        @Body() dto: SignInDto,
        @Res() res: Response
    ): Promise<any> {
        try {
            const { metadata, refresh } = await this.authService.signin(req.user.email)
            const expires = 7
            await this.authService.saveRefreshTokenToCookies(refresh, res, expires)

            return this.res.setLib(res).setStatus(200).setBody(metadata).release()
        } catch (error) {
            return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
        }
    }

    @Post('refresh')
    async refresh(
        @Req() req,
        @Res() res: Response
    ) {
        try {
            const { metadata, refresh } = await this.authService.refreshTokenInCookies(req.cookies.user_token, res)
            const expires = 7
            await this.authService.saveRefreshTokenToCookies(refresh, res, expires)

            return this.res.setLib(res).setStatus(200).setBody(metadata).release()
        } catch (error) {
            return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
        }
    }

    @Delete('logout')
    async logout(
        @Req() req,
        @Res() res: Response
    ) {
        if (!req.cookies.user_token) {
            throw new NotFoundException('logged_out')
        }
        try {
            await this.authService.deleteStolenToken(req.cookies.user_token)
            await this.authService.saveRefreshTokenToCookies('', res, 0)

            return this.res.setLib(res).setStatus(200).release()
        } catch (error) {
            return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
        }
    }
}
