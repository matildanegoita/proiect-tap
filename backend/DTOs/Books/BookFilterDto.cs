namespace backend.DTOs.Books;

public class BookFilterDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public string SortBy { get; set; } = "title"; // title, price, rating
    public string SortOrder { get; set; } = "asc"; // asc, desc
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}