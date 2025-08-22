import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageKey } from '../enums/storage-key.enum';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router) { }

  /**
   * Chuyển hướng user dựa trên quyền sau khi login
   * - admin hoặc manager: chuyển về page ds-bang-ve
   * - user: chuyển về page ds-quan-day  
   * - kcs: chuyển về page kcs-check
   */
  navigateBasedOnUserRole(): void {
    // Kiểm tra xem user có đăng nhập không
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem(StorageKey.TOKEN_KEY);
    if (!token) {
      console.log('NavigationService: User not logged in, navigating to landing');
      this.router.navigate(['/landing']);
      return;
    }

    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const khauSx = localStorage.getItem('khau_sx')?.toLowerCase() || '';
    const email = localStorage.getItem('email')?.toLowerCase() || '';

    console.log('NavigationService: Determining navigation based on role:', {
      role,
      khauSx,
      email
    });

    // Kiểm tra quyền admin hoặc manager
    if (this.isAdminOrManager(role, khauSx, email)) {
      console.log('NavigationService: User is admin/manager, navigating to ds-bang-ve');
      this.router.navigate(['/ds-bang-ve']);
      return;
    }

    // Kiểm tra quyền KCS
    if (this.isKCS(role, khauSx, email)) {
      console.log('NavigationService: User is KCS, navigating to kcs-check');
      this.router.navigate(['/kcs-check']);
      return;
    }

    // Mặc định là user thường
    console.log('NavigationService: User is regular user, navigating to ds-quan-day');
    this.router.navigate(['/ds-quan-day']);
  }

  /**
   * Kiểm tra xem user có phải là admin hoặc manager không
   */
  private isAdminOrManager(role: string, khauSx: string, email: string): boolean {
    // Kiểm tra role
    if (role.includes('admin') || role.includes('manager')) {
      return true;
    }

    // Kiểm tra khau_sx
    if (khauSx.includes('admin') || khauSx.includes('manager')) {
      return true;
    }

    // Kiểm tra email
    if (email.includes('admin') || email.includes('manager')) {
      return true;
    }

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

  /**
   * Lấy route mặc định dựa trên quyền của user
   */
  getDefaultRoute(): string {
    // Kiểm tra xem user có đăng nhập không
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem(StorageKey.TOKEN_KEY);
    if (!token) {
      return '/landing';
    }

    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const khauSx = localStorage.getItem('khau_sx')?.toLowerCase() || '';
    const email = localStorage.getItem('email')?.toLowerCase() || '';

    if (this.isAdminOrManager(role, khauSx, email)) {
      return '/ds-bang-ve';
    }

    if (this.isKCS(role, khauSx, email)) {
      return '/kcs-check';
    }

    return '/ds-quan-day';
  }
} 