# Test Winding Operation Popup

## Cách test popup

### 1. Mở trang ds-quan-day
- Navigate đến `/ds-quan-day`
- Đăng nhập với user có `khau_sx` chứa `'boidayha'` hoặc `'boidaycao'`

### 2. Kiểm tra 3 tabs
- **Tab 1**: "Quấn dây mới" - Hiển thị danh sách quấn dây mới
- **Tab 2**: "Quấn dây đang gia công" - Hiển thị danh sách quấn dây đang xử lý
- **Tab 3**: "Quấn dây đã xử lý" - Hiển thị danh sách quấn dây đã hoàn thành

### 3. Test popup
- Trong bảng "Quấn dây mới", bấm vào menu "Thao tác" (3 chấm)
- Chọn "Thao tác quấn dây"
- Popup sẽ mở ra với giao diện tương ứng

### 4. Kiểm tra logic
- Nếu user có `khau_sx` chứa `'boidayha'` → Hiển thị giao diện bối dây hạ
- Nếu user có `khau_sx` chứa `'boidaycao'` → Hiển thị giao diện bối dây cao
- Nếu không có → Mặc định hiển thị bối dây hạ

### 5. Test các chế độ
- **View mode**: Các field sẽ bị disable
- **Edit mode**: Các field có thể chỉnh sửa

### 6. Test responsive
- Desktop: min-width: 800px, max-width: 1200px
- Tablet: min-width: 90vw, max-width: 95vw  
- Mobile: min-width: 90vw, max-width: 95vw với layout dọc

## Các file đã được cập nhật

1. **WindingOperationPopupComponent** - Component popup chính
2. **BoiDayHaComponent** - Hỗ trợ input properties mới
3. **BoiDayCaoComponent** - Hỗ trợ input properties mới
4. **DSQuanDayComponent** - Sử dụng popup mới
5. **WindingOperationPopupModule** - Module cho popup
6. **SharedModule** - Import popup module
7. **DSQuanDayModule** - Import popup module

## Lưu ý

- Popup sử dụng dynamic component loading để tránh conflict module
- Components được tạo động dựa trên role của user
- Responsive design cho các thiết bị khác nhau
- Hỗ trợ cả view và edit mode
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
