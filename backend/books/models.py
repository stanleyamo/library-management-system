from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Author(models.Model):
    name = models.CharField(max_length=200)
    biography = models.TextField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'authors'
        verbose_name = 'Author'
        verbose_name_plural = 'Authors'
        ordering = ['name']

    def __str__(self):
        return self.name


class Book(models.Model):
    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('fr', 'French'),
        ('es', 'Spanish'),
        ('de', 'German'),
        ('other', 'Other'),
    )

    # Basic Information
    title = models.CharField(max_length=300)
    isbn = models.CharField(max_length=13, unique=True)
    authors = models.ManyToManyField(Author, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')

    # Publication Details
    publisher = models.CharField(max_length=200)
    publication_year = models.IntegerField(
        validators=[MinValueValidator(1000), MaxValueValidator(9999)]
    )
    edition = models.CharField(max_length=50, blank=True)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='en')

    # Physical Details
    pages = models.IntegerField(null=True, blank=True)

    # Description
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)

    # Inventory
    total_copies = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    available_copies = models.IntegerField(default=1, validators=[MinValueValidator(0)])

    # Ratings
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Additional fields
    is_active = models.BooleanField(default=True)
    shelf_location = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'books'
        verbose_name = 'Book'
        verbose_name_plural = 'Books'
        ordering = ['-created_at', 'title']
        indexes = [
            models.Index(fields=['isbn']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        return f"{self.title} ({self.isbn})"

    @property
    def is_available(self):
        return self.available_copies > 0

    @property
    def author_names(self):
        return ", ".join([author.name for author in self.authors.all()])

    @property
    def borrowed_copies(self):
        return self.total_copies - self.available_copies

    def save(self, *args, **kwargs):
        # Ensure available copies doesn't exceed total copies
        if self.available_copies > self.total_copies:
            self.available_copies = self.total_copies
        super().save(*args, **kwargs)