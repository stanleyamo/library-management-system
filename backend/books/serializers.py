from rest_framework import serializers
from .models import Book, Category, Author


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'book_count', 'created_at']
        read_only_fields = ['created_at']

    def get_book_count(self, obj):
        """Get number of books in this category"""
        return obj.books.count()


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer for Author model"""
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = [
            'id', 'name', 'biography', 'birth_date',
            'nationality', 'book_count', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_book_count(self, obj):
        """Get number of books by this author"""
        return obj.books.count()


class AuthorSimpleSerializer(serializers.ModelSerializer):
    """Simple serializer for Author (for nested representation)"""
    class Meta:
        model = Author
        fields = ['id', 'name']


class BookListSerializer(serializers.ModelSerializer):
    """Serializer for listing books (lightweight)"""
    authors = AuthorSimpleSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'authors', 'category_name',
            'publisher', 'publication_year', 'cover_image',
            'total_copies', 'available_copies', 'is_available',
            'rating', 'language'
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    """Serializer for book details (complete information)"""
    authors = AuthorSimpleSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    author_names = serializers.CharField(read_only=True)
    borrowed_copies = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'isbn', 'title', 'authors', 'author_names', 'category',
            'category_name', 'publisher', 'publication_year', 'edition',
            'language', 'pages', 'description', 'cover_image',
            'total_copies', 'available_copies', 'borrowed_copies',
            'is_available', 'rating', 'shelf_location', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class BookCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating books"""
    author_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True
    )

    class Meta:
        model = Book
        fields = [
            'isbn', 'title', 'author_ids', 'category',
            'publisher', 'publication_year', 'edition', 'language',
            'pages', 'description', 'cover_image', 'total_copies',
            'available_copies', 'rating', 'shelf_location', 'is_active'
        ]

    def validate_isbn(self, value):
        """Validate ISBN format and uniqueness"""
        # Check length
        if len(value) != 13:
            raise serializers.ValidationError("ISBN must be exactly 13 characters.")

        # Check if only digits
        if not value.isdigit():
            raise serializers.ValidationError("ISBN must contain only digits.")

        # Check uniqueness (exclude current instance if updating)
        instance_id = self.instance.id if self.instance else None
        if Book.objects.filter(isbn=value).exclude(id=instance_id).exists():
            raise serializers.ValidationError("A book with this ISBN already exists.")

        return value

    def validate_author_ids(self, value):
        """Validate that all author IDs exist"""
        if not value:
            raise serializers.ValidationError("At least one author is required.")

        existing_authors = Author.objects.filter(id__in=value)
        if existing_authors.count() != len(value):
            raise serializers.ValidationError("One or more author IDs are invalid.")

        return value

    def validate(self, attrs):
        """Validate available_copies <= total_copies"""
        total = attrs.get('total_copies', self.instance.total_copies if self.instance else 0)
        available = attrs.get('available_copies', self.instance.available_copies if self.instance else 0)

        if available > total:
            raise serializers.ValidationError({
                "available_copies": "Available copies cannot exceed total copies."
            })

        return attrs

    def create(self, validated_data):
        """Create book with authors"""
        author_ids = validated_data.pop('author_ids')
        book = Book.objects.create(**validated_data)
        book.authors.set(author_ids)
        return book

    def update(self, instance, validated_data):
        """Update book with authors"""
        author_ids = validated_data.pop('author_ids', None)

        # Update book fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update authors if provided
        if author_ids is not None:
            instance.authors.set(author_ids)

        return instance

    def to_representation(self, instance):
        """Use detailed serializer for response"""
        return BookDetailSerializer(instance, context=self.context).data


class BookSearchSerializer(serializers.Serializer):
    """Serializer for book search parameters"""
    search = serializers.CharField(required=False, allow_blank=True)
    category = serializers.IntegerField(required=False)
    author = serializers.IntegerField(required=False)
    language = serializers.ChoiceField(
        choices=Book.LANGUAGE_CHOICES,
        required=False
    )
    available_only = serializers.BooleanField(required=False, default=False)
    min_rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        required=False,
        min_value=0.0,
        max_value=5.0
    )
    year_from = serializers.IntegerField(required=False, min_value=1000)
    year_to = serializers.IntegerField(required=False, max_value=9999)