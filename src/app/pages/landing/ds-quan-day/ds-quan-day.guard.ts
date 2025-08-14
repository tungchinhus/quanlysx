import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthServices } from '../../../shared/services/authen/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WindingAccessGuard implements CanActivate {
  
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
    
    console.log('WindingAccessGuard checking route:', state.url);
    console.log('Is logged in:', isLoggedIn);
    console.log('Token exists:', !!token);
    
    if (!isLoggedIn || !token) {
      console.log('WindingAccessGuard: Not logged in, redirecting to landing');
      this.router.navigate(['/landing']);
      return false;
    }

    // Get user info and check khau_sx
    const currentUser = this.authService.getUserInfoFromStorage();
    const khauSx = currentUser?.khau_sx || '';
    
    console.log('User khau_sx:', khauSx);
    
    // Check if user has access to winding operations
    const hasWindingAccess = khauSx.includes('boidayha') || 
                             khauSx.includes('boidaycao') ||
                             khauSx.includes('quanday');
    
    if (hasWindingAccess) {
      console.log('WindingAccessGuard: Access granted - user has winding access');
      return true;
    }
    
    console.log('WindingAccessGuard: Access denied - user does not have winding access');
    console.log('User khau_sx:', khauSx, 'does not include winding operations');
    
    // Redirect to landing page with message
    this.router.navigate(['/landing'], { 
      queryParams: { 
        message: 'Bạn không có quyền truy cập trang quấn dây. Chỉ user có khâu sản xuất quấn dây mới được phép truy cập.' 
      } 
    });
    return false;
  }
}
