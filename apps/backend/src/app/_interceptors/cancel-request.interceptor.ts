import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { filter, forkJoin, fromEvent, Observable, take, takeUntil } from 'rxjs';
import { Response } from 'express';
import { ComputeInteractUtil } from '../util/compute-interact.util';

@Injectable()
export class CancelRequestInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse() as Response;
    forkJoin([
      fromEvent(response, 'close').pipe(take(1)),
      ComputeInteractUtil.COMPUTATION_STATUS$.pipe(
        filter((status) => status === 'training'),
        take(1)
      ),
    ])
      .pipe(
        takeUntil(
          ComputeInteractUtil.COMPUTATION_STATUS$.pipe(
            filter((status) => status === 'trained')
          )
        )
      )
      .subscribe(() => {
        // when model is training, computation should be cancelled
        // TODO: separate computation to separate thread/worker
        // process.exit(0);
        ComputeInteractUtil.ABORT_CONTROLLER.abort();
      });

    return next.handle();
  }
}
