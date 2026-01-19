export interface OrderItem{
    id:string;
    order_id:string;
    food_id:string;
    quantity:number;
    price_at_purchase:number;
    extras:{
        add_ons?:string[];  // Optional extras added
        remove?:string[];  // Optional items removed
        sides?:string[];
        drinks?:string[]
    }
    created_at:string;
}