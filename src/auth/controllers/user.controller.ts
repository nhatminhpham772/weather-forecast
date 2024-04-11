import { Controller, Post, Body, Res, Patch, Query, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { SignUpDto } from "../dtos/sign-up.dto";
import AppResponse, { AppResponseInterface } from "src/config/sections/app.response";

@ApiTags('USER')
@Controller('user')
export class UserController {
    private res: AppResponseInterface = AppResponse
    constructor(
        private readonly userService: UserService,
    ) { }

    @Post()
    async signup(@Body() dto: SignUpDto, @Res() res): Promise<any> {
        try {
            let data = await this.userService.signup(dto)
            return this.res.setLib(res).setStatus(200).setBody(data).release()
        } catch (error) {
            return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
        }
    }

    @Post('/otp/:email')
    async sendOtp(@Param('email') email: string, @Res() res): Promise<any> {
        try {
            const user = await this.userService.findUserByEmail(email)
            let data = await this.userService.createOtp(user)
            return this.res.setLib(res).setStatus(200).setBody(data).release()
        } catch (error) {
            return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
        }
    }

    @Patch('/active/:email/:otp')
    async activeEmail(@Param('email') email: string, @Param('otp') otp: string, @Res() res): Promise<any> {
        try {
            let data = await this.userService.checkOtp(email, otp)
            return this.res.setLib(res).setStatus(200).setBody(data).release()
        } catch (error) {
            return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
        }
    }
}