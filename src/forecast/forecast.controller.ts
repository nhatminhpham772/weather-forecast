import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Inject, UseGuards, Req } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import AppResponse, { AppResponseInterface } from '../config/sections/app.response';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { JwtGuard } from '../auth/guards/jwt.guard';

@ApiTags('FORECAST')
@Controller('forecast')
export class ForecastController {
  private res: AppResponseInterface = AppResponse
  constructor(
    private readonly forecastService: ForecastService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  @Get('/current/:city')
  async currentWeather(@Param('city') city: string, @Res() res) {
    try {
      let data = await this.forecastService.currentWeather(city)

      var datetime = new Date(data.location.localtime)
      var dateString = this.forecastService.convertDateToString(datetime)
      await this.cacheManager.set(city + ' ' + dateString + ' ' + datetime.getHours(), data)

      return this.res.setLib(res).setStatus(200).setBody(data).release()
    } catch (error) {
      return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
    }
  }

  @Get('/history/:city')
  async historyWeatherInDay(@Param('city') city: string, @Res() res) {
    try {
      var datetime = new Date()
      var dateString = this.forecastService.convertDateToString(datetime)

      const redisKeys = await this.cacheManager.store.keys();
      redisKeys.filter((item) => item.includes(city + ' ' + dateString)).slice(-5)

      const data = []
      for (const key of redisKeys) {
        data.push(await this.cacheManager.get(key))
      }

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

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Patch('/notification/:city/:active')
  async notificationForecastWeather(@Param('city') city: string, @Param('active') active: boolean, @Req() req, @Res() res) {
    try {
      let data = await this.forecastService.notificationForecastWeather(city, active, req.user.email)

      return this.res.setLib(res).setStatus(200).setBody(data).release()
    } catch (error) {
      return this.res.setLib(res).setStatus(400).setBody(error.toString()).release()
    }
  }
}