import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as dotenv from 'dotenv'
import { firstValueFrom, map } from 'rxjs';
import { BaseService } from '../hooks/database/base.service';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
dotenv.config()

@Injectable()
export class ForecastService extends BaseService<User> {
  private weather_api = process.env.WEATHER_API
  private weather_api_key = process.env.WEATHER_API_KEY

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService
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

  async forecastWeatherFrom13To300Day(city: string, date: Date): Promise<any> {
    const year = date.getFullYear().toString().padStart(4, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    var day = parseInt(date.getDate().toString().padStart(2, "0"))
    var data = []
    for(let i=0; i<4; day++,i++) {
      var dateForecast = year + '-' + month + '-' + day
      const url = this.weather_api + '/future.json?q=' + city + '&lang=vi&dt=' + dateForecast + '&key=' + this.weather_api_key
      const response = await firstValueFrom(this.httpService.get<any>(url).pipe(map((resp) => resp.data)))
      data = [...data, ...response.forecast.forecastday]
    }

    return data
  }

}