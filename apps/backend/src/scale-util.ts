import cluster, { Worker } from 'cluster';
import * as os from 'os';
import { IpcHandler } from './app/ipc/ipc.handler';

type FunctionCb = (...args: any[]) => Promise<void>;

export type ScaleOps = {
  scaleHorizontally(masterCb: FunctionCb, slaveCb: FunctionCb): Promise<void>;
};

export class ScaleUtil implements ScaleOps {
  private static readonly CPUS_COUNT = os.cpus().length;
  public static readonly WORKER_MAP = new Map<number, Worker>();

  async scaleHorizontally(
    masterCb?: FunctionCb,
    slaveCb?: FunctionCb
  ): Promise<void> {
    if (cluster.isPrimary) {
      await masterCb?.();
      this.respawnProcesses();
      IpcHandler.listenToMessageEvent({ workers: cluster.workers });
      return;
    }

    await slaveCb?.();
  }

  private respawnProcesses(): void {
    for (let i = 0; i < ScaleUtil.CPUS_COUNT; i++) {
      const worker = cluster.fork();
      ScaleUtil.WORKER_MAP.set(worker.process.pid, worker);
    }

    cluster.on('exit', ({ process }) => {
      console.log(`Worker with id ${process.pid} died. Restarting...`);
      ScaleUtil.WORKER_MAP.delete(process.pid);
      const respawnedWorker = cluster.fork();

      ScaleUtil.WORKER_MAP.set(respawnedWorker.process.pid, respawnedWorker);
      IpcHandler.listenToMessageEvent({ worker: respawnedWorker });
    });
  }
}

export default new ScaleUtil();
