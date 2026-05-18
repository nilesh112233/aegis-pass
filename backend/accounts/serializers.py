from rest_framework import serializers
from .models import *


class PreflightSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            self.user = None

        return value

    def get_response(self):
        if self.user:
            return {"kdf_iterations": self.user.kdf_iterations}
        return {"kdf_iterations": 600000}


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    auth_token = serializers.CharField(write_only=True)
    kdf_iterations = serializers.IntegerField(required=False)

    class Meta:
        model = User
        fields = ["email", "auth_token", "kdf_iterations"]
        extra_kwargs = {"kdf_iterations": {"required": False}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def validate_auth_token(self, value):
        if len(value) < 32:
            raise serializers.ValidationError("Invalid master password.")
        return value

    def create(self, validated_data):
        auth_token = validated_data.pop("auth_token")
        print(validated_data)
        user = User(**validated_data)
        user.set_password(auth_token)
        print(user.email)
        print(user.password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    auth_token = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        print(email)
        auth_token = attrs.get("auth_token")
        print(auth_token)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            print("this is the cause")
            raise serializers.ValidationError("Invalid credentials.")

        if not user.check_password(auth_token):
            print("something fishy here")
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")

        attrs["user"] = user
        return attrs


class DeleteAccountSerializer(serializers.Serializer):
    auth_token = serializers.CharField(write_only=True)
    
    def validate_auth_token(self, value): 
        if len(value) < 32:
            raise serializers.ValidationError("Invalid password.")
        return value
    
    
class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ["id", "device_hint", "ip_address", "created_at", "last_used_at"]
        read_only_fields = fields


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ["inactivity_timeout"]