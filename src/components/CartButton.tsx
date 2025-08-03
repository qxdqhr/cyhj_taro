/**
 * ShowMasterpiece 模块 - 购物车按钮组件 - Taro 版本
 * 
 * 显示购物车图标和商品数量的按钮组件，点击可打开购物车弹窗
 * 
 * @fileoverview 购物车按钮组件
 */

import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { useCartContext } from '../contexts/CartContext';

/**
 * 购物车按钮组件属性
 */
interface CartButtonProps {
  /** 用户ID */
  userId: number;
  
  /** 点击回调 */
  onClick: () => void;
  
  /** 按钮样式类名 */
  className?: string;
  
  /** 是否显示商品数量 */
  showBadge?: boolean;
}

/**
 * 购物车按钮组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartButton: React.FC<CartButtonProps> = ({
  userId,
  onClick,
  className = '',
  showBadge = true,
}) => {
  const { cart } = useCartContext();

  return (
    <Button
      onClick={onClick}
      className={`cart-button ${className}`}
    >
      <Text className="cart-button-text">购物车</Text>
      
      {/* 商品数量徽章 */}
      {showBadge && cart.totalQuantity > 0 && (
        <View className="cart-button-badge">
          <Text className="cart-button-badge-text">
            {cart.totalQuantity > 99 ? '99+' : cart.totalQuantity}
          </Text>
        </View>
      )}
    </Button>
  );
}; 