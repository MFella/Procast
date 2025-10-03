import { TypeHelper } from '../_helpers/type-helper';
import { ProcessSendPayload } from '../_typings/ipc/ipc.typings';
import { TrainModelWorker } from '../_workers/train-model.worker';
import { Worker } from 'cluster';

export class IpcHandler {
  private static readonly JOB_ID_TO_TRAIN_PROCESS_ID_MAP = new Map<
    string,
    number
  >();

  static sendMessage(payload: ProcessSendPayload): void {
    process.send(payload);
  }

  static listenToMessageEvent(workers: NodeJS.Dict<Worker>): void {
    for (const id in workers) {
      workers[id].on('message', IpcHandler.handleMessage);
    }
  }

  private static handleMessage(payload: ProcessSendPayload): void {
    switch (payload.action) {
      case 'cancel':
        {
          const jobId = payload.jobId;
          const pidToKill =
            IpcHandler.JOB_ID_TO_TRAIN_PROCESS_ID_MAP.get(jobId);
          console.log(IpcHandler.JOB_ID_TO_TRAIN_PROCESS_ID_MAP);

          if (pidToKill != null) {
            console.log('Process is about to be killed');
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
