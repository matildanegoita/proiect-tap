export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
  userFirstName: string;
  userLastName: string;
}

export interface CreateReview {
  bookId: number;
  rating: number;
  comment: string;
}