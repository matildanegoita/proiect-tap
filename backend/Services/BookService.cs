using backend.DTOs.Books;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public interface IBookService
{
    Task<PagedResultDto<BookDto>> GetBooks(BookFilterDto filter);
    Task<BookDto?> GetBookById(int id);
    Task<BookDto> CreateBook(BookCreateDto dto);
    Task<BookDto?> UpdateBook(int id, BookCreateDto dto);
    Task<bool> DeleteBook(int id);
    Task<List<CategoryDto>> GetCategories();
    Task<CategoryDto> CreateCategory(string name);
}

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;
    private readonly IGenericRepository<Category> _categoryRepository;

    public BookService(IBookRepository bookRepository, IGenericRepository<Category> categoryRepository)
    {
        _bookRepository = bookRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<PagedResultDto<BookDto>> GetBooks(BookFilterDto filter)
    {
        var result = await _bookRepository.GetFilteredBooksAsync(filter);
        return new PagedResultDto<BookDto>
        {
            Items = result.Items.Select(MapToDto).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        };
    }

    public async Task<BookDto?> GetBookById(int id)
    {
        var book = await _bookRepository.GetBookWithCategoryAsync(id);
        return book == null ? null : MapToDto(book);
    }

    public async Task<BookDto> CreateBook(BookCreateDto dto)
    {
        var book = new Book
        {
            Title = dto.Title,
            Author = dto.Author,
            ISBN = dto.ISBN,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            CoverUrl = dto.CoverUrl,
            CategoryId = dto.CategoryId
        };

        await _bookRepository.AddAsync(book);
        await _bookRepository.SaveChangesAsync();
        return (await GetBookById(book.Id))!;
    }

    public async Task<BookDto?> UpdateBook(int id, BookCreateDto dto)
    {
        var book = await _bookRepository.GetByIdAsync(id);
        if (book == null) return null;

        book.Title = dto.Title;
        book.Author = dto.Author;
        book.ISBN = dto.ISBN;
        book.Description = dto.Description;
        book.Price = dto.Price;
        book.Stock = dto.Stock;
        book.CoverUrl = dto.CoverUrl;
        book.CategoryId = dto.CategoryId;

        _bookRepository.Update(book);
        await _bookRepository.SaveChangesAsync();
        return await GetBookById(id);
    }

    public async Task<bool> DeleteBook(int id)
    {
        var book = await _bookRepository.GetByIdAsync(id);
        if (book == null) return false;

        _bookRepository.Remove(book);
        await _bookRepository.SaveChangesAsync();
        return true;
    }

    public async Task<List<CategoryDto>> GetCategories()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug
        }).ToList();
    }

    public async Task<CategoryDto> CreateCategory(string name)
    {
        var category = new Category
        {
            Name = name,
            Slug = name.ToLower().Replace(" ", "-")
        };

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();
        return new CategoryDto { Id = category.Id, Name = category.Name, Slug = category.Slug };
    }

    private static BookDto MapToDto(Book b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        Author = b.Author,
        ISBN = b.ISBN,
        Description = b.Description,
        Price = b.Price,
        Stock = b.Stock,
        CoverUrl = b.CoverUrl,
        AvgRating = b.AvgRating,
        ReviewCount = b.ReviewCount,
        CategoryName = b.Category?.Name ?? "",
        CategoryId = b.CategoryId
    };
}