import cluster from 'cluster';
import * as os from 'os';

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
      this.respawnProcesses();
      return;
    }

    await slaveCb?.();
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
