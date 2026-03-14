// Wallet Types
export interface WalletTransaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  createdAt: string;
}

export interface WalletData {
  userId: string;
  walletBalance: number;
  transactions: WalletTransaction[];
}

// Wallet Utility Functions
export class WalletUtils {
  private static readonly WALLET_STORAGE_KEY = "user_wallets";

  // Get wallet data for a specific user
  static getWallet(userId: string): WalletData {
    const wallets = this.getAllWallets();
    return wallets[userId] || {
      userId,
      walletBalance: 0,
      transactions: []
    };
  }

  // Get all wallets from localStorage
  static getAllWallets(): Record<string, WalletData> {
    if (typeof window === "undefined") return {};
    
    try {
      const data = localStorage.getItem(this.WALLET_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error reading wallet data:", error);
      return {};
    }
  }

  // Save wallet data to localStorage
  static saveWallet(walletData: WalletData): void {
    if (typeof window === "undefined") return;
    
    try {
      const wallets = this.getAllWallets();
      wallets[walletData.userId] = walletData;
      localStorage.setItem(this.WALLET_STORAGE_KEY, JSON.stringify(wallets));
    } catch (error) {
      console.error("Error saving wallet data:", error);
    }
  }

  // Add money to wallet (credit transaction)
  static addMoney(userId: string, amount: number, description: string): boolean {
    if (amount <= 0) return false;
    
    const wallet = this.getWallet(userId);
    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: "credit",
      description,
      createdAt: new Date().toISOString()
    };

    wallet.walletBalance += amount;
    wallet.transactions.unshift(transaction); // Add to beginning
    this.saveWallet(wallet);
    
    return true;
  }

  // Deduct money from wallet (debit transaction)
  static deductMoney(userId: string, amount: number, description: string): boolean {
    if (amount <= 0) return false;
    
    const wallet = this.getWallet(userId);
    
    // Check if sufficient balance
    if (wallet.walletBalance < amount) return false;
    
    const transaction: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: "debit",
      description,
      createdAt: new Date().toISOString()
    };

    wallet.walletBalance -= amount;
    wallet.transactions.unshift(transaction); // Add to beginning
    this.saveWallet(wallet);
    
    return true;
  }

  // Check if user has sufficient balance
  static hasSufficientBalance(userId: string, amount: number): boolean {
    const wallet = this.getWallet(userId);
    return wallet.walletBalance >= amount;
  }

  // Get wallet balance
  static getBalance(userId: string): number {
    const wallet = this.getWallet(userId);
    return wallet.walletBalance;
  }

  // Get transaction history
  static getTransactionHistory(userId: string): WalletTransaction[] {
    const wallet = this.getWallet(userId);
    return wallet.transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Calculate maximum usable amount for an order
  static getMaxUsableAmount(userId: string, orderTotal: number): number {
    const balance = this.getBalance(userId);
    return Math.min(balance, orderTotal);
  }

  // Initialize wallet for new user
  static initializeWallet(userId: string, initialBalance: number = 0): void {
    const existingWallet = this.getWallet(userId);
    
    if (existingWallet.transactions.length === 0 && initialBalance > 0) {
      this.addMoney(userId, initialBalance, "Welcome bonus - Initial wallet balance");
    }
  }

  // Format currency amount
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Get transaction summary
  static getTransactionSummary(userId: string): {
    totalCredits: number;
    totalDebits: number;
    transactionCount: number;
  } {
    const transactions = this.getTransactionHistory(userId);
    
    const summary = transactions.reduce((acc, txn) => {
      if (txn.type === "credit") {
        acc.totalCredits += txn.amount;
      } else {
        acc.totalDebits += txn.amount;
      }
      acc.transactionCount++;
      return acc;
    }, { totalCredits: 0, totalDebits: 0, transactionCount: 0 });
    
    return summary;
  }
}
