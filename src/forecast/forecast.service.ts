import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as dotenv from 'dotenv'
import { firstValueFrom, map } from 'rxjs';
import { BaseService } from '../hooks/database/base.service';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/auth/services/user.service';
dotenv.config()

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

  async notificationForecastWeather(city: string, gmail: string): Promise<any> {
    const user = await this.userService.findUserByEmail(gmail)

    if(user.email_notification) {
      user.email_notification = false
      await this.userRepository.save(user)
    } else {
      user.email_notification = true
      user.city = city
      await this.userRepository.save(user)
    }

    return 'Thành công'
  }

}