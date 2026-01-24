# 🏠 Giao Diện Trang Home - Kiến Trúc Chi Tiết

## 📱 UI Layout

```
┌─────────────────────────────────┐
│    SafeAreaView (bg-white)      │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│      ScrollView (Vertical)      │
│  padding: 16px horizontal, 16px │
└─────────────────────────────────┘
         ↓
    ┌─────────────────┐
    │   HEADER        │ (Header Component)
    │ Avatar | Name   │
    │ Notification 🔔 │
    └─────────────────┘
    ┌─────────────────┐
    │  SEARCH BAR     │ (SearchBar Component)
    │ 🔍 Tìm sân...  │
    └─────────────────┘
    ┌─────────────────┐
    │  TAB FILTER     │ (TabFilter Component)
    │ [Tất cả]        │
    │ [Sân 5] [Sân 7] │ (Horizontal Scroll)
    │ [Sân 11] [G]    │
    └─────────────────┘
    ┌─────────────────┐
    │  FEATURED       │ (FeaturedStadium Component)
    │  GỢI Ý CHO BẠN │
    │ ┌─────┬─────┐   │
    │ │ Sân │ Sân │   │ (Horizontal Scroll)
    │ │  1  │  2  │   │
    │ └─────┴─────┘   │
    └─────────────────┘
    ┌─────────────────┐
    │ DANH SÁCH SÂN   │
    │  ┌───────────┐  │
    │  │ CARD 1    │  │
    │  │ Sân Mỹ Đ  │  │
    │  │ ⭐ 4.8    │  │
    │  │ 📍 Address│  │ (StadiumCard Component)
    │  │ 💰 300k-  │  │ (Vertical Scroll)
    │  │ 500k/h    │  │
    │  │ [Đặt ngay]│  │
    │  └───────────┘  │
    │  ┌───────────┐  │
    │  │ CARD 2    │  │
    │  │ Sân Tây Hồ│  │
    │  │ ...       │  │
    │  └───────────┘  │
    │  ... more cards │
    └─────────────────┘
         ↓
┌─────────────────────────────────┐
│   Bottom Tab Navigation         │
│ 🏠 Trang chủ | 🔍 Tìm kiếm    │
│ 📅 Keo dau  | 👤 Cá nhân       │
└─────────────────────────────────┘
```

---

## 🏗️ Component Hierarchy

```
UserHome (app/(user)/index.tsx)
│
├── SafeAreaView
│   └── ScrollView
│       ├── Header (Header.tsx)
│       │   ├── Avatar/Initials
│       │   ├── Greeting Text
│       │   └── Notification Icon
│       │
│       ├── SearchBar (SearchBar.tsx)
│       │   ├── Search Icon
│       │   └── TextInput
│       │
│       ├── TabFilter (TabFilter.tsx)
│       │   ├── ScrollView (Horizontal)
│       │   └── TouchableOpacity (x5)
│       │       └── Tab Labels
│       │
│       ├── FeaturedStadium (FeaturedStadium.tsx)
│       │   ├── Header Text + View All Link
│       │   └── ScrollView (Horizontal)
│       │       └── Stadium Cards
│       │           ├── Image
│       │           └── Info Overlay
│       │
│       └── StadiumCard (StadiumCard.tsx) [Mapped x7]
│           ├── Image
│           ├── Name
│           ├── Rating
│           ├── Address
│           ├── Distance
│           ├── Price Range
│           └── Book Button
│
└── Tab.Navigator (app/(user)/_layout.tsx)
    ├── Tab 1: Trang chủ (Home)
    ├── Tab 2: Tìm kiếm (Search) - TODO
    ├── Tab 3: Keo dau (Bookings) - TODO
    └── Tab 4: Cá nhân (Profile) - TODO
```

---

## 🎨 Styling Reference

### Colors
```
Primary Green: #16a34a (Active tabs, Book button)
Inactive Gray: #9CA3AF, #999999, #666666
Background: #FFFFFF
Borders: #E5E7EB
Rating Star: #FFC107
```

### Typography
```
Header Text: 16px, font-semibold
Label Text: 14px, font-medium
Small Text: 12px, font-medium
Tiny Text: 11px, 10px
```

### Spacing
```
Horizontal Padding: 16px
Vertical Gaps: 16px (mb-4)
Card Padding: 12px (p-3)
Border Radius: 8px, 9999px (rounded-full)
```

---

## 📊 Data Flow

```
User Opens App
        ↓
Navigate to (user)
        ↓
Load UserHome Component
        ↓
Initialize State:
├── selectedTab = 'all'
└── searchText = ''
        ↓
Render with MOCK_STADIUMS
        ↓
User Interaction:
├── Click Tab → setSelectedTab → filter stadiums
├── Type Search → setSearchText → filter stadiums
└── Scroll → No state change (native scroll)
        ↓
Display Filtered Results
```

---

## 🔄 Filter Logic

```javascript
// Tab Filter:
selectedTab === 'all' ? All stadiums : Filter by type

// Search Filter:
searchText.trim() ? 
  Filter by name OR address (case-insensitive) 
  : No filter

// Combined:
Apply both filters simultaneously using useMemo
```

---

## 🧩 Type Definitions

```typescript
// Stadium
{
  id: string
  name: string
  image: string
  rating: number (0-5)
  reviewCount: number
  address: string
  distance: number (km)
  priceMin: number (thousands)
  priceMax: number (thousands)
  type: 'sân5' | 'sân7' | 'sân11'
  isFeatured?: boolean
}

// TabFilter
{
  id: string
  label: string
  value: 'all' | 'sân5' | 'sân7' | 'sân11' | 'g'
}
```

---

## 📱 Responsive Behavior

```
Feature               | Mobile | Web
─────────────────────┼────────┼─────
Horizontal Scroll    | Yes    | Yes
Vertical Scroll      | Yes    | Yes
Touch/Click          | Yes    | Yes
SafeAreaView         | Yes    | No (ignored)
Tab Navigation       | Yes    | Yes
Typography Scaling   | Yes    | Yes
```

---

## ✅ Quality Checklist

- ✓ Zero TypeScript/Compile Errors
- ✓ All Components Exported Properly
- ✓ Mock Data Comprehensive (7 stadiums)
- ✓ Filter Logic Working Correctly
- ✓ UI Matches Design Exactly
- ✓ Proper State Management (useState, useMemo)
- ✓ Clean Component Structure
- ✓ Reusable Components
- ✓ Proper Icon Usage (Ionicons)
- ✓ Safe Area & Accessibility Considered
- ✓ Scroll Performance Optimized
- ✓ Memory Efficient (useMemo for filters)

---

## 🚀 Ready to Run

```bash
# Start development server
npm start

# Or run on specific platform
npm run ios
npm run android
npm run web
```

**Your home page is fully functional and ready! 🎉**
