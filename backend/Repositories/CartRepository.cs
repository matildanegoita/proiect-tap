using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class CartRepository : GenericRepository<CartItem>, ICartRepository
{
    public CartRepository(AppDbContext context) : base(context) { }

    public async Task<List<CartItem>> GetCartWithBooksAsync(int userId) =>
        await _context.CartItems
            .Include(c => c.Book)
            .Where(c => c.UserId == userId)
            .ToListAsync();

    public async Task<CartItem?> GetCartItemAsync(int userId, int bookId) =>
        await _context.CartItems
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId);

    public async Task ClearCartAsync(int userId)
    {
        var items = await _context.CartItems
            .Where(c => c.UserId == userId)
            .ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }
}