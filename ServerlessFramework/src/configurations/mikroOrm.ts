// mikro-orm-config.ts
import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { config } from '../mikroOrmConfig';
import { LoggerService } from 'packages/aw-logger';

let ormInstances: MikroORMConfig | null = null;

export class MikroORMConfig {
  private logger = new LoggerService({ serviceName: MikroORMConfig.name });
  private orm: MikroORM | null = null;
  private isOrmInitialized: boolean = false;

  public static getInstance(): MikroORMConfig {
    if (!ormInstances) {
      ormInstances = new MikroORMConfig();
    }
    return ormInstances;
  }

  public async initialize(): Promise<MikroORM> {
    if (!this.isOrmInitialized) {
      this.logger.info('DB connection initialized');
      this.orm = await MikroORM.init<PostgreSqlDriver>(config);
      this.isOrmInitialized = true;
    } else {
      this.logger.info('DB connection exist');
    }

    return this.orm;
  }

  public async closeConnection(): Promise<void> {
    if (this.isOrmInitialized && this.orm) {
      await this.orm.close(true);
      this.orm = null;
      this.isOrmInitialized = false;
    }
  }

  public ormInitialized(): boolean {
    return this.isOrmInitialized;
  }
}

export const ormInstance = MikroORMConfig.getInstance();
