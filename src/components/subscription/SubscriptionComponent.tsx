import React, { useState } from 'react';
import { Calendar, CreditCard, Check, X, AlertCircle, Crown, Star } from 'lucide-react';

export type SubscriptionPlan = {
  id: string;
  name: string;
  type: 'monthly' | 'yearly';
  price: number;
  features: string[];
  popular?: boolean;
  savings?: number;
};

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planType: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  price: number;
};

type SubscriptionComponentProps = {
  currentSubscription?: UserSubscription | null;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onCancelSubscription: () => void;
  onUpgradeSubscription: (plan: SubscriptionPlan) => void;
  onRenewSubscription: () => void;
};

const SubscriptionComponent: React.FC<SubscriptionComponentProps> = ({
  currentSubscription,
  onSelectPlan,
  onCancelSubscription,
  onUpgradeSubscription,
  onRenewSubscription
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'daily-monthly',
      name: 'Daily Delivery (Monthly)',
      type: 'monthly',
      price: 299,
      features: [
        'Daily fresh produce delivery',
        'Priority customer support',
        'Free delivery above ₹500',
        'Weekly menu planning',
        'Seasonal discounts'
      ],
      popular: true
    },
    {
      id: 'daily-yearly',
      name: 'Daily Delivery (Yearly)',
      type: 'yearly',
      price: 2999,
      features: [
        'Daily fresh produce delivery',
        'Priority customer support',
        'Free delivery always',
        'Weekly menu planning',
        'Seasonal discounts',
        'Exclusive member events',
        '2 months free'
      ],
      savings: 17
    }
  ];

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSelectPlan(plan);
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onCancelSubscription();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Check className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Premium Subscription</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get fresh produce delivered daily to your doorstep. Choose the plan that works best for you.
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-green-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Subscription</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Plan Type</span>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{currentSubscription.planName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Start Date</span>
                  <p className="text-lg font-semibold text-gray-900">{currentSubscription.startDate}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">End Date</span>
                  <p className="text-lg font-semibold text-gray-900">{currentSubscription.endDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
                    {getStatusIcon(currentSubscription.status)}
                    <span className="capitalize">{currentSubscription.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onUpgradeSubscription(plans.find(p => p.id !== currentSubscription.planId)!)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => onRenewSubscription()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                Renew
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-6 py-3 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'border-yellow-400' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-lg text-gray-500">/{plan.type === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {plan.savings && (
                  <p className="text-green-600 font-semibold mt-2">Save {plan.savings}% compared to monthly</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to daily deliveries and member benefits.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionComponent;
