from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE, related_name='transactions')

    # Transaction Details
    borrow_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')

    # Additional Information
    notes = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_transactions'
    )

    # Renewal
    renewal_count = models.IntegerField(default=0)
    max_renewals = models.IntegerField(default=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-borrow_date']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['book', 'status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"

    @property
    def is_overdue(self):
        if self.status == 'borrowed' and self.due_date:
            return timezone.now().date() > self.due_date
        return False

    @property
    def days_overdue(self):
        if self.is_overdue:
            return (timezone.now().date() - self.due_date).days
        return 0

    @property
    def days_until_due(self):
        if self.status == 'borrowed' and self.due_date:
            delta = self.due_date - timezone.now().date()
            return delta.days
        return None

    @property
    def can_renew(self):
        return (
                self.status == 'borrowed' and
                self.renewal_count < self.max_renewals and
                not self.is_overdue
        )

    def save(self, *args, **kwargs):
        # Set default due date if not provided (14 days from borrow date)
        if not self.due_date:
            self.due_date = (timezone.now() + timedelta(days=14)).date()

        # Update status to overdue if necessary
        if self.status == 'borrowed' and self.is_overdue:
            self.status = 'overdue'

        super().save(*args, **kwargs)

    def return_book(self):
        """Mark the book as returned"""
        if self.status in ['borrowed', 'overdue']:
            self.status = 'returned'
            self.return_date = timezone.now()

            # Increase available copies
            self.book.available_copies += 1
            self.book.save()

            self.save()
            return True
        return False

    def renew(self, days=14):
        """Renew the book for additional days"""
        if self.can_renew:
            self.due_date = self.due_date + timedelta(days=days)
            self.renewal_count += 1
            self.save()
            return True
        return False


class Fine(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('waived', 'Waived'),
    )

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='fines'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fines')

    # Fine Details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Payment Details
    paid_date = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    # Additional Information
    notes = models.TextField(blank=True)
    waived_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='waived_fines'
    )
    waived_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fines'
        verbose_name = 'Fine'
        verbose_name_plural = 'Fines'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.username} - ${self.amount} ({self.status})"

    @property
    def is_paid(self):
        return self.status == 'paid'

    def mark_as_paid(self, payment_method='', payment_reference=''):
        """Mark the fine as paid"""
        if self.status == 'pending':
            self.status = 'paid'
            self.paid_date = timezone.now()
            self.payment_method = payment_method
            self.payment_reference = payment_reference
            self.save()
            return True
        return False

    def waive(self, waived_by, reason=''):
        """Waive the fine"""
        if self.status == 'pending':
            self.status = 'waived'
            self.waived_by = waived_by
            self.waived_reason = reason
            self.save()
            return True
        return False

    @staticmethod
    def calculate_fine(days_overdue, rate_per_day=1.0):
        """Calculate fine based on days overdue"""
        return days_overdue * rate_per_day