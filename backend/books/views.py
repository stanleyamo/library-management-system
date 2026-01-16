from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Book, Category, Author
from .serializers import (
    BookListSerializer, BookDetailSerializer, BookCreateUpdateSerializer,
    CategorySerializer, AuthorSerializer
)


class IsLibrarianOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow librarians to edit.
    """
    def has_permission(self, request, view):
        # Read permissions for anyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for authenticated librarians
        return (
                request.user and
                request.user.is_authenticated and
                hasattr(request.user, 'profile') and
                request.user.profile.role == 'librarian'
        )


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsLibrarianOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AuthorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Author CRUD operations
    """
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsLibrarianOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'nationality', 'biography']
    ordering_fields = ['name', 'birth_date', 'created_at']
    ordering = ['name']


class BookViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Book CRUD operations
    """
    queryset = Book.objects.select_related('category').prefetch_related('authors').filter(is_active=True)
    permission_classes = [IsLibrarianOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'isbn', 'authors__name', 'publisher', 'description']
    ordering_fields = ['title', 'publication_year', 'rating', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return BookListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BookCreateUpdateSerializer
        return BookDetailSerializer

    def get_queryset(self):
        """
        Filter queryset based on query parameters
        """
        queryset = super().get_queryset()

        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter by author
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(authors__id=author_id)

        # Filter by language
        language = self.request.query_params.get('language', None)
        if language:
            queryset = queryset.filter(language=language)

        # Filter by availability
        available_only = self.request.query_params.get('available_only', None)
        if available_only and available_only.lower() == 'true':
            queryset = queryset.filter(available_copies__gt=0)

        # Filter by minimum rating
        min_rating = self.request.query_params.get('min_rating', None)
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))

        # Filter by publication year range
        year_from = self.request.query_params.get('year_from', None)
        year_to = self.request.query_params.get('year_to', None)
        if year_from:
            queryset = queryset.filter(publication_year__gte=int(year_from))
        if year_to:
            queryset = queryset.filter(publication_year__lte=int(year_to))

        return queryset

    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        Get only available books
        GET /api/books/available/
        """
        available_books = self.get_queryset().filter(available_copies__gt=0)
        page = self.paginate_queryset(available_books)

        if page is not None:
            serializer = BookListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BookListSerializer(available_books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recently added books
        GET /api/books/recent/
        """
        recent_books = self.get_queryset().order_by('-created_at')[:10]
        serializer = BookListSerializer(recent_books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular books (highest rated)
        GET /api/books/popular/
        """
        popular_books = self.get_queryset().filter(
            rating__isnull=False
        ).order_by('-rating')[:10]
        serializer = BookListSerializer(popular_books, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def check_availability(self, request, pk=None):
        """
        Check if a specific book is available
        GET /api/books/{id}/check_availability/
        """
        book = self.get_object()
        return Response({
            'book_id': book.id,
            'title': book.title,
            'is_available': book.is_available,
            'available_copies': book.available_copies,
            'total_copies': book.total_copies
        })