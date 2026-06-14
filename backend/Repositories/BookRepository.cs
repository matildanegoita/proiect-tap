using backend.Data;
using backend.DTOs.Books;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class BookRepository : GenericRepository<Book>, IBookRepository
{
    public BookRepository(AppDbContext context) : base(context) { }

    public async Task<PagedResultDto<Book>> GetFilteredBooksAsync(BookFilterDto filter)
    {
        var query = _context.Books.Include(b => b.Category).AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(b =>
                b.Title.ToLower().Contains(filter.Search.ToLower()) ||
                b.Author.ToLower().Contains(filter.Search.ToLower()) ||
                b.ISBN.Contains(filter.Search));

        if (filter.CategoryId.HasValue)
            query = query.Where(b => b.CategoryId == filter.CategoryId);

        if (filter.MinPrice.HasValue)
            query = query.Where(b => b.Price >= filter.MinPrice);

        if (filter.MaxPrice.HasValue)
            query = query.Where(b => b.Price <= filter.MaxPrice);

        if (filter.MinRating.HasValue)
            query = query.Where(b => b.AvgRating >= filter.MinRating);

        query = filter.SortBy switch
        {
            "price" => filter.SortOrder == "desc"
                ? query.OrderByDescending(b => b.Price)
                : query.OrderBy(b => b.Price),
            "rating" => filter.SortOrder == "desc"
                ? query.OrderByDescending(b => b.AvgRating)
                : query.OrderBy(b => b.AvgRating),
            _ => filter.SortOrder == "desc"
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResultDto<Book>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<Book?> GetBookWithCategoryAsync(int id) =>
        await _context.Books.Include(b => b.Category).FirstOrDefaultAsync(b => b.Id == id);
}