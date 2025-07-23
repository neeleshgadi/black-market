import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./components/common/NotificationSystem";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const AlienListPage = lazy(() => import("./pages/AlienListPage"));
const AlienDetailPage = lazy(() => import("./pages/AlienDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const TestLoginPage = lazy(() => import("./pages/TestLoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() =>
  import("./pages/OrderConfirmationPage")
);
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CartDebugPage = lazy(() => import("./pages/CartDebugPage"));
const FixedCartDebugPage = lazy(() => import("./pages/FixedCartDebugPage"));
const FixedCartPage = lazy(() => import("./pages/FixedCartPage"));
const TestCartPage = lazy(() => import("./pages/TestCartPage"));
const DirectDbCartTestPage = lazy(() => import("./pages/DirectDbCartTestPage"));
const ImageDebugPage = lazy(() => import("./pages/ImageDebugPage"));
const PaginationTestPage = lazy(() => import("./pages/PaginationTestPage"));

// Lazy load admin components
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AlienManagement = lazy(() =>
  import("./components/admin/AlienManagement")
);
const OrderManagement = lazy(() =>
  import("./components/admin/OrderManagement")
);
const UserManagement = lazy(() => import("./components/admin/UserManagement"));

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Router>
                  <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                    <Header />
                    <main className="flex-grow">
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/aliens" element={<AlienListPage />} />
                          <Route
                            path="/aliens/:id"
                            element={<AlienDetailPage />}
                          />
                          <Route path="/cart" element={<CartPage />} />
                          <Route
                            path="/cart-debug"
                            element={<CartDebugPage />}
                          />
                          <Route
                            path="/fixed-cart-debug"
                            element={<FixedCartDebugPage />}
                          />
                          <Route
                            path="/fixed-cart"
                            element={<FixedCartPage />}
                          />
                          <Route path="/test-cart" element={<TestCartPage />} />
                          <Route
                            path="/direct-db-cart"
                            element={<DirectDbCartTestPage />}
                          />
                          <Route
                            path="/image-debug"
                            element={<ImageDebugPage />}
                          />
                          <Route
                            path="/pagination-test"
                            element={<PaginationTestPage />}
                          />
                          <Route path="/login" element={<LoginPage />} />
                          <Route
                            path="/test-login"
                            element={<TestLoginPage />}
                          />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedRoute>
                                <CheckoutPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/order-confirmation/:orderId"
                            element={
                              <ProtectedRoute>
                                <OrderConfirmationPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/*"
                            element={
                              <AdminRoute>
                                <AdminLayout />
                              </AdminRoute>
                            }
                          >
                            <Route index element={<AdminDashboard />} />
                            <Route
                              path="aliens"
                              element={<AlienManagement />}
                            />
                            <Route
                              path="orders"
                              element={<OrderManagement />}
                            />
                            <Route path="users" element={<UserManagement />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                  </div>
                </Router>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
