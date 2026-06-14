using backend.Models;

namespace backend.Repositories;

public interface ICartRepository : IGenericRepository<CartItem>
{
    Task<List<CartItem>> GetCartWithBooksAsync(int userId);
    Task<CartItem?> GetCartItemAsync(int userId, int bookId);
    Task ClearCartAsync(int userId);
}