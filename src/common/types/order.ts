import type { OrderItem } from "./orderItem.js";

export interface Order {
    id:string;
    user_id:string; // Foreign Key to profiles
    total:number;
    // Order lifecycle statuses (Supabase stores this as text).
    // `pending` = awaiting payment
    // `new` = paid, awaiting staff acceptance/preparation
    // `preparing` -> `ready` -> `completed` are staff progression
    // `payment_failed` = payment attempt failed/cancelled after order was created
    status:
      | 'pending'
      | 'new'
      | 'preparing'
      | 'ready'
      | 'completed'
      | 'cancelled'
      | 'payment_failed';
    address?:string;
    created_at:string;
    order_items?:OrderItem[];
}