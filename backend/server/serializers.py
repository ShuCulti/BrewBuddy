from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import House, DrinkType, Consumption

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class DrinkTypeSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = DrinkType
        fields = ['id', 'name', 'price_per_unit', 'low_stock_threshold', 
                  'current_stock', 'is_low_stock', 'house']
        read_only_fields = ['id']
    
    def get_is_low_stock(self, obj):
        return obj.current_stock <= obj.low_stock_threshold

class ConsumptionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    drink_name = serializers.CharField(source='drink_type.name', read_only=True)
    
    class Meta:
        model = Consumption
        fields = ['id', 'user', 'user_name', 'drink_type', 'drink_name', 
                  'house', 'quantity', 'timestamp', 'cost']
        read_only_fields = ['id', 'timestamp', 'cost']

class HouseSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=User.objects.all(),
        source='members'
    )
    drink_types = DrinkTypeSerializer(many=True, read_only=True)
    
    class Meta:
        model = House
        fields = ['id', 'name', 'created_at', 'members', 'member_ids', 'drink_types']
        read_only_fields = ['id', 'created_at']
    
    def validate_member_ids(self, value):
        if len(value) > 4:
            raise serializers.ValidationError("A house can have maximum 4 members")
        return value

class UserDebtSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    total_owed = serializers.DecimalField(max_digits=10, decimal_places=2)
    drink_breakdown = serializers.ListField()