from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """Extended user model for housemates"""
    pass

class House(models.Model):
    """A shared house/group (max 4 members)"""
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, related_name='houses')
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']

class DrinkType(models.Model):
    """Types of drinks (Beer, Soda, etc.)"""
    name = models.CharField(max_length=50)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='drink_types')
    price_per_unit = models.DecimalField(max_digits=6, decimal_places=2)
    low_stock_threshold = models.IntegerField(default=6)
    current_stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.house.name}"
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'house']

class Consumption(models.Model):
    """Log of drink consumption"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consumptions')
    drink_type = models.ForeignKey(DrinkType, on_delete=models.CASCADE, related_name='consumptions')
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='consumptions')
    quantity = models.IntegerField(default=1)
    timestamp = models.DateTimeField(default=timezone.now)
    cost = models.DecimalField(max_digits=6, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Calculate cost based on drink price
        if not self.cost:
            self.cost = self.drink_type.price_per_unit * self.quantity
        
        # Update stock
        if not self.pk:  # Only on creation
            self.drink_type.current_stock -= self.quantity
            self.drink_type.save()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.drink_type.name} x{self.quantity}"
    
    class Meta:
        ordering = ['-timestamp']