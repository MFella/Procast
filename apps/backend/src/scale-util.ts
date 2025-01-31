import cluster from 'cluster';
import * as os from 'os';

type FunctionCb = (...args: any[]) => void;

export type ScaleOps = {
  scaleHorizontally(masterCb: FunctionCb, slaveCb: FunctionCb): void;
};

class ScaleUtil implements ScaleOps {
  private static readonly CPUS_COUNT = os.cpus().length;

  scaleHorizontally(masterCb?: FunctionCb, slaveCb?: FunctionCb): void {
    if (cluster.isPrimary) {
      this.respawnProcesses();
      masterCb?.();
      return;
    }

    slaveCb?.();
  }

  private respawnProcesses(): void {
    for (let i = 0; i < ScaleUtil.CPUS_COUNT; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      console.log(`Worker with id ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  }
}

export default new ScaleUtil();
