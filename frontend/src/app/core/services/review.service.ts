import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/Reviews`;

  constructor(private http: HttpClient) {}

  getBookReviews(bookId: number) {
    return this.http.get<Review[]>(`${this.apiUrl}/book/${bookId}`);
  }

  addReview(data: CreateReview) {
    return this.http.post<Review>(this.apiUrl, data);
  }

  canReview(bookId: number) {
    return this.http.get<{ canReview: boolean }>(`${this.apiUrl}/can-review/${bookId}`);
  }
}