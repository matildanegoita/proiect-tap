namespace backend.DTOs.Orders;

public class OrderItemDto
{
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public string CoverUrl { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal => UnitPrice * Quantity;
}