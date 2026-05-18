from django.urls import path
from . import views


urlpatterns = [
    path("items/", views.VaultItemListView.as_view(), name="vault-item-list"),
    path("items/add_new_item/", views.VaultItemCreateView.as_view(), name="vault-add-new-item"),
    path("items/<uuid:pk>/", views.VaultItemDetailView.as_view(), name="vault-item-detail"),
    path("items/<uuid:pk>/history/", views.VaultItemHistoryView.as_view(), name="vault-item-history"),
    path("items/<uuid:pk>/favourite/", views.VaultItemFavouriteView.as_view(), name="vault-item-favourite"),
    
    path("items/<uuid:pk>/restore/", views.VaultItemRestoreView.as_view(), name="vault-item-restore"),
    path("items/restore_all/", views.VaultItemsRestoreAllView.as_view(), name="vault-items-restore-all"),
    
    path("items/<uuid:pk>/delete/", views.VaultItemHardDeleteView.as_view(), name="vault-item-hard-delete"),
    path("items/delete_all/", views.VaultItemsHardDeleteAllView.as_view(), name="vault-items-hard-delete-all"),
    
    path("items/analyse/", views.VaultItemAnalysisView.as_view(), name="vault-item-analysis"),
    
    path("folders/", views.VaultFolderListView.as_view(), name="vault-folder-list"),
    path("folders/add_new_folder/", views.VaultFolderCreateView.as_view(), name="vault-add-new-folder"),
    path("folders/<uuid:pk>/", views.VaultFolderDetailView.as_view(), name="vault-folder-detail"),
    path("folders/<uuid:pk>/items/", views.VaultFolderItemsView.as_view(), name="vault-folder-add-items"),
    path("folders/remove/", views.RemoveFromFolderView.as_view(), name="vault-folder-remove-items"),
]