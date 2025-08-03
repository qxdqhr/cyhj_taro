/**
 * ShowMasterpiece 模块 - 购物车Hook - Taro 版本
 * 
 * 提供购物车相关的状态管理和业务逻辑
 * 适配微信小程序环境
 */

import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { 
  Cart, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  RemoveFromCartRequest,
  BatchBookingRequest,
  BatchBookingResponse
} from '../types/cart';
import { 
  addToCart as addToCartService, 
  updateCartItem as updateCartItemService, 
  removeFromCart as removeFromCartService, 
  clearCart as clearCartService,
  batchBooking as batchBookingService
} from '../services/cartService';
import { triggerCartUpdate } from '../contexts/CartContext';

/**
 * 购物车Hook返回值
 */
interface UseCartReturn {
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | undefined;
  
  /** 添加商品到购物车 */
  addItemToCart: (request: AddToCartRequest & { userId: number; collection?: any }) => Promise<void>;
  
  /** 更新购物车商品数量 */
  updateItemQuantity: (collectionId: number, quantity: number) => Promise<void>;
  
  /** 从购物车移除商品 */
  removeItemFromCart: (collectionId: number) => Promise<void>;
  
  /** 清空购物车 */
  clearCart: () => Promise<void>;
  
  /** 批量预订 */
  batchBooking: (request: BatchBookingRequest) => Promise<BatchBookingResponse>;
  
  /** 清除错误信息 */
  clearError: () => void;
}

/**
 * 购物车Hook
 * 
 * @param userId 用户ID
 * @returns 购物车操作方法和状态
 */
export const useCart = (userId: number): UseCartReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  /**
   * 添加商品到购物车
   */
  const addItemToCart = useCallback(async (request: AddToCartRequest & { userId: number; collection?: any }) => {
    console.log('🛒 [Cart Hook] 开始添加商品到购物车:', {
      userId,
      collectionId: request.collectionId,
      quantity: request.quantity,
      collection: request.collection?.title
    });

    if (!userId) {
      console.error('❌ [Cart Hook] 用户ID不能为空');
      setError('用户ID不能为空');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      console.log('📡 [Cart Hook] 调用添加购物车服务...');
      await addToCartService(userId, {
        collectionId: request.collectionId,
        quantity: request.quantity,
      });

      console.log('✅ [Cart Hook] 添加购物车成功');
      // 触发购物车更新事件
      triggerCartUpdate();

      // 显示成功提示
      Taro.showToast({
        title: '已添加到购物车',
        icon: 'success',
        duration: 2000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加到购物车失败';
      console.error('❌ [Cart Hook] 添加购物车失败:', errorMessage);
      setError(errorMessage);
      
      // 显示错误提示
      Taro.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 更新购物车商品数量
   */
  const updateItemQuantity = useCallback(async (collectionId: number, quantity: number) => {
    if (!userId) {
      setError('用户ID不能为空');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      await updateCartItemService(userId, {
        collectionId,
        quantity,
      });

      // 触发购物车更新事件
      triggerCartUpdate();

      // 显示成功提示
      Taro.showToast({
        title: '购物车已更新',
        icon: 'success',
        duration: 1500,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新购物车失败';
      setError(errorMessage);
      
      // 显示错误提示
      Taro.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 从购物车移除商品
   */
  const removeItemFromCart = useCallback(async (collectionId: number) => {
    if (!userId) {
      setError('用户ID不能为空');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      await removeFromCartService(userId, {
        collectionId,
      });

      // 触发购物车更新事件
      triggerCartUpdate();

      // 显示成功提示
      Taro.showToast({
        title: '已从购物车移除',
        icon: 'success',
        duration: 1500,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '移除商品失败';
      setError(errorMessage);
      
      // 显示错误提示
      Taro.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 清空购物车
   */
  const clearCart = useCallback(async () => {
    if (!userId) {
      setError('用户ID不能为空');
      return;
    }

    // 显示确认对话框
    const { confirm } = await Taro.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？此操作不可撤销。',
      confirmText: '确定',
      cancelText: '取消',
    });

    if (!confirm) {
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      await clearCartService(userId);

      // 触发购物车更新事件
      triggerCartUpdate();

      // 显示成功提示
      Taro.showToast({
        title: '购物车已清空',
        icon: 'success',
        duration: 1500,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '清空购物车失败';
      setError(errorMessage);
      
      // 显示错误提示
      Taro.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 批量预订
   */
  const batchBooking = useCallback(async (request: BatchBookingRequest): Promise<BatchBookingResponse> => {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }

    setLoading(true);
    setError(undefined);

    try {
      const result = await batchBookingService(userId, request);

      // 触发购物车更新事件
      triggerCartUpdate();

      // 显示成功提示
      Taro.showToast({
        title: `预订成功！成功预订 ${result.successCount} 项`,
        icon: 'success',
        duration: 3000,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '批量预订失败';
      setError(errorMessage);
      
      // 显示错误提示
      Taro.showToast({
        title: errorMessage,
        icon: 'error',
        duration: 3000,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    loading,
    error,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    batchBooking,
    clearError,
  };
}; 