export interface Profile{
    id:string;
    auth_id:string; //supabase Auth uid
    name:string;
    surname:string;
    contact_number:string;
    email:string;
    address?:string;
    card_last4?:string;
    role:'user' | 'admin' | 'manager' | 'staff';
    created_at:string
}