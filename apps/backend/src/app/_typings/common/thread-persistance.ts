import { BehaviorSubject } from 'rxjs';

export type ThreadPersistance = {
  isPrimary: boolean;
  computationProgress$: BehaviorSubject<number>;
};
