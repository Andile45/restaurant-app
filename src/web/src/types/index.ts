// Define all types locally (cannot import from outside src/ in Create React App)

export interface Profile {
  id: string;
  auth_id: string; // supabase Auth uid
  name: string;
  surname: string;
  contact_number: string;
  email: string;
  address?: string;
  card_last4?: string;
  role: 'user' | 'admin' | 'manager' | 'staff';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface FoodItem {
  id: string;
  category_id: string; // Foreign key to category
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_id: string;
  quantity: number;
  price_at_purchase: number;
  extras: {
    add_ons?: string[];  // Optional extras added
    remove?: string[];  // Optional items removed
    sides?: string[];
    drinks?: string[];
  };
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string; // Foreign Key to profiles
  total: number;
  status: 'pending' | 'completed' | 'cancelled'; // Matches database CHECK constraint
  address?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed'; // Matches database column name
  method: 'card' | 'paypal' | 'voucher' | 'other';
  provider: 'stripe' | 'paypal' | 'paystack' | string;
  transaction_id?: string;
  card_last4?: string;
  currency: string;
  created_at: string;
}

// Web-specific types
export interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}
