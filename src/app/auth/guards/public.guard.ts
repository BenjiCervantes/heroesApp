import { ActivatedRouteSnapshot, CanActivateFn, CanMatchFn, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

const checkLoginStatus = (): Observable<boolean> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.checkAuthentication()
    .pipe(

      tap( (isAuthenticated) => console.log('Authenticated: ', isAuthenticated)),
      tap( (isAuthenticated) => {
        if( isAuthenticated ){
          router.navigate(['./'])
        }
      }),
      map(isAuthenticated => !isAuthenticated)
    )
}

export const canActivateLoginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return checkLoginStatus();
};

export const canMatchLoginGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {

  return checkLoginStatus();
};
