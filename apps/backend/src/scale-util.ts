import cluster from 'cluster';
import * as os from 'os';
import { Worker } from 'cluster';
import { TrainModelWorker } from './app/_workers/train-model.worker';

type FunctionCb = (...args: any[]) => Promise<void>;

export type ScaleOps = {
  scaleHorizontally(masterCb: FunctionCb, slaveCb: FunctionCb): Promise<void>;
};

class ScaleUtil implements ScaleOps {
  private static readonly CPUS_COUNT = os.cpus().length;

  async scaleHorizontally(
    masterCb?: FunctionCb,
    slaveCb?: FunctionCb
  ): Promise<void> {
    if (cluster.isPrimary) {
      await masterCb?.();
      this.listenToMessageEvent(this.respawnProcesses());
      return;
    }

    process.on('message', () => {
      console.log('wtff', process.pid);
    });
    await slaveCb?.();
  }

  private respawnProcesses(): Map<number, Worker> {
    const workersMap = new Map<number, Worker>();
    for (let i = 0; i < ScaleUtil.CPUS_COUNT; i++) {
      const worker = cluster.fork();
      workersMap.set(worker.id, worker);
    }

    cluster.on('exit', (worker) => {
      console.log(`Worker with id ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
    return workersMap;
  }

  private listenToMessageEvent(workersMap: Map<number, Worker>): void {
    for (const id in cluster.workers) {
      cluster.workers[id].on(
        'message',
        (message: Record<'pid' | 'computationProgress' | 'jobId', number>) => {
          const [pid, progress, jobId] = [
            message.pid,
            message.computationProgress,
            message.jobId + '',
          ];
          if (pid && progress && jobId) {
            // console.log('pid', process.pid, message.jobId);
            TrainModelWorker.COMPUTATION_PROGRESS$.next({
              jobId,
              progress,
            });
          }
        }
      );
    }
  }
}

export default new ScaleUtil();
