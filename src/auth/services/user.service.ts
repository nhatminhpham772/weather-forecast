import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "../../hooks/database/base.service";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Token } from "../entities/token.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "../dtos/sign-up.dto";
import { Otp } from "../entities/otp.entity";
import * as nodemailer from 'nodemailer'

const nodemailer = require("nodemailer")

@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    ) {
        super(userRepository)
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ email: email })
        if (!user)
            throw new NotFoundException('Không tìm thấy người dùng')

        return user
    }

    async createOtp(user: User) {
        const code = (Math.floor(Math.random() * 900000) + 100000).toString()

        const otp = new Otp()
        otp.code = code
        otp.timestamp = Date.now()
        otp.user = user

        try {
            await this.otpRepository.save(otp)
        } catch (error) {
            throw new BadRequestException(error)
        }

        await this.mailer(user.email, otp.code)

        return "Thành công"
    }

    async signup(dto: SignUpDto): Promise<any> {
        if (dto.password !== dto.passwordConfirm)
            throw new BadRequestException('Sai mật khẩu')

        const check = await this.userRepository.findOneBy({ email: dto.email })

        if (check)
            throw new ConflictException('Email đã được đăng ký')

        const user = new User()
        user.email = dto.email
        user.password = await this.hashing(dto.password)
        user.createdAt = this.VNTime()
        user.updatedAt = user.createdAt

        try {
            await this.userRepository.save(user)
        } catch (error) {
            throw new BadRequestException('Đăng ký thất bại')
        }

        return await this.createOtp(user)
    }


    async mailer(email: string, otp: string) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "nhatminh772002@gmail.com",
                pass: "aogo jgkl hzlh njyb",
            },
        });

        const info = await transporter.sendMail({
            from: '"Weather Forecast" <nhatminh772002@gmail.com>',
            to: `${email}`,
            subject: "[OTP]", // Subject line
            text: `Your OTP is ${otp}`, // plain text body
        });
    }

    async checkOtp(email: string, code: string): Promise<any> {
        const otp = await this.otpRepository.findOne({ where: { code: code, user: { email: email } }, relations: ['user']})
        if(!otp) throw new BadRequestException('Sai Otp')

        const OTP_EXPIRY_TIME = 10 * 60 * 1000;
        const currentTime = Date.now();
        if(currentTime - otp.timestamp <= OTP_EXPIRY_TIME) {
            const otps = await this.otpRepository.find({ where: { user: { email: email } } })
            await this.otpRepository.remove(otps)

            otp.user.isActive = true
            otp.user.updatedAt = this.VNTime()
            await this.userRepository.save(otp.user)

            return "Xác nhận email thành công"
        } else throw new BadRequestException('Sai Otp')

    }
}