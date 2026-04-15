import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers["x-request-id"] || uuidv4();
    request.headers["x-request-id"] = requestId;

    const response = context.switchToHttp().getResponse();
    if (typeof response.header === "function") {
      response.header("x-request-id", requestId);
    } else if (typeof response.setHeader === "function") {
      response.setHeader("x-request-id", requestId);
    }

    const startTime = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || response.statusCode;
        console.log(
          `[${requestId}] ${request.method} ${request.url} - ${statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
