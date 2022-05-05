import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as AWSXRayExpress from 'aws-xray-sdk-express';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    AWSXRayExpress.openSegment(process.env.AWS_LAMBDA_FUNCTION_NAME);
    return next.handle().pipe(tap(() => AWSXRayExpress.closeSegment()));
  }
}
