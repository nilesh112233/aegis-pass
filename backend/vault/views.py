from django.utils import timezone
from django.shortcuts import render
from django.db.models import Count, Q

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import VaultItem
from .serializer import *

# Create your views here.

class VaultItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deleted_param = request.query_params.get("deleted")

        if deleted_param is not None:
            deleted = deleted_param.lower() == "true"
        else:
            deleted = False
        
        items = VaultItem.objects.filter(
            user=request.user,
            is_deleted=deleted,
        ).order_by("display_order", "-updated_at")
        
        serializer = VaultItemListSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class VaultItemDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return VaultItem.objects.get(pk=pk, user=user)
        except VaultItem.DoesNotExist:
            return None
        
    def get(self, request, pk):
        item = self.get_object(pk, request.user)
        
        if not item:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VaultItemDetailSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        item = self.get_object(pk, request.user)
        
        if not item:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if item.is_deleted:
            return Response({"message": "Cannot update a deleted item. Restore it first."}, status=status.HTTP_400_BAD_REQUEST)
   
        serializer = VaultItemUpdateSerializer(item, data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        updated_item = serializer.save()
        
        return Response(VaultItemDetailSerializer(updated_item).data)
    
    def patch(self, request, pk):
        item = self.get_object(pk, request.user)
        
        if not item:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if item.is_deleted:
            return Response({"message": "Cannot update a deleted item. Restore it first."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = VaultItemUpdateSerializer(
            item,
            data=request.data,
            partial=True,
            context={"skip_history": True}
        )

        serializer.is_valid(raise_exception=True)

        updated_item = serializer.save()

        return Response(
            VaultItemDetailSerializer(updated_item).data,
            status=status.HTTP_200_OK
        )     
    
    def delete(self, request, pk):
        item = self.get_object(pk, request.user)
        
        if not item:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if item.is_deleted:
            return Response({"message": "Item is already deleted"}, status=status.HTTP_400_BAD_REQUEST)
        
        item.is_deleted = True
        item.deleted_at = timezone.now()
        item.save(update_fields=["is_deleted", "deleted_at"])
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
class VaultItemCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    
    def post(self, request):
        # print(request.data)
        serializer = VaultItemCreateSerializer(data=request.data, context={"request": request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        item = serializer.save()
        return Response(VaultItemDetailSerializer(item).data, status=status.HTTP_201_CREATED)
    
    
class VaultItemHistoryView(APIView):
    permission_classes = [ IsAuthenticated]
    
    def get(self, request, pk):
        try:
            item = VaultItem.objects.get(pk=pk, user=request.user)
        except VaultItem.DoesNotExist:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        history = item.history.all()
        serializer = VaultItemHistorySerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class VaultItemFavouriteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            item = VaultItem.objects.get(pk=pk, user=request.user, is_deleted=False)
        except VaultItem.DoesNotExist:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        
        item.is_favourite = not item.is_favourite
        item.save(update_fields=["is_favourite"])
        
        return Response({"is_favourite": item.is_favourite}, status=status.HTTP_200_OK)
    
    
class VaultItemRestoreView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            item = VaultItem.objects.get(pk=pk, user=request.user, is_deleted=True)
        except VaultItem.DoesNotExist:
            return Response({"restored": 0}, status=status.HTTP_200_OK)
        
        item.is_deleted = False
        item.deleted_at = None
        item.save(update_fields=["is_deleted", "deleted_at"])
        
        return Response({"restored": 1}, status=status.HTTP_200_OK)
    
    
class VaultItemsRestoreAllView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        items = VaultItem.objects.filter(user=request.user, is_deleted=True)

        count = items.update(is_deleted=False, deleted_at=None)
        
        return Response({"restored": count}, status=status.HTTP_200_OK)
    
    
class VaultItemHardDeleteView(APIView):
    permission_classes = [IsAuthenticated]
        
    def delete(self, request, pk):
        try:
            item = VaultItem.objects.get(pk=pk, user=request.user, is_deleted=True)
        except VaultItem.DoesNotExist:
            return Response({"deleted": 0}, status=status.HTTP_200_OK)
        
        item.delete()
        
        return Response({"deleted": 1}, status=status.HTTP_200_OK)
    
    
class VaultItemsHardDeleteAllView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        items = VaultItem.objects.filter(user=request.user, is_deleted=True)

        count, _ =items.delete()
        
        return Response({"deleted": count}, status=status.HTTP_200_OK)
    
    
class VaultItemAnalysisView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        items = VaultItem.objects.filter(user=request.user, item_type="login", is_deleted=False)
        
        serializer = VaultItemDetailSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        
class VaultFolderListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        folders = VaultFolder.objects.filter(user=request.user).annotate(no_of_items=Count("items", filter=Q(items__is_deleted=False)))
        return Response(VaultFolderSerializer(folders, many=True).data)
    
    def post(self, request):
        serializer = VaultFolderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class VaultFolderCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = VaultFolderCreateSerializer(data=request.data, context={"request": request})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        folder = serializer.save()
        return Response(VaultFolderCreateSerializer(folder).data, status=status.HTTP_201_CREATED)
        
    
    
class VaultFolderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return VaultFolder.objects.get(pk=pk, user=user)
        except VaultFolder.DoesNotExist:
            return None
        
    def get(self, request, pk):
        folder = self.get_object(pk, request.user)

        items = VaultItem.objects.filter(
            folder=folder,
            user=request.user,
            is_deleted=False,
        ).order_by("-updated_at")

        serializer = VaultItemDetailSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    
    def put(self, request, pk):
        folder = self.get_object(pk, request.user)
        if not folder:
            return Response({"message": "Folder not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VaultFolderSerializer(folder, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(serializer.data)
    
    def patch(self, request, pk):
        folder = self.get_object(pk, request.user)
        if not folder:
            return Response({"message": "Folder not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VaultFolderCreateSerializer(
            folder,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        folder = self.get_object(pk, request.user)
        if not folder:
            return Response({"message": "Folder not found."}, status=status.HTTP_404_NOT_FOUND)
        
        folder.delete() 
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
class VaultFolderItemsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try: 
            folder = VaultFolder.objects.get(pk=pk, user=request.user)
        except VaultFolder.DoesNotExist:
            return Response({"message": "Folder not found."}, status=status.HTTP_404_NOT_FOUND)
        
        item_ids = request.data.get("item_ids", [])
        
        items = VaultItem.objects.filter(
            id__in=item_ids,
            user=request.user,
            is_deleted=False,
        )
        
        items.update(folder=folder)
        
        return Response({"moved": items.count()})
    
    
class RemoveFromFolderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        item_ids = request.data.get("item_ids", [])
        print(item_ids)
        VaultItem.objects.filter(
            id__in=item_ids,
            user=request.user,
        ).update(folder=None)
        return Response({"removed": len(item_ids)})