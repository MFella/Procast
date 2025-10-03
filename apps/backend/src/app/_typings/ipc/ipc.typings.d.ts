export type ProcessActionType =
  | 'cancel'
  | 'register-training'
  | 'unregister-training'
  | 'training-begin'
  | 'training-progress';

export type ProcessSendBasePayload = {
  jobId: string;
};

export type CancelTrainingSendPayload = {
  action: 'cancel';
};

export type DeregisterTrainingSendPayload = {
  action: 'unregister-training' | 'register-training';
  pid: number;
};

export type TrainingProgressSendPayload = {
  action: 'training-begin' | 'training-progress';
  computationProgress: number;
  pid: number;
  result?: [number, number];
};

export type ProcessSendPayload = ProcessSendBasePayload &
  (
    | TrainingProgressSendPayload
    | DeregisterTrainingSendPayload
    | CancelTrainingSendPayload
  );
