# Hệ thống Chuyển hướng dựa trên Quyền (Role-Based Navigation)

## Tổng quan

Hệ thống này tự động chuyển hướng user sau khi đăng nhập dựa trên quyền của họ:

- **Admin/Manager**: Chuyển về trang `ds-bang-ve` (Danh sách bảng vẽ)
- **User thường**: Chuyển về trang `ds-quan-day` (Danh sách quấn dây)
- **KCS**: Chuyển về trang `kcs-check` (Kiểm tra chất lượng)

## Cách hoạt động

### 1. NavigationService

Service chính xử lý logic chuyển hướng:

```typescript
// Kiểm tra quyền và chuyển hướng
navigateBasedOnUserRole(): void {
  // Kiểm tra user đã đăng nhập chưa
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem(StorageKey.TOKEN_KEY);
  if (!token) {
    this.router.navigate(['/landing']);
    return;
  }

  // Xác định quyền dựa trên role, khau_sx, email
  const role = localStorage.getItem('role')?.toLowerCase() || '';
  const khauSx = localStorage.getItem('khau_sx')?.toLowerCase() || '';
  const email = localStorage.getItem('email')?.toLowerCase() || '';

  // Chuyển hướng theo quyền
  if (this.isAdminOrManager(role, khauSx, email)) {
    this.router.navigate(['/ds-bang-ve']);
  } else if (this.isKCS(role, khauSx, email)) {
    this.router.navigate(['/kcs-check']);
  } else {
    this.router.navigate(['/ds-quan-day']);
  }
}
```

### 2. Logic xác định quyền

#### Admin/Manager
- `role` chứa "admin" hoặc "manager"
- `khau_sx` chứa "admin" hoặc "manager"  
- `email` chứa "admin" hoặc "manager"

#### KCS
- `role` chứa "kcs"
- `khau_sx` chứa "kcs"
- `email` chứa "kcs"

#### User thường
- Tất cả các trường hợp khác

### 3. Luồng hoạt động

1. User đăng nhập thành công
2. `AuthService.handleLoginSuccess()` lưu thông tin user vào localStorage
3. `AppComponent.handleLogin()` gọi `NavigationService.navigateBasedOnUserRole()`
4. Service xác định quyền và chuyển hướng đến trang tương ứng
5. Nếu user truy cập trực tiếp vào route được bảo vệ, `AuthGuard` sẽ redirect về `/landing`

### 4. Bảo mật

- Tất cả các route được bảo vệ bởi `AuthGuard`
- Route `landing` không có guard để user chưa đăng nhập có thể truy cập
- Chuyển hướng được xử lý trực tiếp trong `NavigationService` sau khi đăng nhập thành công

## Cấu trúc file

```
src/
├── app/
│   ├── shared/
│   │   ├── services/
│   │   │   └── navigation.service.ts          # Service chính
│   │   └── guards/
│   │       └── auth.guard.ts                  # Guard bảo vệ route
│   └── app-routing.module.ts                  # Cấu hình routing
```

## Sử dụng

### Trong component

```typescript
import { NavigationService } from '../shared/services/navigation.service';

constructor(private navigationService: NavigationService) {}

// Chuyển hướng dựa trên quyền
this.navigationService.navigateBasedOnUserRole();

// Lấy route mặc định
const defaultRoute = this.navigationService.getDefaultRoute();
```

### Trong service

```typescript
// Tự động chuyển hướng sau khi xử lý logic
this.navigationService.navigateBasedOnUserRole();
```

## Cấu hình

### Thêm route mới

1. Thêm route vào `app-routing.module.ts`
2. Thêm `canActivate: [AuthGuard]` nếu cần bảo vệ
3. Cập nhật logic trong `NavigationService` nếu cần

### Thay đổi logic quyền

Chỉnh sửa các method trong `NavigationService`:
- `isAdminOrManager()`
- `isKCS()`
- `navigateBasedOnUserRole()`

## Lưu ý

- Đảm bảo localStorage có đầy đủ thông tin user sau khi đăng nhập
- Token phải được lưu đúng key (`accessToken` hoặc `auth-token`)
- Các route được bảo vệ sẽ redirect về `/landing` nếu user chưa đăng nhập
- Hệ thống tự động xử lý chuyển hướng sau khi đăng nhập thành công
