# Winding Operation Popup Component

## Mô tả
Component popup này được sử dụng để hiển thị giao diện quấn dây (bối dây hạ/bối dây cao) dựa trên role của user đăng nhập.

## Tính năng
- Tự động xác định loại component cần hiển thị dựa trên `userKhauSx`
- Hỗ trợ cả chế độ xem (`view`) và chỉnh sửa (`edit`)
- Responsive design cho các thiết bị khác nhau
- Tích hợp với các component `boi-day-ha` và `boi-day-cao` hiện có

## Cách sử dụng

### 1. Import vào module
```typescript
import { WindingOperationPopupModule } from './winding-operation-popup/winding-operation-popup.module';

@NgModule({
  imports: [
    // ... other imports
    WindingOperationPopupModule
  ]
})
export class YourModule { }
```

### 2. Mở popup từ component
```typescript
import { MatDialog } from '@angular/material/dialog';
import { WindingOperationPopupComponent, WindingOperationData } from './winding-operation-popup/winding-operation-popup.component';

constructor(private dialog: MatDialog) {}

openWindingPopup(winding: WindingData, bangVe: BangVeData, mode: 'view' | 'edit'): void {
  const dialogData: WindingOperationData = {
    winding: winding,
    bangVe: bangVe,
    mode: mode,
    userRole: 'user',
    userKhauSx: 'boidayha' // hoặc 'boidaycao'
  };

  const dialogRef = this.dialog.open(WindingOperationPopupComponent, {
    width: '90%',
    maxWidth: '1200px',
    height: '90%',
    data: dialogData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Xử lý kết quả
      console.log('Popup closed with result:', result);
    }
  });
}
```

## Cấu trúc dữ liệu

### WindingOperationData
```typescript
export interface WindingOperationData {
  winding: WindingData;        // Thông tin quấn dây
  bangVe: BangVeData;          // Thông tin bảng vẽ
  mode: 'view' | 'edit';       // Chế độ hiển thị
  userRole: string;            // Role của user
  userKhauSx: string;          // Khẩu sản xuất của user
}
```

## Logic xác định component
- Nếu `userKhauSx` chứa `'boidayha'` → Hiển thị `BoiDayHaComponent`
- Nếu `userKhauSx` chứa `'boidaycao'` → Hiển thị `BoiDayCaoComponent`
- Mặc định → Hiển thị `BoiDayHaComponent`

## Responsive Design
- Desktop: `min-width: 800px, max-width: 1200px`
- Tablet: `min-width: 90vw, max-width: 95vw`
- Mobile: `min-width: 90vw, max-width: 95vw` với layout dọc

## Styling
- Sử dụng SCSS với nested selectors
- Hỗ trợ Material Design
- Custom styling cho popup context
- Responsive breakpoints: 1024px, 768px

## Dependencies
- Angular Material (Dialog, Button, Icon, Card, FormField, Input, Datepicker, Select, Checkbox, Radio)
- ReactiveFormsModule
- CommonModule

## Lưu ý
- Component này yêu cầu các component `boi-day-ha` và `boi-day-cao` đã được cập nhật để hỗ trợ input properties mới
- Cần đảm bảo rằng `MatDialog` đã được import vào module chính
- Sử dụng dynamic component loading để tránh conflict module
- Components được tạo động dựa trên role của user

## Cách sửa lỗi build

### Vấn đề đã gặp
- Lỗi "Component is declared by more than one NgModule" khi khai báo components trong nhiều module

### Giải pháp đã áp dụng
1. **Loại bỏ components khỏi WindingOperationPopupModule**: Chỉ khai báo `WindingOperationPopupComponent`
2. **Sử dụng dynamic component loading**: Sử dụng `ComponentFactoryResolver` để tạo components động
3. **Import modules cần thiết**: Import `BoiDayHaModule` và `BoiDayCaoModule` vào `WindingOperationPopupModule`
4. **Cập nhật cấu trúc module**: Đảm bảo không có conflict giữa các module

### Kết quả
- Build thành công không có lỗi
- Popup hoạt động đúng với dynamic component loading
- Không có conflict module
- **Đã khôi phục lại tab thứ 2 "Quấn dây đang gia công"**

## Các tabs hiện có

1. **Quấn dây mới** - Danh sách quấn dây mới
2. **Quấn dây đang gia công** - Danh sách quấn dây đang xử lý  
3. **Quấn dây đã xử lý** - Danh sách quấn dây đã hoàn thành

## Trạng thái hiện tại

✅ **Đã khôi phục lại đầy đủ 3 tabs**
✅ **Tab 1**: "Quấn dây mới" - Hiển thị đúng
✅ **Tab 2**: "Quấn dây đang gia công" - Đã khôi phục
✅ **Tab 3**: "Quấn dây đã xử lý" - Hiển thị đúng
