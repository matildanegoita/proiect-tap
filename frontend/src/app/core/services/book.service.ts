import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book, BookFilter, Category, PagedResult } from '../models/book.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/Books`;

  constructor(private http: HttpClient) {}

  getBooks(filter: BookFilter = {}) {
    let params = new HttpParams();
    if (filter.search) params = params.set('search', filter.search);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.minPrice) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice);
    if (filter.minRating) params = params.set('minRating', filter.minRating);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    params = params.set('page', filter.page ?? 1);
    params = params.set('pageSize', filter.pageSize ?? 10);

    return this.http.get<PagedResult<Book>>(this.apiUrl, { params });
  }

  getBookById(id: number) {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  createBook(data: any) {
    return this.http.post<Book>(this.apiUrl, data);
  }

  updateBook(id: number, data: any) {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, data);
  }

  deleteBook(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCategories() {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(name: string) {
    return this.http.post<Category>(`${this.apiUrl}/categories`, JSON.stringify(name), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}