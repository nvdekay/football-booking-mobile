# Football Booking Mobile - User Home Screen Structure

## 📁 Project Structure

```
app/
├── (user)/
│   ├── _layout.tsx              # Bottom tab navigation layout
│   ├── index.tsx                # Main home page screen
│   └── _components/
│       ├── index.ts             # Component exports
│       ├── Header.tsx           # User greeting header with notification icon
│       ├── SearchBar.tsx        # Search input component
│       ├── TabFilter.tsx        # Tab filter for stadium types
│       ├── FeaturedStadium.tsx  # Horizontal scroll featured stadiums
│       └── StadiumCard.tsx      # Stadium card with all details

src/
├── constants/
│   └── mockStadiums.ts          # Mock stadium data and tab filters
├── types/
│   └── stadium.ts               # TypeScript interfaces for Stadium and TabFilter
```

## 🎨 Component Overview

### Header Component (`Header.tsx`)
- Displays user greeting with "Xin chào, [Name]"
- Shows user avatar or initial
- Notification bell icon

### SearchBar Component (`SearchBar.tsx`)
- Input field with search icon
- Filters stadiums by name or address
- Placeholder: "Tìm sân, địa chỉ..."

### TabFilter Component (`TabFilter.tsx`)
- Horizontal scrollable tabs: "Tất cả", "Sân 5", "Sân 7", "Sân 11", "G"
- Active tab highlighted in green (#16a34a)
- Filters stadium list based on selected tab

### FeaturedStadium Component (`FeaturedStadium.tsx`)
- Section title "Gợi ý cho bạn"
- Horizontal scrollable cards showing featured stadiums
- Each card displays: image, name, rating, and distance
- "Xem tất cả" (View all) link

### StadiumCard Component (`StadiumCard.tsx`)
- Full stadium details:
  - Image
  - Name
  - Rating with review count
  - Address with location icon
  - Distance in km
  - Price range (e.g., 300k - 500k/h)
  - "Đặt ngay" (Book now) button in green

### Main Home Screen (`index.tsx`)
- Combines all components
- Filters stadiums by selected tab and search text
- Shows featured stadiums at the top
- Shows full stadium list below
- Vertical scrollable with bottom spacing for navigation bar

### Bottom Navigation Layout (`_layout.tsx`)
- Tab navigator with 4 tabs:
  - **Trang chủ** (Home) - Current page
  - **Tìm kiếm** (Search) - Placeholder
  - **Keo dau** (Bookings) - Placeholder
  - **Cá nhân** (Profile) - Placeholder
- Active tab color: Green (#16a34a)
- Inactive tab color: Gray (#9CA3AF)

## 💾 Mock Data

### MOCK_STADIUMS (`mockStadiums.ts`)
Array of 7 stadium objects with:
- `id`: Unique identifier
- `name`: Stadium name (Vietnamese)
- `image`: URL to stadium image
- `rating`: Star rating (0-5)
- `reviewCount`: Number of reviews
- `address`: Full address
- `distance`: Distance in km
- `priceMin` / `priceMax`: Price range in thousands (k)
- `type`: Stadium type ('sân5', 'sân7', 'sân11')
- `isFeatured`: Boolean for featured stadiums

### TAB_FILTERS (`mockStadiums.ts`)
Array of 5 filter tabs:
- "Tất cả" (All) - Shows all stadiums
- "Sân 5" (5-a-side) - Filters by type
- "Sân 7" (7-a-side) - Filters by type
- "Sân 11" (11-a-side) - Filters by type
- "G" - Placeholder for future use

## 🎨 Styling

- **Framework**: NativeWind (Tailwind CSS for React Native)
- **Primary Color**: Green (#16a34a)
- **Secondary Colors**: Gray palette (#999999, #666666, #E5E7EB, #9CA3AF)
- **Font Sizes**: 
  - Header: 16px (font-semibold)
  - Body: 14px (font-medium)
  - Small: 12px, 11px, 10px
- **Spacing**: 16px horizontal padding, consistent vertical gaps

## 🔄 Data Flow

1. Home page loads with mock stadium data
2. User can:
   - Type in search bar → filters stadiums by name/address
   - Select tab → filters stadiums by type
   - Scroll through featured stadiums horizontally
   - View full stadium list vertically
   - Navigate to other sections via bottom tabs

## ✅ Code Quality

- ✓ All components are TypeScript interfaces
- ✓ Clean separation of concerns
- ✓ Reusable components with clear props
- ✓ Mock data separated from UI logic
- ✓ Proper error handling and null checks
- ✓ Responsive design using Tailwind classes
- ✓ No compilation errors

## 🚀 Future Enhancements

- Implement Search screen
- Implement Bookings screen
- Implement Profile screen
- Add real API integration
- Add stadium detail page
- Add booking functionality
- Implement real user data from authentication

## 📝 Notes

- All images are using unsplash.com URLs as placeholders
- User data is pulled from AuthContext for personalization
- Navigation is set up with expo-router
- Safe area handling for notched devices
