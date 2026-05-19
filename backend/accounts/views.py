from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import *
from .models import UserPreferences, UserSession
from .utils import parse_device_hint


User = get_user_model()


class PreflightView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PreflightSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
            kdf_iterations = user.kdf_iterations
        except User.DoesNotExist:
            kdf_iterations = 600000

        return Response({"kdf_iterations": kdf_iterations})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        UserPreferences.objects.create(user=user)

        return Response(
            {"message": "Account created successfully."}, status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip() \
             or request.META.get("REMOTE_ADDR", "")

        UserSession.objects.create(
            user=user,
            refresh_token_jti=str(refresh["jti"]),
            device_hint=parse_device_hint(user_agent),
            ip_address=ip or None,
        )

        try:
            prefs = user.preferences
            inactivity_timeout = prefs.inactivity_timeout
        except UserPreferences.DoesNotExist:
            inactivity_timeout = 15

        response = Response({
            "access": access_token,
            "user": {
                "email": user.email,
                "kdf_iterations": user.kdf_iterations,
                "inactivity_timeout": inactivity_timeout,
                "created_at": user.created_at.isoformat(),
            },
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite="None" if not settings.DEBUG else "Strict",
            max_age=15 * 60,
        )

        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"message": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            # print(f"INCOMING TOKENS:")
            # print(f"ACCESSTOKEN = {access_token}")
            # print(f"REFRESHTOKEN = {str(refresh)}")

            refresh.blacklist()
            # print("above token has been blacklisted")

            user = User.objects.get(id=refresh["user_id"])
            new_refresh = RefreshToken.for_user(user)

            # print("THIS TOKENS ARE GOING OUT:")
            # print(f"ACCESSTOKEN = {str(new_refresh.access_token)}")
            # print(f"REFRESHTOKEN = {str(new_refresh)}")

        except TokenError as e:
            return Response({"message": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response(
                {"message": "User not found."}, status=status.HTTP_401_UNAUTHORIZED
            )

        response = Response(
            {"access": str(new_refresh.access_token)}, status=status.HTTP_200_OK
        )

        response.set_cookie(
            key="refresh_token",
            value=str(new_refresh),
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite="None" if not settings.DEBUG else "Strict",
            max_age=15 * 60,
        )

        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                jti = token.get("jti")
                token.blacklist()
                
                UserSession.objects.filter(
                    user=request.user,
                    refresh_token_jti=jti,
                ).update(is_active=False)
                
            except TokenError:
                pass

        response = Response(
            {"message": "Successfully logged out."}, status=status.HTTP_200_OK
        )

        response.delete_cookie(
            key="refresh_token",
            samesite="None" if not settings.DEBUG else "Strict",
        )

        return response


class DeleteAccountView(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        auth_token = serializer.validated_data["auth_token"]
        
        if not user.check_password(auth_token):
            return Response({ "message": "Incorrect master password. Account not deleted."}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass
            
        user.delete()
        
        response = Response({ "message": "Account permanently deleted."}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key="refresh_token",
            samesite="None" if not settings.DEBUG else "Strict",
        )
        # response.delete_cookie("refresh_token", sameSite="Strict")
        return response
    

class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects.filter(
            user=request.user,
            is_active=True,
        )
        serializer = UserSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class RevokeSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        try:
            session = UserSession.objects.get(
                id=session_id,
                user=request.user,
                is_active=True
            )
        except UserSession.DoesNotExist:
            return Response({"message": "Session not found."}, status=404)

        from rest_framework_simplejwt.token_blacklist.models import (
            OutstandingToken, BlacklistedToken
        )
        try:
            token = OutstandingToken.objects.get(jti=session.refresh_token_jti)
            BlacklistedToken.objects.get_or_create(token=token)
        except OutstandingToken.DoesNotExist:
            pass

        session.is_active = False
        session.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        return Response({"inactivity_timeout": prefs.inactivity_timeout})

    def patch(self, request):
        prefs, _ = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(prefs, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)