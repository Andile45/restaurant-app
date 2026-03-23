export interface Profile {
  id: string;
  auth_id: string;
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
  category_id: string;
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
    add_ons?: string[];
    remove?: string[];
    sides?: string[];
    drinks?: string[];
  };
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status:
    | 'pending'
    | 'new'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'payment_failed';
  address?: string;
  created_at: string;
  order_items?: OrderItem[];
  order_number?: number | null;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  method: 'card' | 'paypal' | 'voucher' | 'other';
  provider: 'stripe' | 'paypal' | 'paystack' | string;
  transaction_id?: string;
  card_last4?: string;
  currency: string;
  created_at: string;
}

export interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}
