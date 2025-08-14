import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WindingData, BangVeData } from '../models/winding.model';

@Injectable({
  providedIn: 'root'
})
export class DSQuanDayService {

  constructor() { }

  // Get new windings (trang_thai = 0)
  getNewWindings(userId: string, windingType: 'ha' | 'cao'): Observable<WindingData[]> {
    // Mock data - replace with actual API call
    const mockData: WindingData[] = [
      {
        id: 1,
        masothe_bd_cao: windingType === 'cao' ? 'BD001' : undefined,
        masothe_bd_ha: windingType === 'ha' ? 'BD001' : undefined,
        masothe_ep_bd: 'EP001',
        kyhieubangve: 'fsfsdf mới',
        ngaygiacong: new Date('2025-08-12'),
        nguoigiacong: 'Nguyễn Văn A',
        quycachday: '2.5mm²',
        sosoiday: 10,
        ngaysanxuat: new Date('2025-08-10'),
        nhasanxuat: 'Công ty ABC',
        chieuquanday: 'Thuận chiều',
        mayquanday: 'Máy 001',
        trang_thai: 0,
        user_update: 'current_user',
        created_at: new Date(),
        congsuat: '343',
        tbkt: 'fsdf',
        dienap: 'fsdf'
      },
      {
        id: 2,
        masothe_bd_cao: windingType === 'cao' ? 'BD002' : undefined,
        masothe_bd_ha: windingType === 'ha' ? 'BD002' : undefined,
        masothe_ep_bd: 'EP002',
        kyhieubangve: 'fdsf mới',
        ngaygiacong: new Date('2025-08-12'),
        nguoigiacong: 'Trần Thị B',
        quycachday: '3.0mm²',
        sosoiday: 12,
        ngaysanxuat: new Date('2025-08-11'),
        nhasanxuat: 'Công ty XYZ',
        chieuquanday: 'Ngược chiều',
        mayquanday: 'Máy 002',
        trang_thai: 0,
        user_update: 'current_user',
        created_at: new Date(),
        congsuat: '4',
        tbkt: 'sff',
        dienap: 'sfdfs'
      }
    ];

    return of(mockData);
  }

  // Get in progress windings (trang_thai = 2 - đang gia công)
  getInProgressWindings(userId: string, windingType: 'ha' | 'cao'): Observable<WindingData[]> {
    // Mock data - replace with actual API call
    const mockData: WindingData[] = [
      {
        id: 3,
        masothe_bd_cao: windingType === 'cao' ? 'BD003' : undefined,
        masothe_bd_ha: windingType === 'ha' ? 'BD003' : undefined,
        masothe_ep_bd: 'EP003',
        kyhieubangve: 'đang gia công',
        ngaygiacong: new Date('2025-08-12'),
        nguoigiacong: 'Lê Văn C',
        quycachday: '3.5mm²',
        sosoiday: 13,
        ngaysanxuat: new Date('2025-08-09'),
        nhasanxuat: 'Công ty DEF',
        chieuquanday: 'Thuận chiều',
        mayquanday: 'Máy 003',
        trang_thai: 2,
        user_update: 'current_user',
        created_at: new Date(),
        congsuat: '250',
        tbkt: 'TBKT003',
        dienap: '11kV'
      }
    ];

    return of(mockData);
  }


  // Get completed windings (trang_thai = 1)
  getCompletedWindings(userId: string, windingType: 'ha' | 'cao'): Observable<WindingData[]> {
    // Mock data - replace with actual API call
    const mockData: WindingData[] = [
      {
        id: 4,
        masothe_bd_cao: windingType === 'cao' ? 'BD004' : undefined,
        masothe_bd_ha: windingType === 'ha' ? 'BD004' : undefined,
        masothe_ep_bd: 'EP004',
        kyhieubangve: 'đs mới',
        ngaygiacong: new Date('2025-08-12'),
        nguoigiacong: 'Phạm Thị D',
        quycachday: '4.0mm²',
        sosoiday: 15,
        ngaysanxuat: new Date('2025-08-08'),
        nhasanxuat: 'Công ty GHI',
        chieuquanday: 'Ngược chiều',
        mayquanday: 'Máy 004',
        trang_thai: 1,
        user_update: 'current_user',
        created_at: new Date(),
        congsuat: '443',
        tbkt: 'sfd',
        dienap: 'sdffd'
      },
      {
        id: 5,
        masothe_bd_cao: windingType === 'cao' ? 'BD005' : undefined,
        masothe_bd_ha: windingType === 'ha' ? 'BD005' : undefined,
        masothe_ep_bd: 'EP005',
        kyhieubangve: 'dfdsf mới',
        ngaygiacong: new Date('2025-08-12'),
        nguoigiacong: 'Võ Văn E',
        quycachday: '3.5mm²',
        sosoiday: 14,
        ngaysanxuat: new Date('2025-08-07'),
        nhasanxuat: 'Công ty JKL',
        chieuquanday: 'Thuận chiều',
        mayquanday: 'Máy 005',
        trang_thai: 1,
        user_update: 'current_user',
        created_at: new Date(),
        congsuat: '33',
        tbkt: 'fdsf',
        dienap: 'fsfds'
      }
    ];

    return of(mockData);
  }

  // Get bang ve details by ký hiệu
  getBangVeDetails(kyhieubangve: string): Observable<BangVeData> {
    // Mock data - replace with actual API call
    const mockBangVe: BangVeData = {
      id: 1,
      kyhieubangve: kyhieubangve,
      congsuat: '1000',
      tbkt: 'TBKT001',
      dienap: '22kV',
      soboiday: 5,
      bd_ha_trong: 2,
      bd_ha_ngoai: 2,
      bd_cao: 1,
      bd_ep: 1,
      bung_bd: 'Bưng BD001',
      user_create: 'current_user',
      trang_thai: 1,
      created_at: new Date(),
      IsActive: true
    };

    return of(mockBangVe);
  }

  // Update winding status
  updateWindingStatus(windingId: number, newStatus: number): Observable<boolean> {
    // Mock implementation - replace with actual API call
    console.log(`Updating winding ${windingId} to status ${newStatus}`);
    return of(true);
  }

  // Get winding details by ID
  getWindingDetails(windingId: number): Observable<WindingData> {
    // Mock data - replace with actual API call
    const mockWinding: WindingData = {
      id: windingId,
      masothe_bd_cao: 'BD001',
      masothe_bd_ha: 'BD001',
      masothe_ep_bd: 'EP001',
      kyhieubangve: 'WINDING001',
      ngaygiacong: new Date('2025-08-12'),
      nguoigiacong: 'Nguyễn Văn A',
      quycachday: '2.5mm²',
      sosoiday: 10,
      ngaysanxuat: new Date('2025-08-10'),
      nhasanxuat: 'Công ty ABC',
      chieuquanday: 'Thuận chiều',
      mayquanday: 'Máy 001',
      trang_thai: 0,
      user_update: 'current_user',
      created_at: new Date(),
      congsuat: '500',
      tbkt: 'TBKT001',
      dienap: '22kV'
    };

    return of(mockWinding);
  }
}
