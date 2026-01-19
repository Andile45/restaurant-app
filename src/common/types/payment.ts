export interface Payment{
    id:string;
    order_id:string;
    amount:number;
    status:'pending' | 'completed' | 'failed';
    method:'card' | 'paypal' | 'voucher' | 'other';
    provider:'stripe' | 'paypal' | string;
    transaction_id?:string;
    card_last4?:string;
    currency:string;
    created_at:string;

}