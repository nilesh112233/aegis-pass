from rest_framework import serializers
from .models import VaultItem, VaultItemHistory, VaultFolder


# vault item list serializer
class VaultItemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultItem
        fields = [
            "id",
            "item_type",
            "encrypted_meta",
            "iv_meta",
            "is_favourite",
            "is_deleted",
            "folder",
            "deleted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
        

# vault item detail serializer
class VaultItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultItem
        fields = [
            "id",
            "item_type",
            "encrypted_meta",
            "iv_meta",
            "encrypted_data",
            "iv_data",
            "folder",
            "is_favourite",
            "display_order",
            "is_deleted",
            "deleted_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_deleted", "created_at", "updated_at"]


# vault item create serializer
class VaultItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultItem
        fields = [
            "item_type",
            "encrypted_meta",
            "iv_meta",
            "encrypted_data",
            "iv_data",
            "folder",
            "is_favourite",
        ]
        
    def create(self, validated_data):
        user = self.context["request"].user
        return VaultItem.objects.create(user=user, **validated_data)


# vault item update serializer
class VaultItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultItem
        fields = [
            "item_type",
            "encrypted_meta",
            "iv_meta",
            "encrypted_data",
            "iv_data",
            "display_order",
            "folder",
            "is_favourite",
        ]
        
    def update(self, instance: VaultItem, validated_data):
        skip_history = self.context.get("skip_history", False)

        if not skip_history:
            self._save_to_history(instance)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance
    
    def _save_to_history(self, instance: VaultItem):
        history_qs = instance.history.all()
        
        if history_qs.count() >= 10:
            oldest = history_qs.last()
            oldest.delete()
            
        VaultItemHistory.objects.create(
            vault_item=instance,
            encrypted_meta=instance.encrypted_meta,
            iv_meta=instance.iv_meta,
            encrypted_data=instance.encrypted_data,
            iv_data=instance.iv_data,
        )


# vault item history serializer 
class VaultItemHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultItemHistory
        fields = [
            "id",
            "encrypted_meta",
            "iv_meta",
            "encrypted_data",
            "iv_data",
            "created_at",
        ]
        read_only_fields = fields


# vault folder serializer
class VaultFolderSerializer(serializers.ModelSerializer):
    no_of_items = serializers.IntegerField(read_only=True)
    class Meta:
        model = VaultFolder
        fields = [
            "id",
            "encrypted_name",
            "iv_name",
            "created_at",
            "updated_at",
            "no_of_items",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "no_of_items"]
        

class VaultFolderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultFolder
        fields = [
            "encrypted_name",
            "iv_name",
        ]
        
    def create(self, validated_data):
        user = self.context["request"].user
        return VaultFolder.objects.create(user=user, **validated_data)