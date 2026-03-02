# Build & Deploy Plan - Football Booking Mobile

> Plan chi tiet de build ung dung React Native (Expo) va phat hanh len **Google Play Store** va **Apple App Store**.

---

## Muc luc

- [Tong quan](#tong-quan)
- [Phase 1: Chuan bi moi truong Development](#phase-1-chuan-bi-moi-truong-development)
- [Phase 2: Cau hinh EAS Build](#phase-2-cau-hinh-eas-build)
- [Phase 3: Chuan bi tai khoan Developer](#phase-3-chuan-bi-tai-khoan-developer)
- [Phase 4: Cau hinh App cho Production](#phase-4-cau-hinh-app-cho-production)
- [Phase 5: Build Android (Google Play)](#phase-5-build-android-google-play)
- [Phase 6: Build iOS (App Store)](#phase-6-build-ios-app-store)
- [Phase 7: Phat hanh len Store](#phase-7-phat-hanh-len-store)
- [Phase 8: CI/CD voi EAS](#phase-8-cicd-voi-eas)
- [Phase 9: OTA Update](#phase-9-ota-update)
- [Checklist tong hop](#checklist-tong-hop)

---

## Tong quan

### Hien trang du an

| Hang muc | Trang thai hien tai |
|----------|-------------------|
| Framework | Expo SDK 54 + React Native 0.81.5 |
| Router | Expo Router 6.0.21 (file-based) |
| Styling | NativeWind 4.2.1 (Tailwind CSS) |
| TypeScript | 5.9.2 (strict mode) |
| New Architecture | Enabled (bridgeless) |
| `eas.json` | **Chua co** |
| App signing (Android) | **Chua cau hinh** |
| App signing (iOS) | **Chua cau hinh** |
| `google-services.json` | **Chua co** |
| CI/CD | **Chua co** |
| API URL | `http://localhost:3000/api/v1` (hardcode dev) |

### Cac buoc tong quan

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 1    │     │   Phase 2    │     │   Phase 3    │
│  Setup Dev   │────▶│  Config EAS  │────▶│  Dev Accounts│
│  Environment │     │  Build       │     │  Apple/Google│
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
       ┌────────────────────────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 4    │     │   Phase 5    │     │   Phase 6    │
│  Production  │────▶│  Build APK/  │────▶│  Build IPA   │
│  Config      │     │  AAB Android │     │  iOS         │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
       ┌────────────────────────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 7    │     │   Phase 8    │     │   Phase 9    │
│  Submit to   │────▶│  CI/CD       │────▶│  OTA Update  │
│  Stores      │     │  Pipeline    │     │  (hotfix)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Phase 1: Chuan bi moi truong Development

### 1.1. Yeu cau he thong

| Phan mem | Yeu cau | Ghi chu |
|----------|---------|---------|
| Node.js | >= 18.x | Runtime |
| npm | >= 9.x | Package manager |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | Latest | `npm install -g eas-cli` |
| Xcode | >= 15.0 | **Chi can cho iOS** (macOS only) |
| Android Studio | Latest | Cho Android Emulator + SDK |
| CocoaPods | >= 1.14 | **Chi can cho iOS** |
| JDK | 17 | Cho Android build |
| Watchman | Latest | File watcher (macOS) |

### 1.2. Cai dat tools

```bash
# === Cai dat Expo CLI va EAS CLI ===
npm install -g expo-cli eas-cli

# === Dang nhap Expo account ===
# (Tao tai khoan tai https://expo.dev/signup neu chua co)
eas login

# === Kiem tra dang nhap ===
eas whoami
```

### 1.3. Clone va cai dat

```bash
# Clone repo
git clone <repo-url>
cd football-booking-mobile

# Cai dat dependencies
npm install
```

### 1.4. Cau hinh API URL

Tao/cap nhat file `.env.local`:

```env
# Development (may tinh local)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

> **Luu y cho thiet bi that / emulator:**
> - **Android Emulator:** `http://10.0.2.2:3000/api/v1`
> - **iOS Simulator:** `http://localhost:3000/api/v1`
> - **Thiet bi that (cung wifi):** `http://<IP-may-tinh>:3000/api/v1`
>
> Tim IP may tinh:
> ```bash
> # macOS
> ipconfig getifaddr en0
>
> # Windows
> ipconfig | findstr IPv4
>
> # Linux
> hostname -I | awk '{print $1}'
> ```

### 1.5. Chay app Development

```bash
# Khoi dong Expo dev server
npx expo start

# Hoac chi dinh platform
npx expo start --android
npx expo start --ios

# Xoa cache neu gap loi
npx expo start --clear
```

### 1.6. Test tren thiet bi that

1. Cai dat app **Expo Go** tu App Store / Play Store
2. Chay `npx expo start`
3. Scan QR code bang Expo Go
4. Dam bao dien thoai va may tinh cung mang wifi

---

## Phase 2: Cau hinh EAS Build

### 2.1. Khoi tao EAS project

```bash
# Lien ket voi Expo project (se tao project tren expo.dev)
eas init

# Neu da co project:
eas init --id <project-id>
```

### 2.2. Tao file `eas.json`

Tao file `eas.json` o thu muc goc:

```json
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "http://localhost:3000/api/v1"
      },
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://staging-api.your-domain.com/api/v1"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://api.your-domain.com/api/v1"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "autoIncrement": true
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./credentials/google-play-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

**Giai thich cac profile:**

| Profile | Muc dich | Output | API URL |
|---------|----------|--------|---------|
| `development` | Dev build voi dev client | APK / Simulator | localhost |
| `preview` | Test noi bo (QA team) | APK / IPA (Ad Hoc) | staging API |
| `production` | Phat hanh len Store | AAB (Android) / IPA (iOS) | production API |

### 2.3. Cap nhat `app.json` cho build

Cap nhat `app.json` voi thong tin can thiet:

```json
{
  "expo": {
    "name": "Football Booking",
    "slug": "football-booking-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "footballbooking",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,

    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.footballbooking",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Ung dung can quyen vi tri de tim san bong gan ban.",
        "NSLocationAlwaysUsageDescription": "Ung dung can quyen vi tri de tim san bong gan ban."
      }
    },

    "android": {
      "package": "com.yourcompany.footballbooking",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
        "CAMERA"
      ]
    },

    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },

    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Ung dung can quyen vi tri de tim san bong gan ban."
        }
      ],
      "@react-native-community/datetimepicker"
    ],

    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },

    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },

    "owner": "your-expo-username",

    "runtimeVersion": {
      "policy": "appVersion"
    },

    "updates": {
      "url": "https://u.expo.dev/your-eas-project-id"
    }
  }
}
```

> **QUAN TRONG:** Thay the cac gia tri sau:
> - `com.yourcompany.footballbooking` → Package name / Bundle ID thuc te
> - `your-eas-project-id` → ID tu `eas init`
> - `your-expo-username` → Expo account username

---

## Phase 3: Chuan bi tai khoan Developer

### 3.1. Google Play Developer Account

| Buoc | Chi tiet |
|------|----------|
| 1 | Truy cap [Google Play Console](https://play.google.com/console) |
| 2 | Dang ky tai khoan Developer ($25 USD mot lan) |
| 3 | Xac minh danh tinh (can CMND/CCCD hoac ho chieu) |
| 4 | Doi phe duyet (co the mat 2-7 ngay) |
| 5 | Tao app moi trong Console |
| 6 | Dien thong tin: ten app, mo ta, screenshots, icon |

**Tao Google Play Service Account (cho auto-submit):**

1. Vao [Google Cloud Console](https://console.cloud.google.com)
2. Tao project moi hoac chon project hien co
3. APIs & Services > Enable "Google Play Android Developer API"
4. IAM & Admin > Service Accounts > Create Service Account
   - Role: "Service Account User"
5. Tao key JSON > Download
6. Vao Google Play Console > Settings > API access
7. Link Google Cloud project
8. Grant "Release manager" role cho service account
9. Luu file JSON vao `credentials/google-play-key.json`

### 3.2. Apple Developer Account

| Buoc | Chi tiet |
|------|----------|
| 1 | Truy cap [Apple Developer](https://developer.apple.com) |
| 2 | Dang ky tai khoan ($99 USD / nam) |
| 3 | Doi phe duyet (1-2 ngay) |
| 4 | Lay thong tin: Team ID, Apple ID |

**Lay thong tin can thiet:**

```bash
# Kiem tra Apple Team ID
# Vao https://developer.apple.com/account
# → Membership → Team ID (VD: ABCDE12345)

# App Store Connect App ID
# Vao https://appstoreconnect.apple.com
# Tao app moi > lay App ID (so)
```

### 3.3. Tao thu muc `credentials/`

```bash
mkdir -p credentials
echo "credentials/" >> .gitignore
```

> **CANH BAO:** Thu muc `credentials/` **KHONG DUOC** commit len Git. Luu tru an toan (VD: 1Password, Vault, hoac bien mat CI/CD).

---

## Phase 4: Cau hinh App cho Production

### 4.1. Tao App Icons

**Yeu cau:**

| Platform | Kich thuoc | File |
|----------|-----------|------|
| iOS | 1024x1024 px (PNG, khong trong suot, khong bo goc) | `icon.png` |
| Android Adaptive (foreground) | 1024x1024 px (PNG, trong suot) | `android-icon-foreground.png` |
| Android Adaptive (background) | 1024x1024 px | `android-icon-background.png` |
| Android Monochrome | 1024x1024 px | `android-icon-monochrome.png` |
| Splash Screen | 200x200 px toi thieu | `splash-icon.png` |
| Favicon (web) | 48x48 px | `favicon.png` |

**Tool tao icon:**
- [Expo Icon Builder](https://icon.expo.fyi/) — cong cu chinh thuc
- [AppIcon.co](https://www.appicon.co/) — tao tat ca kich thuoc
- [Figma](https://figma.com) — thiet ke tuy chinh

Dat tat ca vao `assets/images/`.

### 4.2. Tao Splash Screen

Splash screen da duoc cau hinh trong `app.json` > `plugins` > `expo-splash-screen`:
- Light mode: nen trang (#ffffff)
- Dark mode: nen den (#000000)
- Icon: `splash-icon.png` (200px width)

### 4.3. Tao Screenshots cho Store

**Google Play yeu cau:**

| Loai | Kich thuoc | So luong |
|------|-----------|---------|
| Phone | 1080x1920 hoac 1440x2560 px | 2-8 anh |
| Tablet 7" | 1200x1920 px | 0-8 anh |
| Tablet 10" | 1600x2560 px | 0-8 anh |
| Feature graphic | 1024x500 px | 1 anh (bat buoc) |

**App Store yeu cau:**

| Loai | Kich thuoc | So luong |
|------|-----------|---------|
| iPhone 6.7" | 1290x2796 px | 1-10 anh |
| iPhone 6.5" | 1284x2778 px | 1-10 anh |
| iPad 12.9" | 2048x2732 px | 1-10 anh (neu ho tro tablet) |

**Goi y man hinh chup:**
1. Trang chu - danh sach san bong
2. Chi tiet san - gallery anh
3. Chon slot - lich va khung gio
4. Thanh toan - vi dien tu
5. Ghep keo - danh sach tran
6. Profile - thong tin ca nhan

### 4.4. Chuan bi noi dung Store Listing

**Ten app:** Football Booking (hoac ten tieng Viet)

**Mo ta ngan (80 ky tu):**
```
Dat san bong da nhanh chong, ghep keo tim doi thu, thanh toan qua vi dien tu.
```

**Mo ta day du:**
```
Football Booking - Ung dung dat san bong da truc tuyen

TIM SAN BONG
- Tim kiem san bong gan ban theo vi tri GPS
- Loc theo loai san (5, 7, 11 nguoi)
- Xem anh, gia, danh gia chi tiet

DAT SAN DE DANG
- Chon ngay, gio, thoi luong linh hoat
- Them dich vu kem theo (nuoc, ao, ...)
- Thanh toan nhanh bang vi dien tu
- Nhan QR Code de check-in tai san

GHEP KEO TIM DOI THU
- Tao tran dau, tim doi thu phu hop
- Loc theo cap do: Vui ve, Ban chuyen, Chuyen nghiep
- Xac nhan tran dau truc tuyen

VI DIEN TU
- Nap tien qua VNPAY, MoMo
- Thanh toan nhanh, an toan
- Theo doi lich su giao dich
```

**Tu khoa:** dat san bong, san bong da, booking san bong, ghep keo, tim doi thu, bong da

**Danh muc:**
- Google Play: Sports
- App Store: Sports > Sports

---

## Phase 5: Build Android (Google Play)

### 5.1. Build APK de test (Preview)

```bash
# Build APK de test noi bo
eas build --platform android --profile preview
```

Sau khi build xong:
1. Download APK tu link EAS cung cap
2. Gui cho QA team test
3. Hoac cai truc tiep len thiet bi Android

### 5.2. Build AAB cho Production

```bash
# Build Android App Bundle (format Google Play yeu cau)
eas build --platform android --profile production
```

**Qua trinh se:**
1. EAS Build tao app tren cloud
2. Tu dong tao keystore (lan dau) hoac dung keystore da luu
3. Build thanh file `.aab`
4. Tra ve link download

### 5.3. Quan ly Keystore (QUAN TRONG)

```bash
# === Xem thong tin keystore hien tai ===
eas credentials --platform android

# === Download keystore de backup ===
eas credentials --platform android
# Chon: Android Keystore > Download

# === Luu keystore an toan ===
# Di chuyen file .jks vao thu muc an toan
mv *.jks credentials/android-keystore.jks
# Luu mat khau keystore va alias password
```

> **CANH BAO QUAN TRONG:**
> - Keystore **KHONG THE TAO LAI**. Neu mat keystore, ban **KHONG THE** update app tren Play Store.
> - **PHAI** backup keystore, keystore password, va key alias password.
> - Luu tru tai noi an toan (1Password, AWS Secrets Manager, hoac USB offline).

**Backup keystore checklist:**

- [ ] Download file `.jks` tu EAS
- [ ] Ghi lai keystore password
- [ ] Ghi lai key alias name
- [ ] Ghi lai key alias password
- [ ] Luu tru tai 2 noi khac nhau
- [ ] KHONG commit len Git

### 5.4. Test APK/AAB truoc khi submit

```bash
# === Cai APK len thiet bi ===
adb install path/to/app.apk

# === Test voi bundletool (cho AAB) ===
# Download bundletool: https://github.com/google/bundletool/releases
java -jar bundletool.jar build-apks \
  --bundle=path/to/app.aab \
  --output=app.apks

java -jar bundletool.jar install-apks --apks=app.apks
```

**Test checklist Android:**

- [ ] App khoi dong khong crash
- [ ] Login/Register hoat dong
- [ ] Xac thuc email (OTP)
- [ ] Tim kiem san bong
- [ ] Xem chi tiet san
- [ ] Chon slot va dat san
- [ ] Thanh toan bang vi
- [ ] Xem QR Code check-in
- [ ] Ghep keo - tao/tim/tham gia tran
- [ ] Nap tien vi (VNPAY/MoMo link)
- [ ] Xem lich su giao dich
- [ ] Cap nhat profile
- [ ] Dang xuat
- [ ] Deep link hoat dong
- [ ] Permission vi tri
- [ ] Back button hoat dong dung
- [ ] Rotation khong mat state
- [ ] Offline handling (hien thong bao loi)

---

## Phase 6: Build iOS (App Store)

### 6.1. Yeu cau

- **macOS** voi **Xcode >= 15.0** (bat buoc cho iOS build local)
- Hoac dung **EAS Build** tren cloud (KHONG can macOS)
- Apple Developer Account ($99/nam)

### 6.2. Cau hinh iOS Credentials

```bash
# EAS tu dong quan ly credentials
# Lan dau chay, se hoi:
# - Dang nhap Apple Developer account
# - Tao/chon Distribution Certificate
# - Tao/chon Provisioning Profile

eas credentials --platform ios
```

**Cac loai credentials iOS:**

| Credential | Muc dich | Quan ly |
|-----------|----------|---------|
| Distribution Certificate | Ky ung dung | EAS tu dong |
| Provisioning Profile | Cho phep cai app | EAS tu dong |
| Push Notification Key | FCM push (neu dung) | Tao thu cong |

### 6.3. Build IPA cho TestFlight (Preview)

```bash
# Build cho TestFlight testing
eas build --platform ios --profile preview
```

### 6.4. Build IPA cho App Store (Production)

```bash
# Build cho App Store submission
eas build --platform ios --profile production
```

### 6.5. Test tren TestFlight

1. Submit IPA len TestFlight (xem Phase 7)
2. Moi tester qua email
3. Tester cai TestFlight app tu App Store
4. Mo TestFlight > cai ban test

**Test checklist iOS:**

- [ ] App khoi dong khong crash
- [ ] Login/Register hoat dong
- [ ] Xac thuc email (OTP)
- [ ] Tim kiem san bong
- [ ] Xem chi tiet san + gallery
- [ ] Chon slot va dat san
- [ ] Thanh toan bang vi
- [ ] Xem QR Code check-in
- [ ] Ghep keo - tao/tim/tham gia tran
- [ ] Nap tien vi (mo link trong Safari)
- [ ] Xem lich su giao dich
- [ ] Cap nhat profile
- [ ] Dang xuat
- [ ] Permission vi tri (location popup)
- [ ] Safe area hoat dong dung
- [ ] Swipe back gesture hoat dong
- [ ] Dark mode hoat dong
- [ ] iPad layout (neu ho tro)

---

## Phase 7: Phat hanh len Store

### 7.1. Submit len Google Play Store

**Cach 1: Tu dong bang EAS Submit**

```bash
# Submit truc tiep tu EAS
eas submit --platform android --profile production
```

EAS se:
1. Download AAB tu build moi nhat
2. Upload len Google Play Console
3. Su dung service account key tu `eas.json`

**Cach 2: Thu cong qua Google Play Console**

1. Vao [Google Play Console](https://play.google.com/console)
2. Chon app > Release > Production
3. Create new release
4. Upload file `.aab`
5. Dien Release notes
6. Review va submit

**Google Play Review Process:**

| Buoc | Thoi gian |
|------|----------|
| Upload AAB | Ngay lap tuc |
| Automated review | 1-3 gio |
| Human review (lan dau) | 3-7 ngay |
| Human review (update) | 1-3 ngay |
| Phat hanh | Ngay sau khi duyet |

### 7.2. Submit len App Store

**Cach 1: Tu dong bang EAS Submit**

```bash
# Submit truc tiep tu EAS
eas submit --platform ios --profile production
```

EAS se:
1. Download IPA tu build moi nhat
2. Upload len App Store Connect
3. Su dung Apple credentials tu `eas.json`

**Cach 2: Thu cong qua Transporter (macOS)**

1. Download [Transporter](https://apps.apple.com/app/transporter/id1450874784) tu Mac App Store
2. Keo tha file `.ipa` vao Transporter
3. Click "Deliver"
4. Doi upload hoan tat

**Cach 3: Thu cong qua App Store Connect**

1. Vao [App Store Connect](https://appstoreconnect.apple.com)
2. Chon app > TestFlight (IPA se xuat hien sau khi upload)
3. Doi processing (10-30 phut)
4. Chuyen sang App Store tab
5. Tao version moi
6. Chon build tu TestFlight
7. Dien thong tin: screenshots, mo ta, tu khoa
8. Submit for Review

**App Store Review Process:**

| Buoc | Thoi gian |
|------|----------|
| Upload IPA | Ngay lap tuc |
| Processing | 10-30 phut |
| TestFlight (External) | 1-2 ngay review |
| App Store Review (lan dau) | 1-7 ngay |
| App Store Review (update) | 1-2 ngay |
| Phat hanh | Ngay hoac hen lich |

### 7.3. App Review Guidelines — Nhung loi thuong gap

**Google Play:**

| Loi | Nguyen nhan | Cach sua |
|-----|------------|---------|
| Metadata | Mo ta khong dung, screenshot sai | Cap nhat mo ta va screenshot |
| Permissions | Xin quyen khong can thiet | Chi xin quyen thuc su dung |
| Privacy Policy | Thieu link privacy policy | Them link trong Store listing |
| Ads | Quang cao khong ro rang | Danh dau dung trong Console |
| Login | Reviewer khong test duoc | Cung cap test account |

**App Store:**

| Loi | Nguyen nhan | Cach sua |
|-----|------------|---------|
| Guideline 4.0 - Design | UI khong dat chuan iOS | Cai thien UI/UX |
| Guideline 5.1.1 - Privacy | Thieu Privacy Policy | Them link va cap nhat Info.plist |
| Guideline 2.1 - Performance | App crash hoac bug | Fix bug va resubmit |
| Guideline 2.3.1 - Login | Khong co test account | Cung cap demo account |
| Guideline 3.1.1 - Payments | Dung thanh toan ngoai Apple | Su dung In-App Purchase cho digital goods |

> **QUAN TRONG voi iOS:** Apple yeu cau tat ca "digital goods" phai dung In-App Purchase.
> Tuy nhien, viec dat san bong la "physical service" (dich vu thuc te), nen co the dung
> payment gateway ben ngoai (VNPAY, MoMo). Neu Apple tu choi, can giai thich rang day la
> dich vu dat cho thuc te, khong phai digital content.

### 7.4. Cung cap Demo Account cho Review

Khi submit, cung cap test account de reviewer test:

```
Email: reviewer@footballbooking.com
Password: Reviewer@123

Hoac:
Phone: 0999999999
Password: Reviewer@123
```

**Chuan bi:**
1. Tao tai khoan test tren production
2. Xac thuc email san
3. Nap san tien vao vi (de test thanh toan)
4. Dam bao co du lieu san bong de xem
5. Ghi note trong "Review Notes" cua App Store Connect / Google Play Console

---

## Phase 8: CI/CD voi EAS

### 8.1. Tao file `.github/workflows/eas-build.yml`

```yaml
name: EAS Build

on:
  push:
    branches: [main]
    tags:
      - "v*"
  pull_request:
    branches: [main]

jobs:
  # ========== Lint & Type Check ==========
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit

  # ========== Build Preview (tren PR) ==========
  build-preview:
    if: github.event_name == 'pull_request'
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile preview --non-interactive

  # ========== Build Production (khi tag v*) ==========
  build-production:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile production --non-interactive

  # ========== Submit to Stores ==========
  submit:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: build-production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas submit --platform all --profile production --non-interactive
```

### 8.2. Cau hinh GitHub Secrets

Vao repo GitHub > Settings > Secrets > Actions:

| Secret | Gia tri | Cach lay |
|--------|---------|---------|
| `EXPO_TOKEN` | Expo access token | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) |

### 8.3. Workflow su dung

```bash
# === Test build (PR) ===
# Tao PR → CI tu dong build preview

# === Release production ===
# Tang version trong app.json
# Tao tag va push:
git tag v1.0.0
git push origin v1.0.0
# CI tu dong: lint → build production → submit to stores
```

---

## Phase 9: OTA Update

### 9.1. OTA Update la gi?

OTA (Over-The-Air) Update cho phep cap nhat JavaScript bundle **KHONG CAN** re-build va re-submit len Store. Chi hoat dong cho thay doi JS/TS code, **KHONG** cho native code changes.

### 9.2. Cau hinh OTA

Da cau hinh trong `app.json`:

```json
{
  "runtimeVersion": {
    "policy": "appVersion"
  },
  "updates": {
    "url": "https://u.expo.dev/your-eas-project-id"
  }
}
```

### 9.3. Push OTA Update

```bash
# Push update cho production
eas update --branch production --message "Fix: sua loi hien thi gia"

# Push update cho preview
eas update --branch preview --message "Test: them tinh nang moi"

# Xem lich su updates
eas update:list
```

### 9.4. Khi nao dung OTA vs Full Build

| Thay doi | OTA Update | Full Build |
|----------|-----------|------------|
| Fix bug JavaScript/TypeScript | ✅ | |
| Thay doi UI (style, layout) | ✅ | |
| Them man hinh moi (JS only) | ✅ | |
| Fix logic API call | ✅ | |
| Them/xoa npm package | | ✅ |
| Them native module moi | | ✅ |
| Thay doi app.json (version, permissions) | | ✅ |
| Cap nhat Expo SDK | | ✅ |
| Thay doi splash screen / icon | | ✅ |

---

## Checklist tong hop

### Setup ban dau (1 lan)

- [ ] Tao tai khoan [Expo](https://expo.dev/signup)
- [ ] Tao tai khoan [Google Play Developer](https://play.google.com/console) ($25)
- [ ] Tao tai khoan [Apple Developer](https://developer.apple.com) ($99/nam)
- [ ] Cai dat EAS CLI: `npm install -g eas-cli`
- [ ] Dang nhap EAS: `eas login`
- [ ] Khoi tao EAS project: `eas init`
- [ ] Tao file `eas.json`
- [ ] Cap nhat `app.json` (bundleIdentifier, package)
- [ ] Tao thu muc `credentials/` va them vao `.gitignore`

### Chuan bi assets

- [ ] App icon 1024x1024 (iOS + Android)
- [ ] Android adaptive icon (foreground + background + monochrome)
- [ ] Splash screen icon
- [ ] Screenshots cho Google Play (phone + tablet)
- [ ] Screenshots cho App Store (iPhone 6.7" + 6.5")
- [ ] Feature graphic cho Google Play (1024x500)

### Chuan bi noi dung

- [ ] Ten app
- [ ] Mo ta ngan (80 ky tu)
- [ ] Mo ta day du
- [ ] Tu khoa
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Demo account cho reviewer

### Build Android

- [ ] `eas build --platform android --profile preview` → test APK
- [ ] Test tat ca tinh nang tren APK
- [ ] `eas build --platform android --profile production` → build AAB
- [ ] Backup keystore an toan
- [ ] Submit len Google Play: `eas submit --platform android`
- [ ] Dien Store listing (mo ta, screenshots)
- [ ] Submit for review

### Build iOS

- [ ] `eas build --platform ios --profile preview` → test
- [ ] Upload len TestFlight va test
- [ ] `eas build --platform ios --profile production` → build IPA
- [ ] Submit len App Store: `eas submit --platform ios`
- [ ] Dien App Store listing (mo ta, screenshots)
- [ ] Them demo account trong Review Notes
- [ ] Submit for review

### Post-launch

- [ ] Monitor crash reports (Expo Dashboard)
- [ ] Set up OTA updates cho hotfix
- [ ] Theo doi review tren cac Store
- [ ] Plan version 1.1 features

---

## Cac lenh thuong dung

```bash
# ============================================
# DEVELOPMENT
# ============================================
npx expo start                           # Chay dev server
npx expo start --clear                   # Chay + xoa cache
npx expo start --android                 # Chay tren Android
npx expo start --ios                     # Chay tren iOS

# ============================================
# EAS BUILD
# ============================================
eas build --platform android --profile development    # Dev build (APK)
eas build --platform android --profile preview        # QA build (APK)
eas build --platform android --profile production     # Store build (AAB)
eas build --platform ios --profile development        # Dev build (Simulator)
eas build --platform ios --profile preview            # QA build (IPA)
eas build --platform ios --profile production         # Store build (IPA)
eas build --platform all --profile production         # Build ca 2

# ============================================
# EAS SUBMIT
# ============================================
eas submit --platform android --profile production    # Submit Play Store
eas submit --platform ios --profile production        # Submit App Store

# ============================================
# EAS UPDATE (OTA)
# ============================================
eas update --branch production --message "mô tả"     # Push OTA production
eas update --branch preview --message "mô tả"        # Push OTA preview
eas update:list                                       # Xem lich su OTA

# ============================================
# CREDENTIALS
# ============================================
eas credentials --platform android                    # Quan ly Android keys
eas credentials --platform ios                        # Quan ly iOS certs
eas whoami                                            # Kiem tra dang nhap

# ============================================
# DIAGNOSTICS
# ============================================
npx expo-doctor                                       # Kiem tra project health
npx expo install --check                              # Kiem tra dependency versions
eas diagnostics                                       # Kiem tra EAS config
```

---

## Luu y quan trong

### 1. Bao mat

- **KHONG BAO GIO** commit file `.env`, `credentials/`, keystore, hoac secret keys len Git
- Su dung GitHub Secrets cho CI/CD
- Doi JWT_SECRET cho production (dung `openssl rand -hex 32`)
- Su dung HTTPS cho production API

### 2. Versioning

- Tang `version` trong `app.json` moi khi submit ban moi
- Android: `versionCode` phai tang (so nguyen, VD: 1, 2, 3, ...)
- iOS: `buildNumber` phai tang (VD: "1", "2", "3", ...)
- Su dung `autoIncrement` trong `eas.json` de tu dong tang

### 3. API URL

- Development: `http://localhost:3000/api/v1`
- Android Emulator: `http://10.0.2.2:3000/api/v1`
- Staging: `https://staging-api.your-domain.com/api/v1`
- Production: `https://api.your-domain.com/api/v1`

**DOI API URL** bang cach thay doi bien trong `eas.json` > `env` > `EXPO_PUBLIC_API_BASE_URL`.
KHONG hardcode URL trong source code.

### 4. Thoi gian uoc tinh

| Cong viec | Thoi gian |
|-----------|----------|
| Setup EAS + credentials | 1-2 gio |
| Tao app icons + screenshots | 2-4 gio |
| Build preview + test | 1-2 gio |
| Build production | 30-60 phut (EAS cloud) |
| Google Play review (lan dau) | 3-7 ngay |
| App Store review (lan dau) | 1-7 ngay |
| OTA update | 5-10 phut |

---

*Plan nay duoc viet cho du an Football Booking Mobile.*
*Cap nhat: 2026-03-02*
