export type BillItem = {
  id: number;
  name: string;
  bill_type: string;
  value: string;
  is_paid: boolean;
  date_of_payment: string;
};

export type BillTransaction = {
  id: number;
  type: string;
  price: string;
  date_of_transaction: string;
  transaction_payment: string;
  money_resource?: string | null;
  payment_proof: string | null;
  product: number | null;
  quantity: number;
  user: number | null;
  bill: number | null;
  created_at: string;
  updated_at: string;
};

export type BillDetail = BillItem & {
  type: string;
  finish_month: string | null;
  created_at: string;
  updated_at: string;
  transactions: BillTransaction[];
};
