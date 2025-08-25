import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthServices } from '../services/authen/auth.service';

@Injectable({
  providedIn: 'root'
})
export class KcsGuard implements CanActivate {
  
  constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Kiểm tra xem user có đăng nhập không
    const isLoggedIn = this.authService.isLoggedIn();
    const token = this.authService.getToken();
    
    console.log('KcsGuard checking route:', state.url);
    console.log('Is logged in:', isLoggedIn);
    console.log('Token exists:', !!token);
    
    if (!isLoggedIn || !token) {
      console.log('KcsGuard: User not logged in, redirecting to landing');
      this.router.navigate(['/landing']);
      return false;
    }

    // Kiểm tra quyền KCS
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const khauSx = localStorage.getItem('khau_sx')?.toLowerCase() || '';
    const email = localStorage.getItem('email')?.toLowerCase() || '';

    console.log('KcsGuard checking KCS permissions:', { role, khauSx, email });

    // Kiểm tra xem user có phải là KCS không
    if (this.isKCS(role, khauSx, email)) {
      console.log('KcsGuard: Access granted - User is KCS');
      return true;
    }
    
    console.log('KcsGuard: Access denied - User is not KCS, redirecting to landing');
    this.router.navigate(['/landing']);
    return false;
  }

  /**
   * Kiểm tra xem user có phải là KCS không
   */
  private isKCS(role: string, khauSx: string, email: string): boolean {
    // Kiểm tra role
    if (role.includes('kcs')) {
      return true;
    }

    // Kiểm tra khau_sx
    if (khauSx.includes('kcs')) {
      return true;
    }

    // Kiểm tra email
    if (email.includes('kcs')) {
      return true;
    }

    return false;
  }
}
