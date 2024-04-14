import { Module } from '@nestjs/common';
import { postgresOption, rateLimiting, redisClientOption } from './connection.provider';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ThrottlerModule } from '@nestjs/throttler'


@Module({
    imports: [
        CacheModule.register<RedisClientOptions>({
            isGlobal: true,
            ...redisClientOption
        }),
        ThrottlerModule.forRoot([
            ...rateLimiting
        ])
    ]
})
export class ConnectionModule { }