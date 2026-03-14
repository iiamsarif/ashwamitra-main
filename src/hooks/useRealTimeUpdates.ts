import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import websocketService from '@/services/websocket';

interface RealTimeUpdateOptions {
  onNewRegistration?: (data: any) => void;
  onNewOrder?: (data: any) => void;
  onOrderStatusUpdate?: (data: any) => void;
  onDeliveryStatusUpdate?: (data: any) => void;
  onNewProduct?: (data: any) => void;
  onProductUpdate?: (data: any) => void;
  onPaymentStatusUpdate?: (data: any) => void;
  onWalletUpdate?: (data: any) => void;
}

export const useRealTimeUpdates = (
  userId: string | null,
  userRole: string | null,
  options: RealTimeUpdateOptions = {}
) => {
  const queryClient = useQueryClient();
  const callbacksRef = useRef<RealTimeUpdateOptions>(options);

  // Update callbacks ref when options change
  useEffect(() => {
    callbacksRef.current = options;
  }, [options]);

  // Invalidate queries based on event type
  const invalidateQueries = useCallback((eventType: string, data: any) => {
    switch (eventType) {
      case 'new-registration':
        // Invalidate admin users list
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        break;

      case 'new-order':
        // Invalidate orders for all relevant roles
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['businessOrders'] });
        queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
        queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        
        // Invalidate dashboard stats
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['businessDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['farmerDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['customerDashboard'] });
        break;

      case 'order-status-update':
        // Invalidate orders for all relevant roles
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['businessOrders'] });
        queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
        queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        break;

      case 'delivery-status-update':
        // Invalidate delivery and order queries
        queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] });
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['businessOrders'] });
        queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
        queryClient.invalidateQueries({ queryKey: ['myOrders'] });
        break;

      case 'new-product':
        // Invalidate products for all users
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['myProducts'] });
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        
        // Invalidate dashboard stats
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['customerDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['businessDashboard'] });
        break;

      case 'product-update':
        // Invalidate products for all users
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['myProducts'] });
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        break;

      case 'payment-status-update':
        // Invalidate payments for all relevant roles
        queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
        queryClient.invalidateQueries({ queryKey: ['businessPayments'] });
        queryClient.invalidateQueries({ queryKey: ['farmerPayments'] });
        queryClient.invalidateQueries({ queryKey: ['myPayments'] });
        break;

      case 'wallet-update':
        // Invalidate wallet data
        queryClient.invalidateQueries({ queryKey: ['myWallet'] });
        queryClient.invalidateQueries({ queryKey: ['allWallets'] });
        break;
    }
  }, [queryClient]);

  useEffect(() => {
    if (!userId || !userRole) {
      return;
    }

    // Connect to WebSocket
    websocketService.connect(userId, userRole);

    // Set up event listeners
    const handleNewRegistration = (data: any) => {
      invalidateQueries('new-registration', data);
      callbacksRef.current.onNewRegistration?.(data);
    };

    const handleNewOrder = (data: any) => {
      invalidateQueries('new-order', data);
      callbacksRef.current.onNewOrder?.(data);
    };

    const handleOrderStatusUpdate = (data: any) => {
      invalidateQueries('order-status-update', data);
      callbacksRef.current.onOrderStatusUpdate?.(data);
    };

    const handleDeliveryStatusUpdate = (data: any) => {
      invalidateQueries('delivery-status-update', data);
      callbacksRef.current.onDeliveryStatusUpdate?.(data);
    };

    const handleNewProduct = (data: any) => {
      invalidateQueries('new-product', data);
      callbacksRef.current.onNewProduct?.(data);
    };

    const handleProductUpdate = (data: any) => {
      invalidateQueries('product-update', data);
      callbacksRef.current.onProductUpdate?.(data);
    };

    const handlePaymentStatusUpdate = (data: any) => {
      invalidateQueries('payment-status-update', data);
      callbacksRef.current.onPaymentStatusUpdate?.(data);
    };

    const handleWalletUpdate = (data: any) => {
      invalidateQueries('wallet-update', data);
      callbacksRef.current.onWalletUpdate?.(data);
    };

    // Register event listeners
    websocketService.on('new-registration', handleNewRegistration);
    websocketService.on('new-order', handleNewOrder);
    websocketService.on('order-status-update', handleOrderStatusUpdate);
    websocketService.on('delivery-status-update', handleDeliveryStatusUpdate);
    websocketService.on('new-product', handleNewProduct);
    websocketService.on('product-update', handleProductUpdate);
    websocketService.on('payment-status-update', handlePaymentStatusUpdate);
    websocketService.on('wallet-update', handleWalletUpdate);

    // Cleanup on unmount
    return () => {
      websocketService.off('new-registration', handleNewRegistration);
      websocketService.off('new-order', handleNewOrder);
      websocketService.off('order-status-update', handleOrderStatusUpdate);
      websocketService.off('delivery-status-update', handleDeliveryStatusUpdate);
      websocketService.off('new-product', handleNewProduct);
      websocketService.off('product-update', handleProductUpdate);
      websocketService.off('payment-status-update', handlePaymentStatusUpdate);
      websocketService.off('wallet-update', handleWalletUpdate);
    };
  }, [userId, userRole, invalidateQueries]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return {
    isConnected: websocketService.isConnected(),
    sendEvent: websocketService.send.bind(websocketService)
  };
};
