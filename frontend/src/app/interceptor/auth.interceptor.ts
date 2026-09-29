import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {UserService} from '../services/user.service';
import {inject} from '@angular/core';
import {from, mergeMap, Observable} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const us = inject(UserService);
  return from(us.getToken())
    .pipe(
      mergeMap(token=> next(
        !token
          ? req
          : req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          })
      ))
    );
};
