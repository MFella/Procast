import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import cluster from 'cluster';

@Controller()
export class AppController {
  private static readonly VERY_BAD_NUMBER = 12345678901;
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(): any {
    // some kind of example
    // thats illustrates how cluster works
    Logger.log(`Respawed by: ${cluster.worker?.id}, ${process.pid}`);
    const data = this.appService.getData();
    for (let i = 0; i < AppController.VERY_BAD_NUMBER; i++) {
      const i = 0;
    }
    console.log('end');
    return data;
  }
}
