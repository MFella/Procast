import fs from 'fs';
import dotenv from 'dotenv';
import { environment } from './src/environments/environment';

dotenv.configDotenv({ path: '.env' });

const environmentFilePath = './src/environments/environment.ts';
const writeEnvironmentFile = (): void => {
  let stringifiedObject = Object.entries(environment)
    .map(([key]) => `\t${key}: '${process.env[key.toUpperCase()]}',`)
    .join('\n');

  fs.writeFileSync(
    environmentFilePath,
    `export const environment = {\n${stringifiedObject}\n};`
  );
};

try {
  writeEnvironmentFile();
} catch (error) {
  console.error('Cannot fill environment file');
}
