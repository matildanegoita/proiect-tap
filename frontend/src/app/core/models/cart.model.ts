export interface CartItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}