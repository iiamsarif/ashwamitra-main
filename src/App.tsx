import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import LandingPage from "@/pages/LandingPage";
import FarmerDashboard from "@/pages/farmer/FarmerDashboard";
import B2BDashboard from "@/pages/b2b/B2BDashboard";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AuthForm from "@/components/auth/AuthForm";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/landingPage/ProtectedRoutes";
import Contact from "./pages/landingPage/ContactNew";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentDetails from "./pages/b2b/PaymentDetails";
import BusinessRegistration from "./pages/b2b/BusinessRegistration";
import FarmerRegistration from "./pages/farmer/FarmerRegistration";
import AdminBusinessDetails from "./pages/admin/AdminBusinessDetails";
import AdminFarmerDetails from "./pages/admin/AdminFarmerDetails";
import B2BCartPage from "./pages/b2b/B2BCartPage";
import Orders from "./pages/b2b/components/Orders";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentCancel from "./pages/payment/PaymentCancel";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />
      {/* contact page */}
      <Route path="/contact" element={<Contact/>} />
      {/* Terms & Privacy pages */}
      <Route path="/terms" element={<TermsOfService/>} />
      <Route path="/privacy" element={<PrivacyPolicy/>} />

      {/* Auth Pages */}
      <Route
        path="/b2b"
        element={<AuthForm role="b2b" onBack={() => window.history.back()} />}
      />
      <Route
        path="/b2b/register"
        element={<BusinessRegistration />}
      />
      <Route
        path="/farmer"
        element={<AuthForm role="farmer" onBack={() => window.history.back()} />}
      />
      <Route
        path="/farmer/register"
        element={<FarmerRegistration />}
      />
      <Route
        path="/customer"
        element={<AuthForm role="customer" onBack={() => window.history.back()} />}
      />
      <Route
        path="/admin"
        element={<AuthForm role="admin" onBack={() => window.history.back()} />}
      />

      {/* Dashboards (Protected) */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute role="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/b2b/dashboard"
        element={
          <ProtectedRoute role="b2b">
            <B2BDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/:paymentId"
        element={
          <ProtectedRoute role="b2b">
            <PaymentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/b2b/cart"
        element={
          <ProtectedRoute role="b2b">
            <B2BCartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/b2b/orders"
        element={
          <ProtectedRoute role="b2b">
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/cancel"
        element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/business-details/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminBusinessDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmer-details/:id"
        element={
          <ProtectedRoute role="admin">
            <AdminFarmerDetails />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
