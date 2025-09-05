import { ClientReadableStream } from 'grpc-web';
import { Observable } from 'rxjs';
import { Message as GrpcMessage } from 'google-protobuf';

export const convertClientStreamToObservable = <U extends GrpcMessage>(
  clientStream: ClientReadableStream<U>
): Observable<U> => {
  return new Observable<U>((observer) => {
    clientStream.on('data', (data) => {
      observer.next(data);
    });

    clientStream.on('end', () => {
      observer.complete();
      observer.unsubscribe();
    });
  });
};
