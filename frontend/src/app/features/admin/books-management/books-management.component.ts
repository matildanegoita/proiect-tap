import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { BookService } from '../../../core/services/book.service';
import { Book, Category } from '../../../core/models/book.model';

@Component({
  selector: 'app-books-management',
  standalone: true,
  imports: [
    FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, CurrencyPipe
  ],
  template: `
    <div class="management-container">
      <div class="header">
        <h1>📚 Gestionare Cărți</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Adaugă carte
        </button>
      </div>

      <!-- Form adaugare/editare -->
      @if (showForm()) {
        <div class="book-form">
          <h2>{{ editingBook() ? 'Editează cartea' : 'Carte nouă' }}</h2>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Titlu</mat-label>
              <input matInput [(ngModel)]="form.title"/>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Autor</mat-label>
              <input matInput [(ngModel)]="form.author"/>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>ISBN</mat-label>
              <input matInput [(ngModel)]="form.isbn"/>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Preț (RON)</mat-label>
              <input matInput type="number" [(ngModel)]="form.price"/>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Stoc</mat-label>
              <input matInput type="number" [(ngModel)]="form.stock"/>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categorie</mat-label>
              <mat-select [(ngModel)]="form.categoryId">
                @for (cat of categories(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL Copertă</mat-label>
              <input matInput [(ngModel)]="form.coverUrl"/>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descriere</mat-label>
              <textarea matInput [(ngModel)]="form.description" rows="3"></textarea>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-raised-button color="primary" (click)="saveBook()">
              {{ editingBook() ? 'Salvează' : 'Adaugă' }}
            </button>
            <button mat-button (click)="closeForm()">Anulează</button>
          </div>
        </div>
      }

      <!-- Tabel cărți -->
      <table mat-table [dataSource]="books()" class="books-table">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Titlu</th>
          <td mat-cell *matCellDef="let book">{{ book.title }}</td>
        </ng-container>

        <ng-container matColumnDef="author">
          <th mat-header-cell *matHeaderCellDef>Autor</th>
          <td mat-cell *matCellDef="let book">{{ book.author }}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Categorie</th>
          <td mat-cell *matCellDef="let book">{{ book.categoryName }}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Preț</th>
          <td mat-cell *matCellDef="let book">{{ book.price | currency:'RON':'symbol':'1.2-2' }}</td>
        </ng-container>

        <ng-container matColumnDef="stock">
          <th mat-header-cell *matHeaderCellDef>Stoc</th>
          <td mat-cell *matCellDef="let book">{{ book.stock }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Acțiuni</th>
          <td mat-cell *matCellDef="let book">
            <button mat-icon-button color="primary" (click)="editBook(book)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteBook(book.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .management-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .book-form {
      background: white; padding: 1.5rem;
      border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 1.5rem;
    }
    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.5rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .books-table { width: 100%; background: white; border-radius: 8px; }
  `]
})
export class BooksManagementComponent implements OnInit {
  books = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingBook = signal<Book | null>(null);
  displayedColumns = ['title', 'author', 'category', 'price', 'stock', 'actions'];

  form = {
    title: '', author: '', isbn: '', description: '',
    price: 0, stock: 0, coverUrl: '', categoryId: 0
  };

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadBooks();
    this.bookService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  loadBooks() {
    this.bookService.getBooks({ pageSize: 100 }).subscribe({
      next: (result) => this.books.set(result.items)
    });
  }

  openForm() {
    this.editingBook.set(null);
    this.form = { title: '', author: '', isbn: '', description: '', price: 0, stock: 0, coverUrl: '', categoryId: 0 };
    this.showForm.set(true);
  }

  editBook(book: Book) {
    this.editingBook.set(book);
    this.form = {
      title: book.title, author: book.author, isbn: book.isbn,
      description: book.description, price: book.price, stock: book.stock,
      coverUrl: book.coverUrl, categoryId: book.categoryId
    };
    this.showForm.set(true);
  }

  saveBook() {
    if (this.editingBook()) {
      this.bookService.updateBook(this.editingBook()!.id, this.form).subscribe({
        next: () => { this.loadBooks(); this.closeForm(); }
      });
    } else {
      this.bookService.createBook(this.form).subscribe({
        next: () => { this.loadBooks(); this.closeForm(); }
      });
    }
  }

  deleteBook(id: number) {
    if (confirm('Ești sigur că vrei să ștergi această carte?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => this.loadBooks()
      });
    }
  }

  closeForm() {
    this.showForm.set(false);
    this.editingBook.set(null);
  }
}