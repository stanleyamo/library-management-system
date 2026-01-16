from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Transaction, Fine
from books.models import Book
from .serializers import (
    TransactionListSerializer, TransactionDetailSerializer,
    BorrowBookSerializer, RenewTransactionSerializer, ReturnBookSerializer,
    FineListSerializer, FineDetailSerializer, PayFineSerializer,
    WaiveFineSerializer, CreateFineSerializer
)


class IsLibrarian(permissions.BasePermission):
    """Permission class for librarian only access"""
    def has_permission(self, request, view):
        return (
                request.user and
                request.user.is_authenticated and
                hasattr(request.user, 'profile') and
                request.user.profile.role == 'librarian'
        )


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Transaction operations
    """
    serializer_class = TransactionListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter transactions based on user role
        Students see only their transactions
        Librarians see all transactions
        """
        user = self.request.user

        if user.profile.role == 'librarian':
            queryset = Transaction.objects.select_related(
                'user', 'book', 'approved_by'
            ).all()
        else:
            queryset = Transaction.objects.select_related(
                'book'
            ).filter(user=user)

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(borrow_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(borrow_date__lte=date_to)

        return queryset.order_by('-borrow_date')

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return TransactionDetailSerializer
        return TransactionListSerializer

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def borrow(self, request):
        """
        Borrow a book
        POST /api/transactions/borrow/
        """
        serializer = BorrowBookSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        book_id = serializer.validated_data['book_id']
        notes = serializer.validated_data.get('notes', '')

        # Get the book
        book = Book.objects.get(id=book_id)

        # Create transaction
        transaction = Transaction.objects.create(
            user=request.user,
            book=book,
            notes=notes
        )

        # Decrease available copies
        book.available_copies -= 1
        book.save()

        return Response({
            'transaction': TransactionDetailSerializer(transaction).data,
            'message': f'Book "{book.title}" borrowed successfully'
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def return_book(self, request, pk=None):
        """
        Return a borrowed book
        POST /api/transactions/{id}/return_book/
        """
        transaction = self.get_object()

        # Verify user owns this transaction or is librarian
        if transaction.user != request.user and request.user.profile.role != 'librarian':
            return Response({
                'error': 'You do not have permission to return this book'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if already returned
        if transaction.status == 'returned':
            return Response({
                'error': 'This book has already been returned'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Return the book
        if transaction.return_book():
            # Check if overdue and create fine
            if transaction.is_overdue and transaction.days_overdue > 0:
                fine_amount = Fine.calculate_fine(transaction.days_overdue)
                Fine.objects.create(
                    transaction=transaction,
                    user=transaction.user,
                    amount=fine_amount,
                    reason=f'Overdue by {transaction.days_overdue} days'
                )

                return Response({
                    'transaction': TransactionDetailSerializer(transaction).data,
                    'message': 'Book returned successfully',
                    'fine_created': True,
                    'fine_amount': fine_amount,
                    'days_overdue': transaction.days_overdue
                }, status=status.HTTP_200_OK)

            return Response({
                'transaction': TransactionDetailSerializer(transaction).data,
                'message': 'Book returned successfully',
                'fine_created': False
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Failed to return book'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def renew(self, request, pk=None):
        """
        Renew a borrowed book
        POST /api/transactions/{id}/renew/
        """
        transaction = self.get_object()

        # Verify user owns this transaction
        if transaction.user != request.user:
            return Response({
                'error': 'You do not have permission to renew this book'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = RenewTransactionSerializer(
            data=request.data,
            context={'transaction': transaction}
        )
        serializer.is_valid(raise_exception=True)

        days = serializer.validated_data['days']

        if transaction.renew(days=days):
            return Response({
                'transaction': TransactionDetailSerializer(transaction).data,
                'message': f'Book renewed for {days} more days',
                'new_due_date': transaction.due_date
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Failed to renew book'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_books(self, request):
        """
        Get currently borrowed books for the logged-in user
        GET /api/transactions/my_books/
        """
        transactions = Transaction.objects.select_related('book').filter(
            user=request.user,
            status='borrowed'
        ).order_by('due_date')

        serializer = TransactionListSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsLibrarian])
    def overdue(self, request):
        """
        Get all overdue transactions (librarian only)
        GET /api/transactions/overdue/
        """
        overdue_transactions = Transaction.objects.select_related(
            'user', 'book'
        ).filter(
            status__in=['borrowed', 'overdue'],
            due_date__lt=timezone.now().date()
        ).order_by('due_date')

        serializer = TransactionListSerializer(overdue_transactions, many=True)
        return Response(serializer.data)


class FineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Fine operations
    """
    serializer_class = FineListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter fines based on user role
        Students see only their fines
        Librarians see all fines
        """
        user = self.request.user

        if user.profile.role == 'librarian':
            queryset = Fine.objects.select_related(
                'user', 'transaction', 'waived_by'
            ).all()
        else:
            queryset = Fine.objects.select_related('transaction').filter(user=user)

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return FineDetailSerializer
        elif self.action == 'create':
            return CreateFineSerializer
        return FineListSerializer

    def create(self, request, *args, **kwargs):
        """Create a fine (librarian only)"""
        if request.user.profile.role != 'librarian':
            return Response({
                'error': 'Only librarians can create fines'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pay(self, request, pk=None):
        """
        Pay a fine
        POST /api/fines/{id}/pay/
        """
        fine = self.get_object()

        # Verify user owns this fine
        if fine.user != request.user:
            return Response({
                'error': 'You do not have permission to pay this fine'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = PayFineSerializer(data=request.data, context={'fine': fine})
        serializer.is_valid(raise_exception=True)

        payment_method = serializer.validated_data['payment_method']
        payment_reference = serializer.validated_data.get('payment_reference', '')

        if fine.mark_as_paid(payment_method=payment_method, payment_reference=payment_reference):
            return Response({
                'fine': FineDetailSerializer(fine).data,
                'message': 'Fine paid successfully'
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Failed to pay fine'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsLibrarian])
    def waive(self, request, pk=None):
        """
        Waive a fine (librarian only)
        POST /api/fines/{id}/waive/
        """
        fine = self.get_object()

        serializer = WaiveFineSerializer(
            data=request.data,
            context={'fine': fine, 'request': request}
        )
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data['reason']

        if fine.waive(waived_by=request.user, reason=reason):
            return Response({
                'fine': FineDetailSerializer(fine).data,
                'message': 'Fine waived successfully'
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Failed to waive fine'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_fines(self, request):
        """
        Get all fines for the logged-in user
        GET /api/fines/my_fines/
        """
        fines = Fine.objects.select_related('transaction').filter(
            user=request.user
        ).order_by('-created_at')

        serializer = FineListSerializer(fines, many=True)

        # Calculate totals
        total_pending = sum(f.amount for f in fines if f.status == 'pending')
        total_paid = sum(f.amount for f in fines if f.status == 'paid')

        return Response({
            'fines': serializer.data,
            'summary': {
                'total_pending': float(total_pending),
                'total_paid': float(total_paid),
                'total_fines': fines.count()
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[IsLibrarian])
    def pending(self, request):
        """
        Get all pending fines (librarian only)
        GET /api/fines/pending/
        """
        pending_fines = Fine.objects.select_related(
            'user', 'transaction'
        ).filter(status='pending').order_by('-created_at')

        serializer = FineListSerializer(pending_fines, many=True)
        total_pending = sum(f.amount for f in pending_fines)

        return Response({
            'fines': serializer.data,
            'total_pending': float(total_pending),
            'count': pending_fines.count()
        })