import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { Messages } from 'src/db/models/messages.entity';

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    // here is the path to the entities folder: src\db\models\messages.entity.ts
    const migrationsPath = path.join(__dirname, '..', '..', 'migration');
    const entitiesPath = path.join(
      __dirname,
      '..',
      'db',
      'models',
      '*{.ts,.js}',
    );

    console.log('entitiesPath', entitiesPath);

    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      entities: [Messages],
      migrationsTableName: 'migration',
      migrations: [path.join(migrationsPath, '*{.ts,.js}')],
      ssl: true,
      synchronize: false,
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
