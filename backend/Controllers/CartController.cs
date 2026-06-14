using System.Security.Claims;
using backend.DTOs.Cart;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _cartService.GetCart(GetUserId());
        return Ok(cart);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        var item = await _cartService.AddToCart(GetUserId(), dto);
        if (item == null) return BadRequest(new { message = "Carte indisponibilă sau stoc insuficient!" });
        return Ok(item);
    }

    [HttpPut("{bookId}")]
    public async Task<IActionResult> UpdateQuantity(int bookId, [FromBody] int quantity)
    {
        var item = await _cartService.UpdateQuantity(GetUserId(), bookId, quantity);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("{bookId}")]
    public async Task<IActionResult> RemoveFromCart(int bookId)
    {
        var result = await _cartService.RemoveFromCart(GetUserId(), bookId);
        if (!result) return NotFound();
        return NoContent();
    }
}