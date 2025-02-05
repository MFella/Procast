import { BehaviorSubject } from 'rxjs';
import { ComputationStatus } from '../_typings/prediction/prediction.typings';

export class ComputeInteractUtil {
  static COMPUTATION_STATUS$: BehaviorSubject<ComputationStatus> =
    new BehaviorSubject('pended');

  static ABORT_CONTROLLER: AbortController = new AbortController();
}
