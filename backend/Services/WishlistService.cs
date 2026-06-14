using backend.Data;
using backend.DTOs.Books;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IWishlistService
{
    Task<List<BookDto>> GetWishlist(int userId);
    Task<bool> AddToWishlist(int userId, int bookId);
    Task<bool> RemoveFromWishlist(int userId, int bookId);
    Task<bool> IsInWishlist(int userId, int bookId);
}

public class WishlistService : IWishlistService
{
    private readonly AppDbContext _context;

    public WishlistService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookDto>> GetWishlist(int userId)
    {
        return await _context.WishlistItems
            .Include(w => w.Book).ThenInclude(b => b.Category)
            .Where(w => w.UserId == userId)
            .Select(w => new BookDto
            {
                Id = w.Book.Id,
                Title = w.Book.Title,
                Author = w.Book.Author,
                ISBN = w.Book.ISBN,
                Description = w.Book.Description,
                Price = w.Book.Price,
                Stock = w.Book.Stock,
                CoverUrl = w.Book.CoverUrl,
                AvgRating = w.Book.AvgRating,
                ReviewCount = w.Book.ReviewCount,
                CategoryName = w.Book.Category.Name,
                CategoryId = w.Book.CategoryId
            })
            .ToListAsync();
    }

    public async Task<bool> AddToWishlist(int userId, int bookId)
    {
        if (await IsInWishlist(userId, bookId)) return false;

        _context.WishlistItems.Add(new WishlistItem { UserId = userId, BookId = bookId });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveFromWishlist(int userId, int bookId)
    {
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);
        if (item == null) return false;

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsInWishlist(int userId, int bookId) =>
        await _context.WishlistItems.AnyAsync(w => w.UserId == userId && w.BookId == bookId);
}