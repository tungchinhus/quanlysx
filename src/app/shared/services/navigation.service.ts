import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  /**
   * Navigate to a route without reloading the page
   */
  navigate(route: string, options?: NavigationExtras): void {
    this.router.navigate([route], options);
  }

  /**
   * Navigate to landing page
   */
  navigateToLanding(queryParams?: any): void {
    this.router.navigate(['/landing'], { 
      replaceUrl: true,
      queryParams: queryParams 
    });
  }

  /**
   * Navigate to a route with query parameters
   */
  navigateWithParams(route: string, params: any): void {
    this.router.navigate([route], { queryParams: params });
  }

  /**
   * Navigate to a route with state
   */
  navigateWithState(route: string, state: any): void {
    this.router.navigate([route], { state: state });
  }

  /**
   * Navigate back
   */
  navigateBack(): void {
    this.router.navigate(['../']);
  }

  /**
   * Navigate to home
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to maintenance page
   */
  navigateToMaintenance(state?: any): void {
    const navigationExtras: NavigationExtras = {
      state: state
    };
    this.router.navigate(['/maintenance'], navigationExtras);
  }

  /**
   * Navigate to result page
   */
  navigateToResult(route: string, params?: any): void {
    this.router.navigate([route], { 
      replaceUrl: true,
      queryParams: params 
    });
  }

  /**
   * Navigate to payment page
   */
  navigateToPayment(params?: any): void {
    this.router.navigate(['/payment'], { 
      replaceUrl: true,
      queryParams: params 
    });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.router.url;
  }

  /**
   * Check if current route matches
   */
  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }
} 