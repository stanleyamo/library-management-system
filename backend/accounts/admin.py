from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    """Inline admin to show UserProfile within User admin"""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = ('role', 'student_id', 'phone_number', 'address', 'date_of_birth',
              'profile_picture', 'max_books_allowed', 'is_active')


class CustomUserAdmin(UserAdmin):
    """Extended User admin with UserProfile inline"""
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role',
                    'get_student_id', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'profile__role')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'profile__student_id')

    def get_role(self, obj):
        """Display user role"""
        return obj.profile.role if hasattr(obj, 'profile') else 'N/A'
    get_role.short_description = 'Role'

    def get_student_id(self, obj):
        """Display student ID"""
        return obj.profile.student_id if hasattr(obj, 'profile') else 'N/A'
    get_student_id.short_description = 'Student ID'

    def get_inline_instances(self, request, obj=None):
        """Only show inline when editing existing user"""
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile"""
    list_display = ('user', 'role', 'student_id', 'phone_number',
                    'current_borrowed_books', 'max_books_allowed', 'is_active')
    list_filter = ('role', 'is_active', 'created_at')
    search_fields = ('user__username', 'user__email', 'student_id', 'phone_number')
    readonly_fields = ('created_at', 'updated_at', 'current_borrowed_books',
                       'can_borrow_more')

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'role', 'student_id')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'address', 'date_of_birth', 'profile_picture')
        }),
        ('Library Settings', {
            'fields': ('max_books_allowed', 'is_active', 'current_borrowed_books',
                       'can_borrow_more')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def current_borrowed_books(self, obj):
        """Display count of borrowed books"""
        return obj.current_borrowed_books
    current_borrowed_books.short_description = 'Currently Borrowed'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)