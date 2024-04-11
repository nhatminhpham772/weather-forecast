import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ApiTags } from '@nestjs/swagger';
import AppResponse, { AppResponseInterface } from 'src/config/sections/app.response';

@ApiTags('FORECAST')
@Controller('forecast')
export class ForecastController {
  private res: AppResponseInterface = AppResponse
  constructor(
    private readonly forecastService: ForecastService,
  ) { }

  @Get('/current/:city')
  async currentWeather(@Param('city') city: string, @Res() res) {
    try {
      let data = await this.forecastService.currentWeather(city)
      return this.res.setLib(res).setStatus(200).setBody(data).release()
    } catch (error) {
      return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
    }
  }

  @Get('/future/:city/:date')
  async forecastWeather(@Param('city') city: string, @Param('date') date: string, @Res() res) {
    const dateIp = new Date(date);
    const dateCr = this.forecastService.VNTime()
    
    const timeDiff = Math.abs(dateIp.getTime() - dateCr.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if(daysDiff <= 13)
      try {
        let data = await this.forecastService.forecastWeatherFrom0To12Day(city)
        return this.res.setLib(res).setStatus(200).setBody(data).release()
      } catch (error) {
        return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
      }
    else
      try {
        let data = await this.forecastService.forecastWeatherFrom13To300Day(city, dateIp)
        return this.res.setLib(res).setStatus(200).setBody(data).release()
      } catch (error) {
        return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
      }
  }
}