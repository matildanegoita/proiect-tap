using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class BookSeeder
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;

    public BookSeeder(AppDbContext context, HttpClient httpClient)
    {
        _context = context;
        _httpClient = httpClient;
    }

    public async Task SeedAsync()
    {
        if (await _context.Books.AnyAsync()) return;

        var categories = new List<Category>
        {
            new() { Name = "Roman", Slug = "roman" },
            new() { Name = "Știință", Slug = "stiinta" },
            new() { Name = "Istorie", Slug = "istorie" },
            new() { Name = "Filozofie", Slug = "filozofie" },
            new() { Name = "Biografie", Slug = "biografie" },
            new() { Name = "Thriller", Slug = "thriller" },
            new() { Name = "Fantezie", Slug = "fantezie" },
            new() { Name = "Poezie", Slug = "poezie" }
        };

        if (!await _context.Categories.AnyAsync())
        {
            _context.Categories.AddRange(categories);
            await _context.SaveChangesAsync();
        }
        else
        {
            categories = await _context.Categories.ToListAsync();
        }

        var queries = new[]
        {
            ("fiction", "Roman"),
            ("science", "Știință"),
            ("history", "Istorie"),
            ("philosophy", "Filozofie"),
            ("biography", "Biografie"),
            ("thriller", "Thriller"),
            ("fantasy", "Fantezie"),
            ("poetry", "Poezie")
        };

        var books = new List<Book>();
        var random = new Random();

        foreach (var (query, categoryName) in queries)
        {
            var category = categories.First(c => c.Name == categoryName);

            try
            {
                var url = $"https://openlibrary.org/search.json?q={query}&limit=15&fields=key,title,author_name,isbn,first_publish_year,cover_i,subject";
                var response = await _httpClient.GetStringAsync(url);
                var json = JsonDocument.Parse(response);
                var docs = json.RootElement.GetProperty("docs");

                foreach (var doc in docs.EnumerateArray().Take(15))
                {
                    try
                    {
                        var title = doc.TryGetProperty("title", out var t) ? t.GetString() : null;
                        if (string.IsNullOrEmpty(title)) continue;

                        var author = "Unknown";
                        if (doc.TryGetProperty("author_name", out var authors) &&
                            authors.GetArrayLength() > 0)
                            author = authors[0].GetString() ?? "Unknown";

                        // Generează ISBN unic dacă nu există
                        var isbn = $"SEED-{query}-{Guid.NewGuid().ToString()[..8]}";
                        if (doc.TryGetProperty("isbn", out var isbns) &&
                            isbns.GetArrayLength() > 0)
                            isbn = isbns[0].GetString() ?? isbn;

                        var coverId = doc.TryGetProperty("cover_i", out var cover)
                            ? cover.GetInt64().ToString()
                            : null;

                        var coverUrl = coverId != null
                            ? $"https://covers.openlibrary.org/b/id/{coverId}-M.jpg"
                            : "https://placehold.co/200x300?text=No+Cover";

                        var description = doc.TryGetProperty("subject", out var subjects) &&
                                          subjects.GetArrayLength() > 0
                            ? string.Join(", ", subjects.EnumerateArray().Take(5).Select(s => s.GetString()))
                            : $"O carte din categoria {categoryName}.";

                        books.Add(new Book
                        {
                            Title = title.Length > 200 ? title[..200] : title,
                            Author = author.Length > 100 ? author[..100] : author,
                            ISBN = isbn.Length > 50 ? isbn[..50] : isbn,
                            Description = description?.Length > 500 ? description[..500] : description ?? "",
                            Price = Math.Round((decimal)(random.NextDouble() * 80 + 20), 2),
                            Stock = random.Next(5, 50),
                            CoverUrl = coverUrl,
                            AvgRating = Math.Round(random.NextDouble() * 2 + 3, 1),
                            ReviewCount = random.Next(0, 200),
                            CategoryId = category.Id,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                    catch { continue; }
                }

                await Task.Delay(500);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Eroare la fetch {query}: {ex.Message}");
            }
        }

        if (books.Count > 0)
        {
            // Deduplicare după ISBN
            var uniqueBooks = books
                .GroupBy(b => b.ISBN)
                .Select(g => g.First())
                .ToList();

            // Verifică ce ISBN-uri există deja în DB
            var existingIsbns = await _context.Books
                .Select(b => b.ISBN)
                .ToListAsync();

            var newBooks = uniqueBooks
                .Where(b => !existingIsbns.Contains(b.ISBN))
                .ToList();

            if (newBooks.Count > 0)
            {
                _context.Books.AddRange(newBooks);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Seed complet: {newBooks.Count} cărți adăugate din Open Library!");
            }
        }
    }
}