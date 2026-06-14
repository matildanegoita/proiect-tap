using System.Security.Claims;
using backend.DTOs.Reviews;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("book/{bookId}")]
    public async Task<IActionResult> GetBookReviews(int bookId)
    {
        var reviews = await _reviewService.GetBookReviews(bookId);
        return Ok(reviews);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview(CreateReviewDto dto)
    {
        var hasPurchased = await _reviewService.HasUserPurchased(GetUserId(), dto.BookId);
        if (!hasPurchased)
            return BadRequest(new { message = "Poți recenza doar cărțile cumpărate!" });

        var review = await _reviewService.AddReview(GetUserId(), dto);
        if (review == null)
            return BadRequest(new { message = "Ai recenzat deja această carte!" });

        return Ok(review);
    }

    [HttpGet("can-review/{bookId}")]
    [Authorize]
    public async Task<IActionResult> CanReview(int bookId)
    {
        var hasPurchased = await _reviewService.HasUserPurchased(GetUserId(), bookId);
        var hasReviewed = await _reviewService.HasUserReviewed(GetUserId(), bookId);
        return Ok(new { canReview = hasPurchased && !hasReviewed });
    }
}