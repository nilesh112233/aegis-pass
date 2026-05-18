import { Routes, Route, Navigate, useLocation, type Location } from "react-router-dom";
import ProtectedRoute from "@/components/protected-route";
import LoginPage from "@/pages/login-page";
import VaultPage from "@/pages/vault-page";
import SignupPage from "@/pages/signup-page";
import Layout from "@/layout/layout";
import PublicOnlyRoute from "@/components/public-only-route";
import { ItemFormBasePage } from "@/pages/item-form-base-page";
import VaultLoginsItemPage from "@/pages/vault-logins-item-page";
import VaultSecureNotesItemPage from "@/pages/vault-secure-note-item-page";
import VaultFavouritesItemPage from "@/pages/vault-favourites-item-page";
import VaultTrashItemPage from "@/pages/vault-trash-item-page";
import GeneratorPage from "@/pages/generator-page";
import CheckerPage from "@/pages/checker-page";
import AccountPage from "@/pages/account-page";
import AppearancePage from "@/pages/appearance-page";
import SecurityPage from "@/pages/security-page";
import VaultFoldersPage from "@/pages/folders-page";
import AddFolderPage from "@/pages/AddFolderPage";
import FolderDetailPage from "@/pages/folder-detail-page";
import AddRemoveFolderItemPage from "@/pages/add-remove-folder-items";


const AppRoutes = () => {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location}

    return (
        <>
            <Routes location={state?.backgroundLocation || location}>
                <Route 
                    path="/signup" 
                    element={ 
                        <PublicOnlyRoute>
                            <SignupPage /> 
                        </PublicOnlyRoute>
                    } 
                />
                <Route 
                    path="/login" 
                    element={ 
                        <PublicOnlyRoute>
                            <LoginPage /> 
                        </PublicOnlyRoute>
                    } 
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="vault"                 element={ <VaultPage /> } />
                    <Route path="vault/logins"          element={ <VaultLoginsItemPage /> } />
                    <Route path="vault/secure-notes"    element={ <VaultSecureNotesItemPage /> } />
                    <Route path="vault/favourits"       element={ <VaultFavouritesItemPage /> } />
                    <Route path="vault/trash"           element={ <VaultTrashItemPage /> } />
                    <Route path="vault/folders"         element={ <VaultFoldersPage /> } />
                    
                    <Route path="settings"              element={ <VaultPage /> } />
                    <Route path="settings/account"      element={ <AccountPage /> } />
                    <Route path="settings/appearance"   element={ <AppearancePage /> } />
                    <Route path="settings/security"     element={ <SecurityPage /> } />

                    
                    <Route path="/tools/generator"          element={ <GeneratorPage /> } />
                    <Route path="/tools/strength-checker"   element={ <CheckerPage /> } />

                    <Route path="/vault/folder/:id"       element={<FolderDetailPage />} />
                    <Route path="vault/folder/:id/add"  element={<AddRemoveFolderItemPage />} />
                    <Route path="vault/folder/:id/remove"  element={<AddRemoveFolderItemPage />} />

                    
                </Route>

                {/* <Route path="/" element={ <Navigate to="/vault" replace /> } /> */}
                {/* <Route path="*" element={ <Navigate to="/vault" replace /> } /> */}
            </Routes>

            {state?.backgroundLocation && (
                <Routes>
                    <Route path="vault/item/new/:type"   element={<ItemFormBasePage />} />
                    <Route path="vault/item/:id/edit"    element={<ItemFormBasePage />} />
                    <Route path="vault/item/:id/history" element={<ItemFormBasePage />} />
                    <Route path="vault/item/:id"         element={<ItemFormBasePage />} />

                    <Route path="vault/new/folder"       element={<AddFolderPage />} />
                    <Route path="vault/folder/:id/edit"  element={<AddFolderPage />} />
                    <Route path="vault/folder/:id/add"  element={<AddRemoveFolderItemPage />} />
                    <Route path="vault/folder/:id/remove"  element={<AddRemoveFolderItemPage />} />

                </Routes>
            )}
        </>
    )
};

export default AppRoutes;