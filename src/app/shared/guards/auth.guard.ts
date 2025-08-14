import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthServices } from '../services/authen/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const token = this.authService.getToken();
    
    console.log('AuthGuard checking route:', state.url);
    console.log('Is logged in:', isLoggedIn);
    console.log('Token exists:', !!token);
    
    if (isLoggedIn && token) {
      console.log('AuthGuard: Access granted');
      return true;
    }
    
    console.log('AuthGuard: Access denied, redirecting to login');
    this.router.navigate(['/landing']);
    return false;
  }
}
