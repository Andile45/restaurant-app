export interface FoodItem {
    id:string;
    category_id:string; //Foreign key to category
    name:string;
    description?:string;
    price:number;
    image_url?:string;
    is_available:boolean;
    created_at:string
}