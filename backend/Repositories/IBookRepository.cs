using backend.DTOs.Books;
using backend.Models;

namespace backend.Repositories;

public interface IBookRepository : IGenericRepository<Book>
{
    Task<PagedResultDto<Book>> GetFilteredBooksAsync(BookFilterDto filter);
    Task<Book?> GetBookWithCategoryAsync(int id);
}