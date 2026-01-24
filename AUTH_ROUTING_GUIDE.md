# 🔐 Authentication & Role-Based Routing

## 📋 Overview

Ứng dụng đã được cập nhật với hệ thống phân quyền và routing tự động dựa trên role của người dùng.

## 🚀 Cách Hoạt Động

### 1. App Startup (Khởi động app)
```
App khởi động → Luôn hiển thị Login Screen
```
- File: `app/index.tsx` - Redirect tự động đến `/(auth)/login`
- File: `app/_layout.tsx` - Chứa `useProtectedRoute` hook

### 2. Login Process (Quy trình đăng nhập)
```
User nhập email/password → API POST /auth/login → Response với role
```
- API Response có cấu trúc:
```json
{
  "success": true,
  "message": "Login successful", 
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 10,
      "full_name": "Nguyen Vu Dang Khanh",
      "email": "dangkhanha1@gmail.com", 
      "phone_number": "0987777777",
      "role": "USER", // hoặc "ADMIN"
      "avatar_url": null
    }
  }
}
```

### 3. Auto Routing (Điều hướng tự động)
```
Login thành công → useProtectedRoute kiểm tra role → Điều hướng
```

**Role-based Navigation:**
- `role: "USER"` → Điều hướng đến `/(user)` - Trang Home với sân bóng
- `role: "ADMIN"` → Điều hướng đến `/(admin)` - Trang quản trị

### 4. Protection Logic (Logic bảo vệ)
```
useProtectedRoute hook chạy mỗi khi:
- App khởi động
- User state thay đổi
- Route segments thay đổi
```

## 📁 File Structure

```
src/hooks/
└── useProtectedRoute.ts ............... Logic routing chính

app/
├── index.tsx ....................... App entry → redirect login
├── _layout.tsx ..................... Main layout với AuthProvider
├── (auth)/
│   └── login.tsx ................... Login screen (updated)
├── (user)/
│   ├── index.tsx ................... User home (với Header có logout)
│   └── _components/Header.tsx ...... Header với menu logout
└── (admin)/
    └── index.tsx ................... Admin dashboard
```

## 🔧 Key Components

### useProtectedRoute Hook
```typescript
// Logic chính:
- Không có user + không phải auth screen → Redirect login
- Có user + đang ở auth screen → Redirect theo role
- Admin ở user area → Redirect admin
- User ở admin area → Redirect user
```

### Updated Login Screen
```typescript
// login.tsx:
- Bỏ router.replace('/(user)') cố định
- Để useProtectedRoute tự động điều hướng dựa trên role
```

### Header Component (User)
```typescript
// Header.tsx:
- Hiển thị role của user
- Menu dropdown với logout
- Modal interface
```

### Admin Screen
```typescript
// admin/index.tsx:
- Giao diện dành cho admin
- Hiển thị badge ADMIN
- Nút logout
```

## ✅ Testing Flow

### Test USER Role:
1. Login với account có `"role": "USER"`
2. Tự động navigate đến `/(user)` 
3. Hiển thị trang home với sân bóng
4. Header hiển thị "USER" role
5. Menu có logout

### Test ADMIN Role:
1. Login với account có `"role": "ADMIN"`
2. Tự động navigate đến `/(admin)`
3. Hiển thị trang quản trị
4. Header hiển thị "ADMIN" badge màu đỏ
5. Có nút logout

### Test Protection:
1. Admin cố truy cập `/(user)` → Auto redirect `/(admin)`
2. User cố truy cập `/(admin)` → Auto redirect `/(user)`
3. Logout → Auto redirect `/(auth)/login`

## 🔄 App Flow Summary

```
📱 App Start
    ↓
🔐 Login Screen (Always)
    ↓
✅ API Login Success
    ↓
🔍 Check Role
    ├── "USER" → 🏠 User Home
    └── "ADMIN" → ⚙️ Admin Dashboard
    ↓
🛡️ Protected Routes (Auto-managed)
    ↓
🚪 Logout → Back to Login
```

## 🎯 Key Features

✅ **Auto-redirect on startup**: Luôn bắt đầu với login  
✅ **Role-based routing**: Tự động điều hướng theo role  
✅ **Route protection**: Ngăn access trái phép  
✅ **Persistent auth**: Lưu token & user data  
✅ **Clean logout**: Clear data + redirect login  

---

**Status: ✅ READY TO TEST**

Hệ thống phân quyền và routing tự động đã hoàn thành!