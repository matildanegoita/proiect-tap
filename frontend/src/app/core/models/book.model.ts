export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  stock: number;
  coverUrl: string;
  avgRating: number;
  reviewCount: number;
  categoryName: string;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface BookFilter {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}