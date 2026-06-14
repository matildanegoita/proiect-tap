using backend.Data;
using backend.DTOs.Orders;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IOrderService
{
    Task<OrderDto?> CreateOrder(int userId, CreateOrderDto dto);
    Task<List<OrderDto>> GetUserOrders(int userId);
    Task<OrderDto?> GetOrderById(int id, int userId);
    Task<List<OrderDto>> GetAllOrders();
    Task<OrderDto?> UpdateStatus(int id, string status);
}

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly ICartService _cartService;

    public OrderService(AppDbContext context, ICartService cartService)
    {
        _context = context;
        _cartService = cartService;
    }

    public async Task<OrderDto?> CreateOrder(int userId, CreateOrderDto dto)
    {
        var cartItems = await _context.CartItems
            .Include(o => o.User)
            .Include(c => c.Book)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (cartItems.Count == 0) return null;

        // Verifică stock
        foreach (var item in cartItems)
            if (item.Book.Stock < item.Quantity) return null;

        // Calculează discount promo code
        // Calculează discount promo code
decimal discount = 0;
if (dto.PromoCode?.ToUpper() == "BOOK20") discount = 0.20m;

var subtotal = cartItems.Sum(c => c.Book.Price * c.Quantity);
var total = subtotal * (1 - discount);

        var order = new Order
        {
            UserId = userId,
            ShippingAddress = dto.ShippingAddress,
            PromoCode = dto.PromoCode,
            Discount = discount,
            TotalAmount = total,
            Status = "Pending",
            OrderItems = cartItems.Select(c => new OrderItem
            {
                BookId = c.BookId,
                Quantity = c.Quantity,
                UnitPrice = c.Book.Price
            }).ToList()
        };

        // Scade stocul
        foreach (var item in cartItems)
            item.Book.Stock -= item.Quantity;

        _context.Orders.Add(order);
        await _cartService.ClearCart(userId);
        await _context.SaveChangesAsync();

        return await GetOrderById(order.Id, userId);
    }

    public async Task<List<OrderDto>> GetUserOrders(int userId)
{
    return await _context.Orders
        .Include(o => o.User)
        .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
        .Where(o => o.UserId == userId)
        .OrderByDescending(o => o.CreatedAt)
        .Select(o => MapToDto(o))
        .ToListAsync();
}

    public async Task<OrderDto?> GetOrderById(int id, int userId)
{
    var order = await _context.Orders
        .Include(o => o.User)
        .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
        .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

    return order == null ? null : MapToDto(order);
}

  public async Task<List<OrderDto>> GetAllOrders()
{
    return await _context.Orders
        .Include(o => o.User)
        .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
        .OrderByDescending(o => o.CreatedAt)
        .Select(o => MapToDto(o))
        .ToListAsync();
}

    public async Task<OrderDto?> UpdateStatus(int id, string status)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        order.Status = status;
        await _context.SaveChangesAsync();

        return MapToDto(order);
    }

    private static OrderDto MapToDto(Order o) => new()
{
    Id = o.Id,
    Status = o.Status,
    TotalAmount = o.TotalAmount,
    Discount = o.Discount,
    ShippingAddress = o.ShippingAddress,
    PromoCode = o.PromoCode,
    CreatedAt = o.CreatedAt,
    UserEmail = o.User?.Email ?? "",
    UserFirstName = o.User?.FirstName ?? "",
    UserLastName = o.User?.LastName ?? "",
    Items = o.OrderItems.Select(oi => new OrderItemDto
    {
        BookId = oi.BookId,
        BookTitle = oi.Book.Title,
        CoverUrl = oi.Book.CoverUrl,
        Quantity = oi.Quantity,
        UnitPrice = oi.UnitPrice
    }).ToList()
};
}