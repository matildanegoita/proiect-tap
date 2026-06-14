export interface OrderItem {
  bookId: number;
  bookTitle: string;
  coverUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  discount: number;
  shippingAddress: string;
  promoCode?: string;
  createdAt: Date;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  items: OrderItem[];
}

export interface CreateOrder {
  shippingAddress: string;
  promoCode?: string;
}