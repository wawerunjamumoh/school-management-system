
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly client: Redis;

    constructor(private readonly config: ConfigService) {
        const url = this.config.get<string>('REDIS_URL');

        if (!url) {
            throw new Error('REDIS_URL must be configured');
        }

        const commandTimeout = Number(
            this.config.get<string>('REDIS_COMMAND_TIMEOUT_MS') ?? 500,
        );

        if (!Number.isFinite(commandTimeout) || commandTimeout <= 0) {
            throw new Error('REDIS_COMMAND_TIMEOUT_MS must be positive');
        }

        this.client = new Redis(url, {
            lazyConnect: true,
            connectTimeout: 1000,
            commandTimeout,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (attempt) => Math.min(attempt * 250, 2000),
        });

        this.client.on('error', (error: Error) => {
            this.logger.warn(`Redis error: ${error.message}`);
        });

        this.client.on('ready', () => {
            this.logger.log('Redis connection ready');
        });

        this.client.on('reconnecting', () => {
            this.logger.warn('Redis reconnecting');
        });
    }

    async onModuleInit(): Promise<void> {
        try {
            await this.client.connect();
        } catch (error) {
            // Redis is an optimization, not the source of truth.
            // Actual cache operations also handle failures below.
            this.logger.warn(
                `Redis unavailable during startup: ${this.errorMessage(error)}`,
            );
        }
    }

    async getJson<T>(key: string): Promise<T | null> {
        try {
            const raw = await this.client.get(key);

            if (raw === null) {
                return null;
            }

            try {
                return JSON.parse(raw) as T;
            } catch {
                // Remove corrupt cache data on a best-effort basis.
                await this.delete(key);
                this.logger.warn(`Invalid JSON removed from cache: ${key}`);
                return null;
            }
        } catch (error) {
            this.logger.warn(`Cache read failed: ${this.errorMessage(error)}`);
            return null;
        }
    }

    async setJson<T>(
        key: string,
        value: T,
        ttlSeconds: number,
    ): Promise<boolean> {
        if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
            throw new Error('Cache TTL must be a positive number of seconds');
        }

        try {
            await this.client.set(
                key,
                JSON.stringify(value),
                'EX',
                Math.ceil(ttlSeconds),
            );

            return true;
        } catch (error) {
            this.logger.warn(`Cache write failed: ${this.errorMessage(error)}`);
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            this.logger.warn(
                `Cache invalidation failed: ${this.errorMessage(error)}`,
            );
            return false;
        }
    }

    async ping(): Promise<boolean> {
        try {
            return (await this.client.ping()) === 'PONG';
        } catch {
            return false;
        }
    }

    async onModuleDestroy(): Promise<void> {
        this.client.disconnect();
    }

    private errorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Unknown error';
    }
}
