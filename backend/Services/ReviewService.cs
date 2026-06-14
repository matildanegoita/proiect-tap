using backend.Data;
using backend.DTOs.Reviews;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IReviewService
{
    Task<List<ReviewDto>> GetBookReviews(int bookId);
    Task<ReviewDto?> AddReview(int userId, CreateReviewDto dto);
    Task<bool> HasUserReviewed(int userId, int bookId);
    Task<bool> HasUserPurchased(int userId, int bookId);
}

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;

    public ReviewService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewDto>> GetBookReviews(int bookId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.BookId == bookId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                UserFirstName = r.User.FirstName,
                UserLastName = r.User.LastName
            })
            .ToListAsync();
    }

    public async Task<ReviewDto?> AddReview(int userId, CreateReviewDto dto)
    {
        if (await HasUserReviewed(userId, dto.BookId)) return null;

        var review = new Review
        {
            UserId = userId,
            BookId = dto.BookId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Actualizează avg rating
        var reviews = await _context.Reviews.Where(r => r.BookId == dto.BookId).ToListAsync();
        var book = await _context.Books.FindAsync(dto.BookId);
        if (book != null)
        {
            book.AvgRating = Math.Round(reviews.Average(r => r.Rating), 1);
            book.ReviewCount = reviews.Count;
            await _context.SaveChangesAsync();
        }

        var user = await _context.Users.FindAsync(userId);
        return new ReviewDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            UserFirstName = user?.FirstName ?? "",
            UserLastName = user?.LastName ?? ""
        };
    }

    public async Task<bool> HasUserReviewed(int userId, int bookId) =>
        await _context.Reviews.AnyAsync(r => r.UserId == userId && r.BookId == bookId);

    public async Task<bool> HasUserPurchased(int userId, int bookId) =>
        await _context.OrderItems
            .Include(oi => oi.Order)
            .AnyAsync(oi => oi.BookId == bookId && oi.Order.UserId == userId);
}