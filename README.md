# Football Booking System - Mobile App

> Ứng dụng di động **Đặt Sân Bóng Đá** xây dựng trên **React Native** + **Expo**.
> Tích hợp đầy đủ: Đặt sân, Thanh toán ví điện tử, Ghép kèo tìm đối thủ, QR Check-in, và Admin Dashboard.

---

## Mục lục

- [Tổng quan hệ thống](#tổng-quan-hệ-thống)
- [Tech Stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt & Chạy](#cài-đặt--chạy)
- [Kiến trúc ứng dụng](#kiến-trúc-ứng-dụng)
  - [Navigation Structure](#navigation-structure)
  - [State Management](#state-management)
  - [API Service Layer](#api-service-layer)
- [Tính năng & Màn hình](#tính-năng--màn-hình)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Luồng nghiệp vụ chính](#luồng-nghiệp-vụ-chính)
  - [Luồng xác thực](#1-luồng-xác-thực)
  - [Luồng đặt sân](#2-luồng-đặt-sân)
  - [Luồng thanh toán & ví](#3-luồng-thanh-toán--ví)
  - [Luồng ghép kèo](#4-luồng-ghép-kèo)
- [Design System](#design-system)

---

## Tổng quan hệ thống

**Football Booking Mobile** là ứng dụng React Native cho hệ thống đặt sân bóng đá, kết nối với [Backend API](../football-booking-backend/) để cung cấp trải nghiệm đầy đủ cho người dùng và quản trị viên.

### Tổng quan chức năng

| Nhóm | Chức năng |
|------|-----------|
| **Xác thực** | Đăng ký, xác thực email OTP, đăng nhập email/SĐT, phân quyền role |
| **Tìm sân** | Tìm kiếm, lọc theo loại/giá/rating/vị trí, xem chi tiết, yêu thích |
| **Đặt sân** | Chọn ngày/giờ/thời lượng, thêm dịch vụ, thanh toán, xem lịch sử |
| **Check-in** | Hiển thị QR Code để check-in tại sân |
| **Ví điện tử** | Nạp tiền VNPAY/MoMo, xem số dư, lịch sử giao dịch |
| **Ghép kèo** | Tạo/tìm/tham gia trận, xác nhận, lọc theo ngày/cấp độ |
| **Admin** | Dashboard thống kê, quản lý sân/booking/dịch vụ/user/ghép kèo |

### Vai trò người dùng

| Role | Màn hình | Quyền hạn |
|------|----------|-----------|
| `USER` | Tab: Trang chủ, Tìm Kèo, Lịch Đặt, Tài khoản | Đặt sân, thanh toán, ghép kèo, đánh giá |
| `ADMIN` | Tab: Dashboard, Quản lý sân, Quản lý chung, Profile | Quản trị toàn bộ hệ thống |

---

## Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|-----------|-----------|-----------|
| Framework | React Native + Expo | RN 0.81.5, Expo ~54.0 |
| Language | TypeScript | ES2020 |
| Navigation | Expo Router (file-based) | 6.0.21 |
| Styling | NativeWind (Tailwind CSS) | 4.2.1 |
| State Management | React Context API | - |
| Local Storage | AsyncStorage | 2.2.0 |
| HTTP Client | Fetch API (native) | - |
| QR Code | react-native-qrcode-svg | - |
| Location | expo-location | 19.0.8 |
| Browser | expo-web-browser | - |
| Image | expo-image | - |
| Icons | @expo/vector-icons (MaterialIcons) | - |

---

## Cấu trúc dự án

```
football-booking-mobile/
├── src/
│   ├── api/                          # API Service Layer
│   │   ├── auth.ts                   # Xác thực (register, login, verify, profile)
│   │   ├── field.ts                  # Sân bóng (search, detail, availability, favorite)
│   │   ├── booking.ts                # Đặt sân (create, pay, cancel, QR, history)
│   │   ├── matching.ts               # Ghép kèo (CRUD, join, accept, confirm, cancel)
│   │   ├── wallet.ts                 # Ví (topup, history)
│   │   └── admin.ts                  # Admin (revenue stats)
│   │
│   ├── app/                          # Screens (Expo Router - file-based routing)
│   │   ├── index.tsx                 # Root redirect (→ auth hoặc user/admin)
│   │   ├── _layout.tsx               # Root layout
│   │   │
│   │   ├── (auth)/                   # ━━ Authentication Screens ━━
│   │   │   ├── _layout.tsx           # Auth stack layout + role redirect
│   │   │   ├── login.tsx             # Đăng nhập (email/SĐT + mật khẩu)
│   │   │   ├── register.tsx          # Đăng ký tài khoản
│   │   │   └── verify-email.tsx      # Xác thực OTP 6 số
│   │   │
│   │   ├── (user)/                   # ━━ User Screens ━━
│   │   │   ├── _layout.tsx           # Bottom tab navigation
│   │   │   │
│   │   │   ├── home/                 # Tab: Trang chủ
│   │   │   │   ├── _layout.tsx       # Home stack
│   │   │   │   ├── index.tsx         # Danh sách sân + tìm kiếm/lọc
│   │   │   │   ├── [id].tsx          # Chi tiết sân (ảnh, giá, đánh giá)
│   │   │   │   ├── availability.tsx  # Chọn ngày/giờ/thời lượng
│   │   │   │   ├── checkout.tsx      # Thêm dịch vụ + bảng giá
│   │   │   │   └── payment.tsx       # Xác nhận & thanh toán ví
│   │   │   │
│   │   │   ├── match/                # Tab: Tìm Kèo
│   │   │   │   ├── _layout.tsx       # Match stack
│   │   │   │   ├── index.tsx         # Danh sách trận (lọc ngày/cấp độ)
│   │   │   │   ├── create.tsx        # Tạo trận mới
│   │   │   │   ├── [id].tsx          # Chi tiết trận + hành động
│   │   │   │   └── _components/      # Components: MatchingCard, FilterBar,
│   │   │   │                         #   LevelBadge, StatusBadge
│   │   │   │
│   │   │   ├── bookings/             # Tab: Lịch Đặt
│   │   │   │   ├── _layout.tsx       # Bookings stack
│   │   │   │   ├── index.tsx         # Danh sách booking + lọc trạng thái
│   │   │   │   └── _components/      # Components: BookingCard, QRCodeModal,
│   │   │   │                         #   CancelModal
│   │   │   │
│   │   │   └── profile/              # Tab: Tài khoản
│   │   │       ├── _layout.tsx       # Profile stack
│   │   │       ├── index.tsx         # Tổng quan profile + menu
│   │   │       ├── edit-profile.tsx  # Chỉnh sửa thông tin cá nhân
│   │   │       ├── wallet.tsx        # Quản lý ví (nạp tiền, lịch sử)
│   │   │       └── _components/      # Components: ProfileHeader, WalletCard,
│   │   │                             #   MenuList, LogoutButton
│   │   │
│   │   └── (admin)/                  # ━━ Admin Screens ━━
│   │       ├── _layout.tsx           # Admin tab navigation
│   │       ├── dashboard/
│   │       │   └── index.tsx         # Dashboard (doanh thu, biểu đồ)
│   │       ├── fields/
│   │       │   ├── index.tsx         # Danh sách sân
│   │       │   ├── create.tsx        # Tạo sân mới
│   │       │   └── [id]/
│   │       │       ├── edit.tsx      # Chỉnh sửa sân
│   │       │       └── pricing.tsx   # Quản lý pricing rules
│   │       ├── manage/
│   │       │   ├── index.tsx         # Hub quản lý
│   │       │   ├── bookings.tsx      # Quản lý booking
│   │       │   ├── matchings.tsx     # Quản lý ghép kèo
│   │       │   ├── services.tsx      # Quản lý dịch vụ
│   │       │   └── users.tsx         # Quản lý user
│   │       └── profile/
│   │           └── index.tsx         # Admin profile
│   │
│   ├── context/                      # State Management
│   │   └── AuthContext.tsx           # Auth state (token, user, actions)
│   │
│   ├── hooks/                        # Custom Hooks
│   │   ├── useAuth.ts               # Access auth context
│   │   ├── use-color-scheme.ts       # Light/dark mode detection
│   │   └── use-theme-color.ts        # Theme color utilities
│   │
│   ├── types/                        # TypeScript Interfaces
│   │   └── index.ts                  # User, Field, Booking, Matching, etc.
│   │
│   ├── constants/                    # App Constants
│   │   └── theme.ts                  # Color palette, theme config
│   │
│   └── styles/                       # Global Styles
│       └── global.css                # Tailwind base styles
│
├── assets/                           # Images, Icons, Fonts
├── app.json                          # Expo configuration
├── tailwind.config.js                # NativeWind/Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
└── README.md
```

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) hoặc Android Emulator
- [Expo Go](https://expo.dev/go) trên thiết bị thật (tùy chọn)
- Backend server đang chạy tại `http://localhost:3000`

### 1. Clone repository

```bash
git clone https://github.com/your-repo/football-booking-mobile.git
cd football-booking-mobile
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình API URL

Mặc định app kết nối đến `http://localhost:3000/api/v1`. Để thay đổi, set biến môi trường:

```bash
EXPO_PUBLIC_API_BASE_URL=http://your-server-ip:3000/api/v1
```

> **Lưu ý:** Khi chạy trên thiết bị thật hoặc emulator, sử dụng IP máy tính thay vì `localhost`.

### 4. Chạy ứng dụng

```bash
# Khởi động Expo dev server
npx expo start

# Chạy trên iOS Simulator
npx expo run:ios

# Chạy trên Android Emulator
npx expo run:android
```

---

## Kiến trúc ứng dụng

### Navigation Structure

```
Root Layout (_layout.tsx)
│
├── (auth) ─── Stack Navigation ──────────────────────────
│   ├── login              Đăng nhập
│   ├── register           Đăng ký
│   └── verify-email       Xác thực OTP
│
├── (user) ─── Bottom Tab Navigation ─────────────────────
│   │
│   ├── 🏠 Trang chủ (home/) ─── Stack
│   │   ├── index           Danh sách sân
│   │   ├── [id]            Chi tiết sân
│   │   ├── availability    Chọn slot
│   │   ├── checkout        Thêm dịch vụ
│   │   └── payment         Thanh toán
│   │
│   ├── ⚽ Tìm Kèo (match/) ─── Stack
│   │   ├── index           Danh sách trận
│   │   ├── create          Tạo trận mới
│   │   └── [id]            Chi tiết trận
│   │
│   ├── 📅 Lịch Đặt (bookings/) ─── Stack
│   │   └── index           Danh sách booking
│   │
│   └── 👤 Tài khoản (profile/) ─── Stack
│       ├── index           Profile + menu
│       ├── edit-profile    Chỉnh sửa thông tin
│       └── wallet          Ví điện tử
│
└── (admin) ─── Bottom Tab Navigation ────────────────────
    ├── 📊 Dashboard        Thống kê doanh thu
    ├── 🏟️ Sân bóng (fields/) ─── Stack
    │   ├── index           Danh sách sân
    │   ├── create          Tạo sân
    │   └── [id]/edit       Chỉnh sửa sân
    │         /pricing      Pricing rules
    ├── ⚙️ Quản lý (manage/) ─── Stack
    │   ├── index           Hub quản lý
    │   ├── bookings        Quản lý booking
    │   ├── matchings       Quản lý ghép kèo
    │   ├── services        Quản lý dịch vụ
    │   └── users           Quản lý user
    └── 👤 Profile          Admin profile
```

**Điều hướng tự động:** Khi user đăng nhập, app tự redirect dựa trên `user.role`:
- `USER` → `/(user)/home`
- `ADMIN` → `/(admin)/dashboard`

---

### State Management

App sử dụng **React Context API** qua `AuthContext`:

```
┌──────────────────────────────────────────────────┐
│                 AuthContext                        │
│                                                    │
│  State:                                            │
│  ├── token: string | null     JWT token            │
│  ├── user: User | null        Thông tin user       │
│  └── loading: boolean         Đang kiểm tra auth   │
│                                                    │
│  Actions:                                          │
│  ├── login(body)              Đăng nhập            │
│  ├── logout()                 Đăng xuất            │
│  ├── register(body)           Đăng ký              │
│  ├── verifyEmail(email, code) Xác thực OTP         │
│  ├── resendVerification(email)Gửi lại OTP          │
│  ├── updateProfile(body)      Cập nhật profile     │
│  └── refreshUser()            Sync data từ server  │
│                                                    │
│  Persistence: AsyncStorage                         │
│  ├── @auth_token              Lưu JWT              │
│  └── @auth_user               Lưu user data        │
└──────────────────────────────────────────────────┘
```

**Sử dụng:**
```typescript
const { token, user, login, logout, refreshUser } = useAuth();
```

---

### API Service Layer

Tất cả API calls đi qua hàm `request<T>()` chuẩn hóa:

```
┌──────────┐    fetch()     ┌──────────────────┐    HTTP    ┌──────────┐
│  Screen  │ ─────────────▶ │  API Module      │ ─────────▶│ Backend  │
│          │                │  (src/api/*.ts)   │           │  Server  │
│          │ ◀───── T ───── │                   │ ◀─ JSON ─ │          │
└──────────┘                └──────────────────┘           └──────────┘
```

| Module | File | Chức năng chính |
|--------|------|-----------------|
| Auth | `auth.ts` | register, login, verifyEmail, getMe, updateProfile |
| Field | `field.ts` | getFields, getFieldById, getAvailability, favorite |
| Booking | `booking.ts` | createBooking, initiatePayment, getMyBookings, cancelBooking, getBookingQr |
| Matching | `matching.ts` | getMatchings, createMatching, joinMatching, acceptChallenger, confirmMatching |
| Wallet | `wallet.ts` | topupWallet, getWalletHistory |
| Admin | `admin.ts` | getRevenueStats |

**Cấu trúc response chuẩn:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

---

## Tính năng & Màn hình

### User Features

#### 1. Xác thực (Authentication)

| Màn hình | Mô tả |
|----------|--------|
| **Đăng nhập** | Nhập email/SĐT + mật khẩu, toggle hiện/ẩn mật khẩu |
| **Đăng ký** | Nhập họ tên, email, SĐT, mật khẩu |
| **Xác thực OTP** | Nhập 6 chữ số, tự động focus ô tiếp theo, gửi lại mã |

---

#### 2. Trang chủ - Tìm sân (Home)

| Tính năng | Mô tả |
|-----------|--------|
| **Tìm kiếm** | Search bar tìm theo tên/địa chỉ (debounce 300ms) |
| **Lọc loại sân** | Chip filter: Sân 5, Sân 7, Sân 11 |
| **Lọc nâng cao** | Panel mở rộng: giá min/max, đánh giá tối thiểu |
| **Sân nổi bật** | Carousel ngang hiển thị sân featured |
| **Danh sách sân** | Vertical list: ảnh, tên, rating, địa chỉ, giá, nút "Đặt ngay" |
| **Khoảng cách** | Hiển thị km nếu có quyền location |
| **Empty state** | Icon + thông báo khi không có kết quả |

---

#### 3. Chi tiết sân (Field Detail)

| Tính năng | Mô tả |
|-----------|--------|
| **Gallery ảnh** | Carousel ảnh vuốt ngang |
| **Thông tin sân** | Tên, rating, địa chỉ, giá/giờ, mô tả |
| **Pricing rules** | Hiển thị quy tắc giá giờ cao điểm/thấp điểm |
| **Yêu thích** | Nút toggle thêm/bỏ yêu thích |
| **Đặt sân** | Nút CTA "Đặt sân ngay" → chuyển sang chọn slot |

---

#### 4. Đặt sân (Booking Flow)

| Bước | Màn hình | Mô tả |
|------|----------|--------|
| **1** | **Chọn slot** (`availability`) | Lịch 14 ngày, chọn thời lượng (60/90/120 phút), lưới giờ 05:00-23:00 với trạng thái AVAILABLE/BOOKED/PEAK |
| **2** | **Thêm dịch vụ** (`checkout`) | Danh sách dịch vụ kèm (nước, áo), chọn số lượng (+/-), bảng tổng giá: sân + dịch vụ + cọc 30% |
| **3** | **Thanh toán** (`payment`) | Tóm tắt booking, kiểm tra số dư ví, nếu đủ → thanh toán, nếu thiếu → nhắc nạp tiền |

---

#### 5. Lịch sử đặt sân (My Bookings)

| Tính năng | Mô tả |
|-----------|--------|
| **Danh sách** | Tất cả booking với thông tin sân, ngày, giờ, trạng thái |
| **Lọc trạng thái** | PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED |
| **PENDING_PAYMENT** | Cảnh báo deadline, nút thanh toán, nút hủy |
| **CONFIRMED** | Nút xem QR Code check-in |
| **COMPLETED** | Badge "Đã qua giờ đá" |
| **QR Code Modal** | Hiển thị QR code dạng full-screen |
| **Hủy booking** | Modal nhập lý do + xác nhận hủy |
| **Pull-to-refresh** | Kéo xuống để cập nhật danh sách |

---

#### 6. Ghép kèo (Team Matching)

| Tính năng | Mô tả |
|-----------|--------|
| **Danh sách trận** | Infinite scroll, 15 trận/trang |
| **Lọc** | Theo ngày (dropdown), theo cấp độ (VUI_VE, BAN_CHUYEN, CHUYEN_NGHIEP) |
| **Card trận** | Avatar host, level badge, ngày (Hôm nay/Ngày mai/DD-MM), giờ + thời lượng, sân (nếu có), mô tả, nút "Tham gia ngay" |
| **Tạo trận** | Form: ngày, giờ, thời lượng, cấp độ, sân (dropdown), mô tả |
| **Chi tiết trận** | Thông tin host, chi tiết trận, danh sách người chơi, nút hành động |
| **Hành động** | Tham gia, chấp nhận/từ chối đối thủ, xác nhận, rời trận, hủy |

**Cấp độ:**

| Level | Tên hiển thị | Màu badge |
|-------|-------------|-----------|
| `VUI_VE` | Vui vẻ | Xanh lá |
| `BAN_CHUYEN` | Bán chuyên | Xanh dương |
| `CHUYEN_NGHIEP` | Chuyên nghiệp | Đỏ |

---

#### 7. Ví điện tử (Wallet)

| Tính năng | Mô tả |
|-----------|--------|
| **Số dư** | Hiển thị số dư ví + điểm tích lũy |
| **Nạp tiền** | Chọn mệnh giá (50K, 100K, 200K, 500K) hoặc nhập tùy chỉnh |
| **Phương thức** | VNPAY hoặc MoMo → mở link thanh toán trong trình duyệt |
| **Lịch sử** | Danh sách giao dịch: DEPOSIT (+), PAYMENT (-), REFUND (+) |
| **Chi tiết** | Mỗi giao dịch hiển thị: ngày, loại, mô tả, số tiền |

---

#### 8. Hồ sơ cá nhân (Profile)

| Tính năng | Mô tả |
|-----------|--------|
| **Tổng quan** | Avatar, tên, email, SĐT, số dư ví nhanh |
| **Chỉnh sửa** | Thay đổi họ tên, SĐT (email chỉ đọc) |
| **Menu** | Thông tin cá nhân, Lịch sử giao dịch, Cài đặt |
| **Đăng xuất** | Nút đăng xuất với dialog xác nhận |

---

### Admin Features

#### 1. Dashboard

| Tính năng | Mô tả |
|-----------|--------|
| **Chọn khoảng thời gian** | Date range selector |
| **Tổng doanh thu** | Hiển thị tổng tiền trong khoảng thời gian |
| **Tổng booking** | Số lượng booking |
| **Tỷ lệ hoàn thành** | % booking COMPLETED |
| **Tỷ lệ hủy** | % booking CANCELLED |
| **Biểu đồ** | Phân bố booking theo trạng thái |

---

#### 2. Quản lý sân (Field Management)

| Tính năng | Mô tả |
|-----------|--------|
| **Danh sách sân** | Tất cả sân với trạng thái |
| **Tạo sân** | Form: tên, loại (5/7/11), giá, địa chỉ, mô tả, ảnh |
| **Chỉnh sửa** | Cập nhật thông tin sân |
| **Pricing rules** | Thêm/sửa quy tắc giá theo khung giờ + ngày |

---

#### 3. Quản lý chung (Management Hub)

| Module | Mô tả |
|--------|--------|
| **Booking** | Xem tất cả, lọc theo trạng thái, cập nhật status, hoàn tiền |
| **Ghép kèo** | Xem tất cả, cập nhật trạng thái, xóa |
| **Dịch vụ** | CRUD dịch vụ kèm theo (nước, áo, ...) |
| **User** | Xem danh sách, quản lý role |

---

## Luồng nghiệp vụ chính

### 1. Luồng xác thực

```
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│    Login      │          │   Register    │          │  Verify Email │
│───────────────│          │───────────────│          │───────────────│
│ Email/SĐT    │          │ Họ tên        │          │ ┌─┐┌─┐┌─┐    │
│ Mật khẩu     │          │ Email         │          │ │ ││ ││ │    │
│ [👁 Hiện/Ẩn] │          │ SĐT          │          │ └─┘└─┘└─┘    │
│               │          │ Mật khẩu      │          │ ┌─┐┌─┐┌─┐    │
│ [Đăng nhập]  │          │               │          │ │ ││ ││ │    │
│               │          │ [Đăng ký]    │          │ └─┘└─┘└─┘    │
│ Chưa có TK?  │──────▶   │               │──────▶   │               │
│ Đăng ký ngay │          │ Đã có TK?    │          │ [Gửi lại mã] │
└───────────────┘          │ Đăng nhập    │          │               │
       │                   └───────────────┘          └───────┬───────┘
       │                                                      │
       │ ◀──────────── Xác thực thành công ◀──────────────────┘
       │
       ▼
┌─────────────────────┐
│ Role check:         │
│ USER  → /(user)/    │
│ ADMIN → /(admin)/   │
└─────────────────────┘
```

---

### 2. Luồng đặt sân

```
┌────────────┐    ┌─────────────┐    ┌─────────────┐    ┌────────────┐    ┌───────────┐
│  Trang chủ │    │  Chi tiết   │    │  Chọn slot  │    │  Checkout  │    │ Thanh toán│
│            │    │    sân      │    │             │    │            │    │           │
│ Tìm kiếm  │    │ Gallery ảnh │    │ Lịch 14 ngày│    │ Dịch vụ   │    │ Tóm tắt  │
│ Lọc sân   │──▶ │ Thông tin   │──▶ │ Thời lượng  │──▶ │ Số lượng  │──▶ │ Số dư ví │
│ Xem danh  │    │ Giá/rules   │    │ Grid giờ    │    │ Chi tiết  │    │           │
│ sách       │    │ Yêu thích  │    │ Giá realtime│    │ giá       │    │ [Thanh   │
│            │    │             │    │             │    │           │    │  toán]   │
│ [Đặt ngay]│    │ [Đặt sân]  │    │ [Tiếp tục] │    │ [Đặt sân]│    │           │
└────────────┘    └─────────────┘    └─────────────┘    └────────────┘    └─────┬─────┘
                                                                               │
                              ┌────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │   Lịch Đặt       │
                   │                  │
                   │ Booking mới ở    │
                   │ trạng thái       │
                   │ CONFIRMED ✅     │
                   │                  │
                   │ [Xem QR Code]   │
                   └──────────────────┘
```

**Logic tính giá trên app:**
```
Tiền sân    = (giá/giờ ÷ 60) × thời lượng (phút)
Tiền dịch vụ = Σ (giá dịch vụ × số lượng)
Tổng cộng   = Tiền sân + Tiền dịch vụ
Tiền cọc    = Tổng cộng × 30%
```

---

### 3. Luồng thanh toán & ví

```
                    Thanh toán Booking                        Nạp tiền ví
                    ──────────────────                        ────────────

┌──────────────┐                               ┌──────────────┐
│ payment.tsx  │                               │ wallet.tsx   │
│              │                               │              │
│ Kiểm tra     │                               │ Chọn mệnh giá│
│ số dư ≥ cọc  │                               │ 50K/100K/    │
│              │                               │ 200K/500K    │
│      ┌───────┴───────┐                       │              │
│   ✅ Đủ          ❌ Thiếu                    │ Chọn phương  │
│      │               │                       │ thức: VNPAY/ │
│      ▼               ▼                       │ MOMO         │
│ [Thanh toán]   "Nạp thêm                    │              │
│      │          tiền vào                     │ [Nạp tiền]  │
│      │          ví" ──────────────────────▶  │      │       │
│      │                                       │      │       │
│      ▼                                       │      ▼       │
│ POST /payments/                              │ POST /wallet/│
│   initiate                                   │   topup      │
│      │                                       │      │       │
│      ▼                                       │      ▼       │
│ Trừ ví → ✅                                 │ Mở link      │
│ Booking                                      │ thanh toán   │
│ CONFIRMED                                    │ trong browser│
│                                              │      │       │
│ → Navigate to                                │      ▼       │
│   Lịch Đặt                                  │ Callback →   │
│                                              │ Cộng ví ✅   │
└──────────────┘                               └──────────────┘
```

---

### 4. Luồng ghép kèo

```
┌──────────────────────────────────────────────────────────────┐
│                      Tìm Kèo (Tab)                           │
│                                                              │
│  ┌─────────────┐     ┌────────────────┐                     │
│  │ Tạo trận    │     │ Danh sách trận │                     │
│  │             │     │                │                     │
│  │ Ngày/Giờ   │     │ Lọc: ngày,     │                     │
│  │ Thời lượng │     │ cấp độ         │                     │
│  │ Cấp độ     │     │                │                     │
│  │ Sân (opt)  │     │ ┌────────────┐ │                     │
│  │ Mô tả     │     │ │MatchingCard│ │                     │
│  │             │     │ │ Host info  │ │                     │
│  │ [Tạo trận]│     │ │ Ngày/Giờ   │ │                     │
│  └──────┬──────┘     │ │ Level      │ │                     │
│         │            │ │ [Tham gia] │ │                     │
│         │            │ └──────┬─────┘ │                     │
│         │            └────────┼───────┘                     │
│         │                     │                             │
│         ▼                     ▼                             │
│  ┌──────────────────────────────────────────┐               │
│  │           Chi tiết trận [id].tsx          │               │
│  │                                          │               │
│  │  Host info │ Ngày/Giờ │ Cấp độ │ Sân    │               │
│  │  Danh sách người chơi                    │               │
│  │                                          │               │
│  │  ┌────────────────────────────────────┐  │               │
│  │  │ Hành động (tùy role & status):     │  │               │
│  │  │                                    │  │               │
│  │  │ OPEN (không đối thủ):              │  │               │
│  │  │   → [Tham gia] (user khác)        │  │               │
│  │  │                                    │  │               │
│  │  │ OPEN (có đối thủ, Host):           │  │               │
│  │  │   → [Chấp nhận] [Từ chối]        │  │               │
│  │  │                                    │  │               │
│  │  │ MATCHED:                           │  │               │
│  │  │   → [Xác nhận] [Hủy]             │  │               │
│  │  │                                    │  │               │
│  │  │ CONFIRMED:                         │  │               │
│  │  │   → [Hủy trận]                   │  │               │
│  │  └────────────────────────────────────┘  │               │
│  └──────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

---

## Design System

### Color Palette

| Tên | Hex | Sử dụng |
|-----|-----|---------|
| Primary | `#089166` | Nút CTA, tab active, accent chính |
| Primary Light | `#0df2aa` | Gradient, highlight |
| Background | `#f5f8f7` | Nền chính (light mode) |
| Background Dark | `#10221c` | Nền (dark mode) |
| Success | `#10b981` | Trạng thái thành công |
| Error | `#ef4444` | Lỗi, nút hủy, danger |
| Warning | `#d97706` | Cảnh báo |
| Info | `#3b82f6` | Thông tin |
| Text | `#1e293b` | Text chính |
| Muted | `#94a3b8` | Text phụ, icon inactive |

### Status Badge Colors

| Trạng thái | Màu | Ý nghĩa |
|-----------|------|---------|
| PENDING_PAYMENT | Vàng `#d97706` | Chờ thanh toán |
| CONFIRMED | Xanh lá `#10b981` | Đã xác nhận |
| COMPLETED | Xanh dương `#3b82f6` | Hoàn thành |
| CANCELLED | Đỏ `#ef4444` | Đã hủy |
| OPEN | Xanh lá `#10b981` | Đang mở (ghép kèo) |
| MATCHED | Xanh dương `#3b82f6` | Đã ghép đội |
| EXPIRED | Xám `#94a3b8` | Hết hạn |

### UI Components Pattern

| Component | Mô tả |
|-----------|--------|
| **Cards** | Rounded corners (xl/2xl), border + shadow, padding chuẩn |
| **Buttons** | Primary (solid green), Secondary (outline), Danger (red), Disabled (opacity) |
| **Inputs** | Rounded border, icon trái/phải, placeholder, focus highlight |
| **Tab Bar** | Bottom tabs với icon + label, active: primary, inactive: muted |
| **Modals** | Alert dialog xác nhận, full-screen modal cho forms |
| **Loading** | ActivityIndicator spinner, skeleton loader |
| **Empty State** | Icon lớn + thông báo "Không có dữ liệu" |
| **Pull-to-refresh** | Kéo xuống để reload danh sách |
| **Infinite Scroll** | Load thêm khi cuộn đến cuối |

### Typography

| Loại | Style | Sử dụng |
|------|-------|---------|
| Heading | `font-bold text-xl` | Tiêu đề trang |
| Subheading | `font-semibold text-lg` | Tiêu đề section |
| Body | `text-base` | Nội dung chính |
| Caption | `text-sm text-gray-500` | Mô tả phụ |
| Small | `text-xs font-medium` | Badge, label |

---

*Created by Nguyen Vu Dang Khanh*
