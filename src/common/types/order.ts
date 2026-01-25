import type { OrderItem } from "./orderItem.js";

export interface Order {
    id:string;
    user_id:string; // Foreign Key to profiles
    total:number;
    status:'pending' | 'completed' | 'cancelled'; // Matches database CHECK constraint
    address?:string;
    created_at:string;
    order_items?:OrderItem[];
}