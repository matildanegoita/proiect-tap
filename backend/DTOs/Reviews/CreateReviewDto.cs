namespace backend.DTOs.Reviews;

public class CreateReviewDto
{
    public int BookId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}