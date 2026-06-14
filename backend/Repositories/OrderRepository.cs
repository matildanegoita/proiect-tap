using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<List<Order>> GetUserOrdersAsync(int userId) =>
        await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Order?> GetOrderWithItemsAsync(int id) =>
        await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<List<Order>> GetAllOrdersWithItemsAsync() =>
        await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
}