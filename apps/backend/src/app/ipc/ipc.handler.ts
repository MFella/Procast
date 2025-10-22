import { ScaleUtil } from '../../scale-util';
import { TypeHelper } from '../_helpers/type-helper';
import {
  ListenToProcessMessageEventPayload,
  ProcessSendPayload,
} from '../_typings/ipc/ipc.typings';
import { TrainModelWorker } from '../_workers/train-model.worker';
import { ComputeInteractUtil } from '../util/compute-interact.util';

export class IpcHandler {
  private static readonly JOB_ID_TO_TRAIN_PROCESS_ID_MAP = new Map<
    string,
    number
  >();

  static sendMessage(payload: ProcessSendPayload): void {
    process.send(payload);
  }

  static listenToMessageEvent(
    payload: ListenToProcessMessageEventPayload
  ): void {
    if ('worker' in payload) {
      payload.worker.on('message', IpcHandler.handleMessage);
      return;
    }

    for (const id in payload.workers) {
      payload.workers[id].on('message', IpcHandler.handleMessage);
    }
  }

  private static handleMessage(payload: ProcessSendPayload): void {
    switch (payload.action) {
      case 'cancel':
        {
          ComputeInteractUtil.ABORT_CONTROLLER.abort('Computation cancelled');

          const jobId = payload.jobId;
          const pidToKill =
            IpcHandler.JOB_ID_TO_TRAIN_PROCESS_ID_MAP.get(jobId);

          if (pidToKill != null) {
            IpcHandler.JOB_ID_TO_TRAIN_PROCESS_ID_MAP.delete(jobId);
            process.kill(pidToKill);
          } else {
            console.log('Cannot kill process - not exist in map');
          }
        }
        break;
      case 'register-training':
        {
          console.log('Training registered');
          const [jobId, pid] = [payload.jobId, payload.pid];
          IpcHandler.JOB_ID_TO_TRAIN_PROCESS_ID_MAP.set(jobId, pid);
        }
        break;
      case 'unregister-training':
        {
          const jobId = payload.jobId;
          IpcHandler.JOB_ID_TO_TRAIN_PROCESS_ID_MAP.delete(jobId);
        }
        break;
      case 'training-begin':
      case 'training-progress':
        {
          const [jobId, progress] = [
            payload.jobId,
            payload.computationProgress,
          ];
          TrainModelWorker.COMPUTATION_PROGRESS$.next({
            jobId,
            progress,
            ...('result' in payload &&
            TypeHelper.isTwoNumberTuple(payload.result)
              ? { result: payload.result }
              : {}),
          });
        }
        break;
    }
  }
}
