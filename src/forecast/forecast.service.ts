import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as dotenv from 'dotenv'
import { firstValueFrom, map } from 'rxjs';
import { BaseService } from '../hooks/database/base.service';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/auth/services/user.service';
import { promisify } from 'util'
import * as fs from 'fs'
import * as nodemailer from 'nodemailer'
import { emit } from 'process';
import { Cron, CronExpression } from '@nestjs/schedule';
dotenv.config()

const readFile = promisify(fs.readFile);
const nodemailer = require("nodemailer")
@Injectable()
export class ForecastService extends BaseService<User> {
  private weather_api = process.env.WEATHER_API
  private weather_api_key = process.env.WEATHER_API_KEY

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
    private readonly userService: UserService
  ) {
    super(userRepository)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async notifyForecastInEmail() {
      const users = await this.userRepository.findBy({ email_notification: true, isActive: true })
      users.forEach(async (u) => {
        if(u.city)
          try {
            const data = await this.currentDayWeather(u.city)
            await this.mailer(u.email, data)
          } catch (error) {
            throw new BadRequestException(error.toString())
          }
      })
  }

  async currentWeather(city: string): Promise<any> {
    const url = this.weather_api + '/current.json?q=' + city + '&lang=vi&key=' + this.weather_api_key
    const response = await firstValueFrom(this.httpService.get<any>(url).pipe(map((resp) => resp.data)))
    return response
  }

  async forecastWeatherFrom0To12Day(city: string): Promise<any> {
    const url = this.weather_api + '/forecast.json?q=' + city + '&days=14&lang=vi&key=' + this.weather_api_key
    const response = await firstValueFrom(this.httpService.get<any>(url).pipe(map((resp) => resp.data)))
    
    return response.forecast.forecastday
  }

  convertDateToString(date: Date) {
    const year = date.getFullYear().toString().padStart(4, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    return year + '-' + month + '-' + day
  }

  async currentDayWeather(city: string) {
    const date = this.VNTime()
    var dateForecast = this.convertDateToString(date)

    const url = this.weather_api + '/forecast.json?q=' + city + '&dt=' + dateForecast + '&lang=vi&key=' + this.weather_api_key
    const response = await firstValueFrom(this.httpService.get<any>(url).pipe(map((resp) => resp.data)))
    
    return response
  }

  async forecastWeatherFrom13To300Day(city: string, date: Date): Promise<any> {
    var data = []
    for(let i=0; i<4; i++) {
      var dateForecast = this.convertDateToString(date)
      const url = this.weather_api + '/future.json?q=' + city + '&lang=vi&dt=' + dateForecast + '&key=' + this.weather_api_key
      const response = await firstValueFrom(this.httpService.get<any>(url).pipe(map((resp) => resp.data)))
      data = [...data, ...response.forecast.forecastday]
      date.setDate(date.getDate() + 1)
    }

    return data
  }

  async notificationForecastWeather(city: string, isActive: boolean, email: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email)
    if(isActive === true) {
      try {
        const data = await this.currentDayWeather(city)
        await this.mailer(email, data)
      } catch (error) {
        throw new BadRequestException(error.toString())
      }

      user.email_notification = true
      user.city = city
      await this.userRepository.save(user)
    } else {
      user.email_notification = false
      await this.userRepository.save(user)
    }

    return 'Thành công'
  }

  async mailer(email: string, data: any) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "nhatminh772002@gmail.com",
                pass: "aogo jgkl hzlh njyb",
            },
        });

        const dataLocation = data.location
        const dataForecast = data.forecast.forecastday[0]

        const htmlContent = await readFile('./src/template/index.html', 'utf8');
        const modifiedHtmlContent = htmlContent.replace('{{ icon_weather }}', dataForecast.day.condition.icon.slice(2))
                                                .replace('{{ avgtemp_c }}', dataForecast.day.avgtemp_c)
                                                .replace('{{ city }}', dataLocation.name)
                                                .replace('{{ country }}', dataLocation.country)
                                                .replace('{{ localtime }}', dataLocation.localtime.split(" ")[0])
                                                .replace('{{ text }}', dataForecast.day.condition.text)
                                                .replace('{{ mintemp_c }}', dataForecast.day.mintemp_c)
                                                .replace('{{ maxtemp_c }}', dataForecast.day.maxtemp_c)
                                                .replace('{{ avghumidity }}', dataForecast.day.avghumidity)
                                                .replace('{{ maxwind_mph }}', dataForecast.day.maxwind_mph)

        const info = await transporter.sendMail({
            from: '"Weather Forecast" <nhatminh772002@gmail.com>',
            to: `${email}`,
            subject: "[OTP]", // Subject line
            text: `Dự báo thời tiết hôm nay`, // plain text body
            html: modifiedHtmlContent
        });
    }

}