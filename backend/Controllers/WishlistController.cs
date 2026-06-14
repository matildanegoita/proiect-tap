using System.Security.Claims;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetWishlist()
    {
        var items = await _wishlistService.GetWishlist(GetUserId());
        return Ok(items);
    }

    [HttpPost("{bookId}")]
    public async Task<IActionResult> Add(int bookId)
    {
        var result = await _wishlistService.AddToWishlist(GetUserId(), bookId);
        if (!result) return BadRequest(new { message = "Deja în wishlist!" });
        return Ok();
    }

    [HttpDelete("{bookId}")]
    public async Task<IActionResult> Remove(int bookId)
    {
        var result = await _wishlistService.RemoveFromWishlist(GetUserId(), bookId);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("check/{bookId}")]
    public async Task<IActionResult> Check(int bookId)
    {
        var result = await _wishlistService.IsInWishlist(GetUserId(), bookId);
        return Ok(new { inWishlist = result });
    }
}