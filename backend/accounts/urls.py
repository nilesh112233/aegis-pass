from django.urls import path
from . import views


urlpatterns = [
    path("preflight/",                   views.PreflightView.as_view(),         name="preflight"),
    path("register/",                    views.RegisterView.as_view(),          name="register"),
    path("login/",                       views.LoginView.as_view(),             name="login"),
    path("refresh/",                     views.RefreshView.as_view(),           name="refresh"),
    path("logout/",                      views.LogoutView.as_view(),            name="logout"),
    path("delete-account/",              views.DeleteAccountView.as_view(),     name="delete-account"),
    
    path("sessions/",                    views.SessionListView.as_view(),       name="sessions-list"),
    path("sessions/<uuid:session_id>/",  views.RevokeSessionView.as_view(),     name="revoke-session"),
    path("preferences/",                 views.UserPreferencesView.as_view(),   name="user-preferences"),
]
