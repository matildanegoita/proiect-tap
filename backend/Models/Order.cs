namespace backend.Models;

public class Order
{
    public int Id { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Delivered
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string? PromoCode { get; set; }
    public decimal Discount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<OrderItem> OrderItems { get; set; } = [];
}