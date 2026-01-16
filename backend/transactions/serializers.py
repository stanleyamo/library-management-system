from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Transaction, Fine


class TransactionListSerializer(serializers.ModelSerializer):
    """Serializer for listing transactions"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    can_renew = serializers.BooleanField(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'user_full_name', 'book',
            'book_title', 'book_isbn', 'borrow_date', 'due_date',
            'return_date', 'status', 'is_overdue', 'days_overdue',
            'days_until_due', 'renewal_count', 'can_renew'
        ]

    def get_user_full_name(self, obj):
        """Get user's full name"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class TransactionDetailSerializer(serializers.ModelSerializer):
    """Serializer for transaction details"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    book_cover = serializers.ImageField(source='book.cover_image', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    can_renew = serializers.BooleanField(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'user_full_name', 'book',
            'book_title', 'book_isbn', 'book_cover', 'borrow_date',
            'due_date', 'return_date', 'status', 'notes', 'approved_by',
            'approved_by_name', 'renewal_count', 'max_renewals',
            'is_overdue', 'days_overdue', 'days_until_due', 'can_renew',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_user_full_name(self, obj):
        """Get user's full name"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class BorrowBookSerializer(serializers.Serializer):
    """Serializer for borrowing a book"""
    book_id = serializers.IntegerField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_book_id(self, value):
        """Validate book exists and is available"""
        from books.models import Book

        try:
            book = Book.objects.get(id=value)
        except Book.DoesNotExist:
            raise serializers.ValidationError("Book not found.")

        if not book.is_available:
            raise serializers.ValidationError("This book is not available for borrowing.")

        if not book.is_active:
            raise serializers.ValidationError("This book is not active in the system.")

        return value

    def validate(self, attrs):
        """Validate user can borrow more books"""
        user = self.context['request'].user

        # Check if user has reached their borrowing limit
        if not user.profile.can_borrow_more:
            raise serializers.ValidationError(
                f"You have reached your borrowing limit of {user.profile.max_books_allowed} books."
            )

        # Check if user has any overdue books
        overdue_transactions = Transaction.objects.filter(
            user=user,
            status='overdue'
        )
        if overdue_transactions.exists():
            raise serializers.ValidationError(
                "You have overdue books. Please return them before borrowing new ones."
            )

        # Check if user has unpaid fines
        unpaid_fines = Fine.objects.filter(
            user=user,
            status='pending'
        )
        if unpaid_fines.exists():
            total_unpaid = sum(fine.amount for fine in unpaid_fines)
            raise serializers.ValidationError(
                f"You have unpaid fines totaling ${total_unpaid}. Please pay them before borrowing."
            )

        return attrs


class RenewTransactionSerializer(serializers.Serializer):
    """Serializer for renewing a transaction"""
    days = serializers.IntegerField(default=14, min_value=1, max_value=30)

    def validate(self, attrs):
        """Validate transaction can be renewed"""
        transaction = self.context['transaction']

        if not transaction.can_renew:
            if transaction.renewal_count >= transaction.max_renewals:
                raise serializers.ValidationError(
                    f"This book has already been renewed {transaction.max_renewals} times."
                )
            if transaction.is_overdue:
                raise serializers.ValidationError("Overdue books cannot be renewed.")
            if transaction.status != 'borrowed':
                raise serializers.ValidationError("Only borrowed books can be renewed.")

        return attrs


class ReturnBookSerializer(serializers.Serializer):
    """Serializer for returning a book"""
    notes = serializers.CharField(required=False, allow_blank=True)


class FineListSerializer(serializers.ModelSerializer):
    """Serializer for listing fines"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='transaction.book.title', read_only=True)
    is_paid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Fine
        fields = [
            'id', 'user', 'user_name', 'user_full_name', 'transaction',
            'book_title', 'amount', 'reason', 'status', 'is_paid',
            'paid_date', 'created_at'
        ]

    def get_user_full_name(self, obj):
        """Get user's full name"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class FineDetailSerializer(serializers.ModelSerializer):
    """Serializer for fine details"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='transaction.book.title', read_only=True)
    waived_by_name = serializers.CharField(source='waived_by.username', read_only=True)
    is_paid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Fine
        fields = [
            'id', 'transaction', 'user', 'user_name', 'user_full_name',
            'book_title', 'amount', 'reason', 'status', 'paid_date',
            'payment_method', 'payment_reference', 'waived_by',
            'waived_by_name', 'waived_reason', 'notes', 'is_paid',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_user_full_name(self, obj):
        """Get user's full name"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class PayFineSerializer(serializers.Serializer):
    """Serializer for paying a fine"""
    payment_method = serializers.CharField(required=True, max_length=50)
    payment_reference = serializers.CharField(required=False, allow_blank=True, max_length=100)

    def validate(self, attrs):
        """Validate fine can be paid"""
        fine = self.context['fine']

        if fine.status != 'pending':
            raise serializers.ValidationError(
                f"This fine has already been {fine.status}."
            )

        return attrs


class WaiveFineSerializer(serializers.Serializer):
    """Serializer for waiving a fine (librarian only)"""
    reason = serializers.CharField(required=True)

    def validate(self, attrs):
        """Validate fine can be waived"""
        fine = self.context['fine']
        user = self.context['request'].user

        # Check if user is librarian
        if user.profile.role != 'librarian':
            raise serializers.ValidationError("Only librarians can waive fines.")

        if fine.status != 'pending':
            raise serializers.ValidationError(
                f"This fine has already been {fine.status}."
            )

        return attrs


class CreateFineSerializer(serializers.ModelSerializer):
    """Serializer for creating a fine (librarian only)"""
    class Meta:
        model = Fine
        fields = ['transaction', 'user', 'amount', 'reason', 'notes']

    def validate(self, attrs):
        """Validate fine creation"""
        user = self.context['request'].user

        # Check if user is librarian
        if user.profile.role != 'librarian':
            raise serializers.ValidationError("Only librarians can create fines.")

        # Check if transaction belongs to the user
        if attrs['transaction'].user != attrs['user']:
            raise serializers.ValidationError("Transaction does not belong to this user.")

        return attrs