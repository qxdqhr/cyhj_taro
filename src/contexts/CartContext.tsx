/**
 * ShowMasterpiece 模块 - 购物车上下文 - Taro 版本
 * 
 * 提供购物车状态的全局管理，包括：
 * - 购物车数据状态
 * - 购物车数据刷新
 * - 购物车更新通知
 * 
 * 适配微信小程序环境
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { Cart } from '../types/cart';
import { getCart } from '../services/cartService';

/**
 * 购物车更新事件
 */
export const CART_UPDATE_EVENT = 'cart-update';

/**
 * 购物车上下文状态
 */
interface CartContextState {
  /** 购物车数据 */
  cart: Cart;
  
  /** 加载状态 */
  loading: boolean;
  
  /** 错误信息 */
  error: string | undefined;
  
  /** 刷新购物车数据 */
  refreshCart: () => Promise<void>;
}

/**
 * 购物车上下文类型
 */
const CartContext = createContext<CartContextState | undefined>(undefined);

/**
 * 购物车上下文提供者属性
 */
interface CartProviderProps {
  children: ReactNode;
  userId: number;
}

/**
 * 购物车上下文提供者组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children, userId }) => {
  const [state, setState] = useState<CartContextState>({
    cart: {
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    },
    loading: false,
    error: undefined,
    refreshCart: async () => {}
  });

  /**
   * 刷新购物车数据
   */
  const refreshCart = useCallback(async () => {
    console.log('🔄 [Cart Context] 开始刷新购物车数据:', { userId });
    
    if (!userId) {
      console.warn('⚠️ [Cart Context] 用户ID为空，跳过刷新');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('📡 [Cart Context] 调用购物车服务...');
      const cartData = await getCart(userId);
      
      console.log('✅ [Cart Context] 购物车数据刷新成功:', {
        商品数量: cartData.items.length,
        总数量: cartData.totalQuantity,
        总价格: cartData.totalPrice
      });
      
      setState(prev => ({ 
        ...prev, 
        cart: cartData,
        loading: false 
      }));
    } catch (error) {
      console.error('❌ [Cart Context] 刷新购物车失败:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '刷新购物车失败' 
      }));
    }
  }, [userId]);

  // 初始化时加载购物车数据
  useEffect(() => {
    console.log('🚀 [Cart Context] 组件初始化，开始加载购物车数据');
    refreshCart();
  }, [refreshCart]);

  // 监听购物车更新事件
  useEffect(() => {
    console.log('👂 [Cart Context] 注册购物车更新事件监听器');
    
    const handleCartUpdate = () => {
      console.log('📢 [Cart Context] 收到购物车更新事件，开始刷新数据');
      refreshCart();
    };

    // 使用 Taro 的事件系统
    Taro.eventCenter.on(CART_UPDATE_EVENT, handleCartUpdate);

    return () => {
      console.log('🧹 [Cart Context] 清理购物车更新事件监听器');
      Taro.eventCenter.off(CART_UPDATE_EVENT, handleCartUpdate);
    };
  }, [refreshCart]);

  const contextValue: CartContextState = {
    ...state,
    refreshCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * 使用购物车上下文Hook
 * 
 * @returns 购物车上下文状态
 */
export const useCartContext = (): CartContextState => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

/**
 * 触发购物车更新事件
 */
export const triggerCartUpdate = () => {
  console.log('📢 [Cart Context] 触发购物车更新事件');
  Taro.eventCenter.trigger(CART_UPDATE_EVENT);
}; 