export interface WindingData {
  id: number;
  masothe_bd_cao?: string;
  masothe_bd_ha?: string;
  masothe_ep_bd?: string;
  kyhieubangve: string;
  ngaygiacong?: Date;
  nguoigiacong?: string;
  quycachday?: string;
  sosoiday?: number;
  ngaysanxuat?: Date;
  nhasanxuat?: string;
  chieuquanday?: string;
  mayquanday?: string;
  xungquanh?: string;
  haidau?: string;
  bd_tt?: string;
  chuvi_bd_tt?: number;
  chuvikhuon?: number;
  kt_bung_bd?: string;
  kt_boiday_trong?: string;
  chuvi_bd_trong?: number;
  kt_bd_ngoai?: string;
  dientroRa?: number;
  dientroRb?: number;
  dientroRc?: number;
  dolechdientro?: number;
  cu_ep_beday_bd?: number;
  cu_ep_cuaso_bd?: number;
  phuong_phap_ep?: string;
  kt_ngoai_bd_sau_ep?: string;
  trang_thai: number; // STATUS.NEW (0): mới, STATUS.COMPLETED (3): hoàn thành, STATUS.PROCESSING (1): đang xử lý
  //user_update?: string;
  created_at: Date;
  // Additional fields for display
  congsuat?: string;
  tbkt?: string;
  dienap?: string;
}

export interface BangVeData {
  id: number;
  kyhieubangve: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  soboiday: number;
  bd_ha_trong?: number;
  bd_ha_ngoai?: number;
  bd_cao?: number;
  bd_ep?: number;
  bung_bd?: string;
  user_create: string;
  trang_thai: number;
  created_at: Date;
  IsActive: boolean;
}

export interface UserData {
  Id: string;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  khau_sx: string;
  roles: string[];
}
