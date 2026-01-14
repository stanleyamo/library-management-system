from django.contrib import admin
from .models import Book, Category, Author


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin interface for Category"""
    list_display = ('name', 'book_count', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

    def book_count(self, obj):
        """Display number of books in this category"""
        return obj.books.count()
    book_count.short_description = 'Number of Books'


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    """Admin interface for Author"""
    list_display = ('name', 'nationality', 'birth_date', 'book_count', 'created_at')
    list_filter = ('nationality', 'created_at')
    search_fields = ('name', 'nationality', 'biography')
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'nationality', 'birth_date')
        }),
        ('Biography', {
            'fields': ('biography',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def book_count(self, obj):
        """Display number of books by this author"""
        return obj.books.count()
    book_count.short_description = 'Number of Books'


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    """Admin interface for Book"""
    list_display = ('title', 'isbn', 'display_authors', 'category',
                    'publication_year', 'available_copies', 'total_copies',
                    'is_available', 'rating', 'is_active')
    list_filter = ('category', 'language', 'is_active', 'publication_year', 'created_at')
    search_fields = ('title', 'isbn', 'publisher', 'authors__name')
    readonly_fields = ('created_at', 'updated_at', 'is_available',
                       'author_names', 'borrowed_copies')
    filter_horizontal = ('authors',)  # Better UI for many-to-many

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'isbn', 'authors', 'category')
        }),
        ('Publication Details', {
            'fields': ('publisher', 'publication_year', 'edition', 'language', 'pages')
        }),
        ('Content', {
            'fields': ('description', 'cover_image')
        }),
        ('Inventory', {
            'fields': ('total_copies', 'available_copies', 'borrowed_copies',
                       'is_available', 'shelf_location')
        }),
        ('Rating & Status', {
            'fields': ('rating', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'author_names'),
            'classes': ('collapse',)
        }),
    )

    def display_authors(self, obj):
        """Display comma-separated list of authors"""
        return obj.author_names
    display_authors.short_description = 'Authors'

    def is_available(self, obj):
        """Display availability with colored icon"""
        if obj.is_available:
            return '✅ Available'
        return '❌ Not Available'
    is_available.short_description = 'Availability'

    # Add actions
    actions = ['mark_as_active', 'mark_as_inactive', 'reset_availability']

    def mark_as_active(self, request, queryset):
        """Mark selected books as active"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} book(s) marked as active.')
    mark_as_active.short_description = 'Mark selected books as active'

    def mark_as_inactive(self, request, queryset):
        """Mark selected books as inactive"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} book(s) marked as inactive.')
    mark_as_inactive.short_description = 'Mark selected books as inactive'

    def reset_availability(self, request, queryset):
        """Reset available copies to total copies"""
        for book in queryset:
            book.available_copies = book.total_copies
            book.save()
        self.message_user(request, f'{queryset.count()} book(s) availability reset.')
    reset_availability.short_description = 'Reset availability to total copies'


# Customize admin site header and title
admin.site.site_header = "Library Management System"
admin.site.site_title = "Library Admin"
admin.site.index_title = "Welcome to Library Management System"