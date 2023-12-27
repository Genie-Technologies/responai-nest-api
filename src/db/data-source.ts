import { DataSource, DataSourceOptions } from "typeorm";
import { Messages } from "./models/messages.entity";
import { Users } from "./models/users.entity";
import { Threads } from "./models/threads.entity";
import { Participants } from "./models/participants.entity";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public getValue(key: string, throwOnMissing = true): string {
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
    return this.getValue("PORT", true);
  }

  public isProduction() {
    const mode = this.getValue("MODE", false);
    return mode != "DEV";
  }
}

const configService = new ConfigService(process.env).ensureValues([
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DATABASE",
  "VECTOR_POSTGRES_HOST",
  "VECTOR_POSTGRES_PORT",
  "VECTOR_POSTGRES_USER",
  "VECTOR_POSTGRES_PASSWORD",
  "VECTOR_POSTGRES_DATABASE",
]);

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: configService.getValue("POSTGRES_HOST"),
  port: parseInt(configService.getValue("POSTGRES_PORT")),
  username: configService.getValue("POSTGRES_USER"),
  password: configService.getValue("POSTGRES_PASSWORD"),
  database: configService.getValue("POSTGRES_DATABASE"),
  entities: [Messages, Users, Threads, Participants],
  migrationsTableName: "migration",
  migrations: ["dist/db/migrations/*{.ts,.js}"],
  synchronize: !configService.isProduction(),
  // must be commented out for local development
  ssl: configService.isProduction(),
};

console.log("IS_PROD", configService.isProduction());

export const vectorSourceOptions: DataSourceOptions = {
  name: "vectordbConnection",
  type: "postgres",
  host: configService.getValue("VECTOR_POSTGRES_HOST"),
  port: parseInt(configService.getValue("VECTOR_POSTGRES_PORT")),
  username: configService.getValue("VECTOR_POSTGRES_USER"),
  password: configService.getValue("VECTOR_POSTGRES_PASSWORD"),
  database: configService.getValue("VECTOR_POSTGRES_DATABASE"),
  migrationsTableName: "migration",
  migrations: ["dist/db/migrations/*{.ts,.js}"],
  synchronize: false,

  // must be commented out for local development
  ssl: configService.isProduction(),
};

export const dataSource = new DataSource(dataSourceOptions);
export const vectorDataSource = new DataSource(vectorSourceOptions);

export { configService };
