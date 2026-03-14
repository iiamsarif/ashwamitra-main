import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Home, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment has been cancelled. No charges were made to your account.
            You can try again whenever you're ready.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">What happened?</h3>
            <p className="text-sm text-yellow-700">
              You either closed the payment window or clicked the "Cancel" button during checkout.
              Your order is still saved and you can complete the payment anytime.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(role === "b2b" ? "/b2b/dashboard?tab=orders" : "/customer/dashboard")}
              className="w-full flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Try Payment Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>Need help? Our support team is here to assist you.</p>
            <p>Email: support@aswamithra.com | Phone: +91 9876543210</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
