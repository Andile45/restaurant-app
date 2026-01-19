import type { OrderItem } from "./orderItem.js";

export interface Order {
    id:string;
    user_id:string; // Foreign Key to profiles
    total:number;
    status:'pending' | 'preparing' | 'delivered' | 'cancelled';
    address?:string;
    created_at:string;
    order_items?:OrderItem[];
}