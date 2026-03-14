import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId") || searchParams.get("order_id");
  const paymentId =
    searchParams.get("paymentId") ||
    searchParams.get("payment_id") ||
    searchParams.get("razorpay_payment_id");

  const handleViewOrders = () => {
    if (role === "b2b") {
      navigate("/b2b/dashboard?tab=orders");
      return;
    }
    if (role === "customer") {
      navigate("/customer/dashboard");
      return;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your order has been confirmed and will be processed shortly.
          </p>

          {(orderId || paymentId) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">Razorpay Payment Details</h3>
              <div className="space-y-1 text-sm">
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                )}
                {paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono">{paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleViewOrders}
              className="w-full flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              View My Orders
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

          <div className="mt-6 text-xs text-gray-500">
            <p>Your payment confirmation is available in your Orders section.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
