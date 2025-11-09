from django.contrib import admin
from server.models import User, House, DrinkType, Consumption

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active')

@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'get_members_count')
    search_fields = ('name',)
    filter_horizontal = ('members',)

    def get_members_count(self, obj):
        return obj.members.count()
    get_members_count.short_description = 'Members'

@admin.register(DrinkType)
class DrinkTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'house', 'price_per_unit', 'current_stock', 'low_stock_threshold')
    list_filter = ('house',)
    search_fields = ('name',)

@admin.register(Consumption)
class ConsumptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'drink_type', 'house', 'quantity', 'cost', 'timestamp')
    list_filter = ('house', 'drink_type', 'timestamp')
    search_fields = ('user__username', 'drink_type__name')
    date_hierarchy = 'timestamp'
