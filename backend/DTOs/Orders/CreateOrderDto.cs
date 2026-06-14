namespace backend.DTOs.Orders;

public class CreateOrderDto
{
    public string ShippingAddress { get; set; } = string.Empty;
    public string? PromoCode { get; set; }
}