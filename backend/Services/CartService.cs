using backend.Data;
using backend.DTOs.Cart;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface ICartService
{
    Task<List<CartItemDto>> GetCart(int userId);
    Task<CartItemDto?> AddToCart(int userId, AddToCartDto dto);
    Task<CartItemDto?> UpdateQuantity(int userId, int bookId, int quantity);
    Task<bool> RemoveFromCart(int userId, int bookId);
    Task ClearCart(int userId);
}

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CartItemDto>> GetCart(int userId)
    {
        return await _context.CartItems
            .Include(c => c.Book)
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                BookId = c.BookId,
                BookTitle = c.Book.Title,
                BookAuthor = c.Book.Author,
                CoverUrl = c.Book.CoverUrl,
                UnitPrice = c.Book.Price,
                Quantity = c.Quantity
            })
            .ToListAsync();
    }

    public async Task<CartItemDto?> AddToCart(int userId, AddToCartDto dto)
    {
        var book = await _context.Books.FindAsync(dto.BookId);
        if (book == null || book.Stock < dto.Quantity) return null;

        var existing = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == dto.BookId);

        if (existing != null)
        {
            existing.Quantity += dto.Quantity;
        }
        else
        {
            existing = new CartItem
            {
                UserId = userId,
                BookId = dto.BookId,
                Quantity = dto.Quantity
            };
            _context.CartItems.Add(existing);
        }

        await _context.SaveChangesAsync();

        return new CartItemDto
        {
            Id = existing.Id,
            BookId = book.Id,
            BookTitle = book.Title,
            BookAuthor = book.Author,
            CoverUrl = book.CoverUrl,
            UnitPrice = book.Price,
            Quantity = existing.Quantity
        };
    }

    public async Task<CartItemDto?> UpdateQuantity(int userId, int bookId, int quantity)
    {
        var item = await _context.CartItems
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId);

        if (item == null) return null;

        item.Quantity = quantity;
        await _context.SaveChangesAsync();

        return new CartItemDto
        {
            Id = item.Id,
            BookId = item.BookId,
            BookTitle = item.Book.Title,
            BookAuthor = item.Book.Author,
            CoverUrl = item.Book.CoverUrl,
            UnitPrice = item.Book.Price,
            Quantity = item.Quantity
        };
    }

    public async Task<bool> RemoveFromCart(int userId, int bookId)
    {
        var item = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == bookId);

        if (item == null) return false;

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task ClearCart(int userId)
    {
        var items = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
    }
}