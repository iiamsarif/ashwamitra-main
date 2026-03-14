import React, { useState, useEffect } from "react";
import { Wallet, Check, AlertCircle, Info, Loader2 } from "lucide-react";
import { useMyWallet } from "@/hooks/useApi";

interface WalletCheckoutIntegrationProps {
  orderTotal: number;
  onWalletAmountChange: (walletAmount: number) => void;
  onUseWalletChange: (useWallet: boolean) => void;
}

const WalletCheckoutIntegration: React.FC<WalletCheckoutIntegrationProps> = ({
  orderTotal,
  onWalletAmountChange,
  onUseWalletChange
}) => {
  const { data: walletData, isLoading } = useMyWallet();
  const [useWallet, setUseWallet] = useState(false);

  const walletBalance = walletData?.balance || 0;
  const maxUsableAmount = Math.min(walletBalance, orderTotal);

  useEffect(() => {
    if (walletBalance <= 0) {
      setUseWallet(false);
      onUseWalletChange(false);
      onWalletAmountChange(0);
    }
  }, [walletBalance, onUseWalletChange, onWalletAmountChange]);

  const handleWalletToggle = (checked: boolean) => {
    setUseWallet(checked);
    onUseWalletChange(checked);
    onWalletAmountChange(checked ? maxUsableAmount : 0);
  };

  const remainingAmount = useWallet ? orderTotal - maxUsableAmount : orderTotal;
  const isFullyPaid = useWallet && maxUsableAmount >= orderTotal;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
          <span className="text-sm text-gray-500">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (walletBalance <= 0) return null;

  return (
    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
      <div className="flex items-center gap-2 mb-3">
        <Wallet className="w-4 h-4 text-green-600" />
        <h4 className="text-sm font-semibold text-green-900">Use Wallet Balance</h4>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-700">Available Balance:</span>
          <span className="font-bold text-green-900">{formatAmount(walletBalance)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-green-700">Usable for this order:</span>
          <span className="font-bold text-green-900">{formatAmount(maxUsableAmount)}</span>
        </div>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          id="use-wallet"
          checked={useWallet}
          onChange={(e) => handleWalletToggle(e.target.checked)}
          className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="use-wallet" className="flex-1 cursor-pointer">
          <span className="text-sm text-green-800">
            Use {formatAmount(maxUsableAmount)} from wallet
          </span>
          {maxUsableAmount < orderTotal && (
            <span className="text-xs text-green-600 block mt-1">
              Partial payment — remaining {formatAmount(remainingAmount)} via other method
            </span>
          )}
        </label>
      </div>

      {useWallet && (
        <div className="bg-white rounded-lg p-3 border border-green-300">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Total:</span>
              <span className="font-medium">{formatAmount(orderTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet Deduction:</span>
              <span className="font-medium text-green-600">-{formatAmount(maxUsableAmount)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Remaining:</span>
              <span className={isFullyPaid ? "text-green-600" : "text-orange-600"}>
                {isFullyPaid ? "PAID" : formatAmount(remainingAmount)}
              </span>
            </div>
          </div>

          {isFullyPaid ? (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-100 rounded-lg">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">Fully paid with wallet!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3 p-2 bg-orange-100 rounded-lg">
              <Info className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-700">
                {formatAmount(remainingAmount)} via selected payment method
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-start gap-2">
        <AlertCircle className="w-3 h-3 text-green-600 mt-0.5" />
        <p className="text-xs text-green-700">Wallet balance deducted after order confirmation.</p>
      </div>
    </div>
  );
};

export default WalletCheckoutIntegration;
