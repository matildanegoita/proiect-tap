using backend.Models;

namespace backend.Repositories;

public interface IOrderRepository : IGenericRepository<Order>
{
    Task<List<Order>> GetUserOrdersAsync(int userId);
    Task<Order?> GetOrderWithItemsAsync(int id);
    Task<List<Order>> GetAllOrdersWithItemsAsync();
}