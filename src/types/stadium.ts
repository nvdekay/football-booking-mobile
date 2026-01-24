export interface Stadium {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  address: string;
  distance: number;
  priceMin: number;
  priceMax: number;
  type: 'sân5' | 'sân7' | 'sân11';
  isFeatured?: boolean;
}

export interface TabFilter {
  id: string;
  label: string;
  value: 'all' | 'sân5' | 'sân7' | 'sân11' | 'g';
}
