# KCS Check Component

## Mô tả
KCS Check là một component Angular được thiết kế để kiểm tra và duyệt chất lượng các bối dây hạ, bối dây cao và ép bối dây. Component này chỉ dành cho những user có quyền `epboiday`.

## Tính năng chính

### 1. Kiểm tra quyền truy cập
- Chỉ user có quyền `epboiday` mới có thể truy cập
- Kiểm tra authentication và authorization
- Hiển thị thông báo phù hợp cho từng trường hợp

### 2. Ba tab chính
- **Bối dây hạ**: Hiển thị thông tin bối dây hạ đã lưu trước đó
- **Bối dây cao**: Hiển thị thông tin bối dây cao đã lưu trước đó  
- **Ép bối dây**: Hiển thị thông tin ép bối dây đã lưu trước đó

### 3. Chức năng cho mỗi tab
- Tìm kiếm theo ký hiệu quấn dây hoặc TBKT
- Xem chi tiết thông tin
- Duyệt (Approve) - có thể thực hiện bất kỳ lúc nào
- Từ chối (Reject) - có thể thực hiện bất kỳ lúc nào
- Phân trang và sắp xếp dữ liệu

## Cấu trúc file

```
kcs-check/
├── kcs-check.component.ts          # Component chính
├── kcs-check.component.html        # Template HTML
├── kcs-check.component.scss        # Styles CSS
├── kcs-check.component.spec.ts     # Unit tests
├── kcs-check.module.ts             # Module configuration
├── kcs-check.service.ts            # Service xử lý business logic
└── README.md                       # Hướng dẫn sử dụng
```

## Cách sử dụng

### 1. Routing
Component được cấu hình với route `/kcs-check` và được bảo vệ bởi `AuthGuard`.

### 2. Import vào module khác
```typescript
import { KcsCheckModule } from './kcs-check/kcs-check.module';

@NgModule({
  imports: [
    KcsCheckModule,
    // ... other modules
  ]
})
export class YourModule { }
```

### 3. Sử dụng trong template
```html
<app-kcs-check></app-kcs-check>
```

## Dependencies

### Angular Material
- `MatTabsModule` - Quản lý tabs
- `MatTableModule` - Hiển thị bảng dữ liệu
- `MatPaginatorModule` - Phân trang
- `MatSortModule` - Sắp xếp dữ liệu
- `MatFormFieldModule` - Form fields
- `MatInputModule` - Input controls
- `MatButtonModule` - Buttons
- `MatIconModule` - Icons
- `MatMenuModule` - Dropdown menus
- `MatChipsModule` - Status chips
- `MatDialogModule` - Dialogs
- `MatDatepickerModule` - Date picker

### Services
- `AuthServices` - Xác thực và phân quyền
- `KcsCheckService` - Xử lý business logic và API calls

## API Integration

### Endpoints cần thiết
```typescript
// Lấy danh sách bối dây hạ
GET /api/kcs-check/boi-day-ha

// Lấy danh sách bối dây cao  
GET /api/kcs-check/boi-day-cao

// Lấy danh sách ép bối dây
GET /api/kcs-check/ep-boi-day

// Duyệt item
POST /api/kcs-check/{type}/approve

// Từ chối item
POST /api/kcs-check/{type}/reject

// Lấy chi tiết item
GET /api/kcs-check/{type}/{id}
```

### Data Models
```typescript
interface BoiDayHaData {
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

interface BoiDayCaoData {
  // Tương tự BoiDayHaData
}

interface EpBoiDayData {
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
```

## Customization

### 1. Thay đổi giao diện
- Chỉnh sửa `kcs-check.component.scss` để thay đổi styles
- Cập nhật `kcs-check.component.html` để thay đổi layout

### 2. Thêm tính năng mới
- Mở rộng `KcsCheckService` để thêm API calls mới
- Cập nhật component để xử lý tính năng mới

### 3. Thay đổi logic phân quyền
- Cập nhật method `checkEpBoiDayPermission()` trong component
- Thay đổi logic kiểm tra quyền theo yêu cầu

## Troubleshooting

### 1. Lỗi không hiển thị dữ liệu
- Kiểm tra console để xem lỗi API
- Đảm bảo user có quyền truy cập
- Kiểm tra network requests

### 2. Lỗi authentication
- Kiểm tra token trong localStorage/sessionStorage
- Đảm bảo AuthGuard hoạt động đúng
- Kiểm tra AuthService configuration

### 3. Lỗi Material Design
- Đảm bảo đã import đầy đủ Material modules
- Kiểm tra Angular Material version compatibility

## Future Enhancements

### 1. Tính năng có thể thêm
- Export dữ liệu ra Excel/PDF
- Filter nâng cao theo nhiều tiêu chí
- Bulk approve/reject
- Lịch sử thay đổi trạng thái
- Notifications real-time

### 2. Performance improvements
- Lazy loading cho từng tab
- Virtual scrolling cho bảng dữ liệu lớn
- Caching dữ liệu
- Optimize API calls

## Support

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team development hoặc tạo issue trong repository.
