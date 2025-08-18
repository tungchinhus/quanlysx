import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface BoiDayHaData {
  id: number;
  kyhieuquanday: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  ngay_san_xuat: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
}

export interface BoiDayCaoData {
  id: number;
  kyhieuquanday: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  ngay_san_xuat: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
}

export interface EpBoiDayData {
  id: number;
  kyhieuquanday: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  bd_ep: string;
  bung_bd: number;
  ngay_hoan_thanh: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class KcsCheckService {

  constructor(private http: HttpClient) {}

  // Get Bối dây hạ data
  getBoiDayHaData(): Observable<BoiDayHaData[]> {
    // TODO: Replace with actual API call
    // return this.http.get<BoiDayHaData[]>('/api/kcs-check/boi-day-ha');
    
    // Mock data for now
    const mockData: BoiDayHaData[] = [
      {
        id: 1,
        kyhieuquanday: 'BDH001',
        congsuat: '100',
        tbkt: 'TBKT001',
        dienap: '22kV',
        quy_cach_day: '2.5mm²',
        so_soi_day: 2,
        nha_san_xuat: 'Công ty A',
        ngay_san_xuat: new Date('2024-01-15'),
        trang_thai: 'pending'
      },
      {
        id: 2,
        kyhieuquanday: 'BDH002',
        congsuat: '200',
        tbkt: 'TBKT002',
        dienap: '35kV',
        quy_cach_day: '4.0mm²',
        so_soi_day: 3,
        nha_san_xuat: 'Công ty B',
        ngay_san_xuat: new Date('2024-01-16'),
        trang_thai: 'approved'
      }
    ];
    
    return of(mockData).pipe(delay(500)); // Simulate API delay
  }

  // Get Bối dây cao data
  getBoiDayCaoData(): Observable<BoiDayCaoData[]> {
    // TODO: Replace with actual API call
    // return this.http.get<BoiDayCaoData[]>('/api/kcs-check/boi-day-cao');
    
    // Mock data for now
    const mockData: BoiDayCaoData[] = [
      {
        id: 1,
        kyhieuquanday: 'BDC001',
        congsuat: '100',
        tbkt: 'TBKT001',
        dienap: '22kV',
        quy_cach_day: '1.5mm²',
        so_soi_day: 1,
        nha_san_xuat: 'Công ty C',
        ngay_san_xuat: new Date('2024-01-16'),
        trang_thai: 'pending'
      },
      {
        id: 2,
        kyhieuquanday: 'BDC002',
        congsuat: '200',
        tbkt: 'TBKT002',
        dienap: '35kV',
        quy_cach_day: '2.5mm²',
        so_soi_day: 2,
        nha_san_xuat: 'Công ty D',
        ngay_san_xuat: new Date('2024-01-17'),
        trang_thai: 'rejected'
      }
    ];
    
    return of(mockData).pipe(delay(500)); // Simulate API delay
  }

  // Get Ép bối dây data
  getEpBoiDayData(): Observable<EpBoiDayData[]> {
    // TODO: Replace with actual API call
    // return this.http.get<EpBoiDayData[]>('/api/kcs-check/ep-boi-day');
    
    // Mock data for now
    const mockData: EpBoiDayData[] = [
      {
        id: 1,
        kyhieuquanday: 'EP001',
        congsuat: '100',
        tbkt: 'TBKT001',
        dienap: '22kV',
        bd_ep: 'EP-BD-001',
        bung_bd: 4,
        ngay_hoan_thanh: new Date('2024-01-17'),
        trang_thai: 'pending'
      },
      {
        id: 2,
        kyhieuquanday: 'EP002',
        congsuat: '200',
        tbkt: 'TBKT002',
        dienap: '35kV',
        bd_ep: 'EP-BD-002',
        bung_bd: 6,
        ngay_hoan_thanh: new Date('2024-01-18'),
        trang_thai: 'approved'
      }
    ];
    
    return of(mockData).pipe(delay(500)); // Simulate API delay
  }

  // Approve item
  approveItem(type: string, id: number): Observable<any> {
    // TODO: Replace with actual API call
    // return this.http.post(`/api/kcs-check/${type}/approve`, { id });
    
    console.log(`Approving ${type} item with id: ${id}`);
    return of({ success: true, message: 'Item approved successfully' }).pipe(delay(300));
  }

  // Reject item
  rejectItem(type: string, id: number, reason?: string): Observable<any> {
    // TODO: Replace with actual API call
    // return this.http.post(`/api/kcs-check/${type}/reject`, { id, reason });
    
    console.log(`Rejecting ${type} item with id: ${id}, reason: ${reason}`);
    return of({ success: true, message: 'Item rejected successfully' }).pipe(delay(300));
  }

  // Get item details
  getItemDetails(type: string, id: number): Observable<any> {
    // TODO: Replace with actual API call
    // return this.http.get(`/api/kcs-check/${type}/${id}`);
    
    console.log(`Getting details for ${type} item with id: ${id}`);
    return of({ success: true, data: {} }).pipe(delay(200));
  }
}
