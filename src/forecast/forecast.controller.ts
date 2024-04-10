import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('FORECAST')
@Controller('forecast')
export class ForecastController {
  constructor(
    private readonly forecastService: ForecastService,
  ) { }

  @Get('/current/:city')
  async currentWeather(@Param('city') city: string) {
    return await this.forecastService.currentWeather(city)
  }

  @Get('/future/:city/:date')
  async forecastWeather(@Param('city') city: string, @Param('date') date: string) {
    const dateIp = new Date(date);
    const dateCr = this.forecastService.VNTime()
    
    const timeDiff = Math.abs(dateIp.getTime() - dateCr.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if(daysDiff <= 13)
      return await this.forecastService.forecastWeatherFrom0To12Day(city)
    else
      return await this.forecastService.forecastWeatherFrom13To300Day(city, dateIp)
  }
}