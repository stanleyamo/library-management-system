from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import Transaction, Fine


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction"""
    list_display = ('id', 'user', 'book', 'borrow_date', 'due_date',
                    'return_date', 'status_badge', 'days_info',
                    'renewal_count', 'can_renew')
    list_filter = ('status', 'borrow_date', 'due_date', 'renewal_count')
    search_fields = ('user__username', 'user__email', 'book__title',
                     'book__isbn', 'notes')
    readonly_fields = ('borrow_date', 'created_at', 'updated_at',
                       'is_overdue', 'days_overdue', 'days_until_due', 'can_renew')
    date_hierarchy = 'borrow_date'

    fieldsets = (
        ('Transaction Information', {
            'fields': ('user', 'book', 'approved_by')
        }),
        ('Dates', {
            'fields': ('borrow_date', 'due_date', 'return_date',
                       'is_overdue', 'days_overdue', 'days_until_due')
        }),
        ('Status', {
            'fields': ('status', 'notes')
        }),
        ('Renewal', {
            'fields': ('renewal_count', 'max_renewals', 'can_renew')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            'borrowed': '#28a745',  # green
            'returned': '#6c757d',  # gray
            'overdue': '#dc3545',   # red
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'

    def days_info(self, obj):
        """Display days until due or days overdue"""
        if obj.status == 'returned':
            return '✅ Returned'
        elif obj.is_overdue:
            return format_html(
                '<span style="color: red; font-weight: bold;">⚠️ {} days overdue</span>',
                obj.days_overdue
            )
        else:
            days = obj.days_until_due
            if days is not None:
                if days <= 3:
                    return format_html(
                        '<span style="color: orange; font-weight: bold;">⏰ {} days left</span>',
                        days
                    )
                return f'📅 {days} days left'
        return 'N/A'
    days_info.short_description = 'Days Info'

    # Custom actions
    actions = ['mark_as_returned', 'mark_as_overdue', 'renew_transactions']

    def mark_as_returned(self, request, queryset):
        """Mark selected transactions as returned"""
        count = 0
        for transaction in queryset:
            if transaction.return_book():
                count += 1
        self.message_user(request, f'{count} transaction(s) marked as returned.')
    mark_as_returned.short_description = 'Mark selected as returned'

    def mark_as_overdue(self, request, queryset):
        """Mark selected transactions as overdue"""
        updated = queryset.filter(status='borrowed').update(status='overdue')
        self.message_user(request, f'{updated} transaction(s) marked as overdue.')
    mark_as_overdue.short_description = 'Mark selected as overdue'

    def renew_transactions(self, request, queryset):
        """Renew selected transactions"""
        count = 0
        for transaction in queryset:
            if transaction.renew():
                count += 1
        self.message_user(request, f'{count} transaction(s) renewed successfully.')
    renew_transactions.short_description = 'Renew selected transactions'


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    """Admin interface for Fine"""
    list_display = ('id', 'user', 'transaction', 'amount', 'reason',
                    'status_badge', 'paid_date', 'waived_by')
    list_filter = ('status', 'created_at', 'paid_date')
    search_fields = ('user__username', 'transaction__book__title',
                     'reason', 'payment_reference', 'notes')
    readonly_fields = ('created_at', 'updated_at', 'is_paid')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Fine Information', {
            'fields': ('transaction', 'user', 'amount', 'reason', 'status')
        }),
        ('Payment Details', {
            'fields': ('paid_date', 'payment_method', 'payment_reference', 'is_paid')
        }),
        ('Waiver Details', {
            'fields': ('waived_by', 'waived_reason')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            'pending': '#ffc107',  # yellow
            'paid': '#28a745',     # green
            'waived': '#17a2b8',   # blue
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'

    # Custom actions
    actions = ['mark_as_paid', 'waive_fines']

    def mark_as_paid(self, request, queryset):
        """Mark selected fines as paid"""
        count = 0
        for fine in queryset:
            if fine.mark_as_paid(payment_method='Admin Payment'):
                count += 1
        self.message_user(request, f'{count} fine(s) marked as paid.')
    mark_as_paid.short_description = 'Mark selected as paid'

    def waive_fines(self, request, queryset):
        """Waive selected fines"""
        count = 0
        for fine in queryset:
            if fine.waive(waived_by=request.user, reason='Waived by admin'):
                count += 1
        self.message_user(request, f'{count} fine(s) waived.')
    waive_fines.short_description = 'Waive selected fines'

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'transaction', 'waived_by')