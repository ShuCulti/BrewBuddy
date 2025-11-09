from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, F
from django.contrib.auth import get_user_model
from .models import House, DrinkType, Consumption
from .serializers import (
    HouseSerializer, DrinkTypeSerializer, ConsumptionSerializer,
    UserSerializer, UserRegistrationSerializer, UserDebtSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search users by username"""
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response([])

        users = User.objects.filter(username__icontains=query)[:10]
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

class HouseViewSet(viewsets.ModelViewSet):
    serializer_class = HouseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return House.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        house = serializer.save()
        house.members.add(self.request.user)
    
    @action(detail=True, methods=['get'])
    def shopping_list(self, request, pk=None):
        house = self.get_object()
        low_stock_items = DrinkType.objects.filter(
            house=house,
            current_stock__lte=F('low_stock_threshold')
        )
        serializer = DrinkTypeSerializer(low_stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def member_debts(self, request, pk=None):
        house = self.get_object()
        debts = []
        
        for member in house.members.all():
            consumptions = Consumption.objects.filter(
                house=house,
                user=member
            )
            
            total = consumptions.aggregate(total=Sum('cost'))['total'] or 0
            
            # Breakdown by drink type
            breakdown = consumptions.values(
                'drink_type__name'
            ).annotate(
                quantity=Sum('quantity'),
                total_cost=Sum('cost')
            )
            
            debts.append({
                'user_id': member.id,
                'user_name': member.username,
                'total_owed': total,
                'drink_breakdown': list(breakdown)
            })
        
        serializer = UserDebtSerializer(debts, many=True)
        return Response(serializer.data)

class DrinkTypeViewSet(viewsets.ModelViewSet):
    serializer_class = DrinkTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DrinkType.objects.filter(
            house__members=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        drink = self.get_object()
        quantity = request.data.get('quantity', 0)
        
        if quantity <= 0:
            return Response(
                {'error': 'Quantity must be positive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        drink.current_stock += quantity
        drink.save()
        
        serializer = self.get_serializer(drink)
        return Response(serializer.data)

class ConsumptionViewSet(viewsets.ModelViewSet):
    serializer_class = ConsumptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Consumption.objects.filter(
            house__members=self.request.user
        )
    
    def perform_create(self, serializer):
        # Set user to current user
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent consumptions for current user's houses"""
        consumptions = self.get_queryset()[:50]
        serializer = self.get_serializer(consumptions, many=True)
        return Response(serializer.data)
