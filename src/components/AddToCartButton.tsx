/**
 * ShowMasterpiece 模块 - 添加到购物车按钮组件 - Taro 版本
 * 
 * 用于将画集添加到购物车的按钮组件
 * 
 * @fileoverview 添加到购物车按钮组件
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { useCartContext } from '../contexts/CartContext';
import { useCart } from '../hooks/useCart';
import { ArtCollection } from '../types';

/**
 * 添加到购物车按钮组件属性
 */
interface AddToCartButtonProps {
  /** 画集信息 */
  collection: ArtCollection;
  
  /** 用户ID */
  userId: number;
  
  /** 按钮样式类名 */
  className?: string;
  
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  
  /** 是否显示数量选择器 */
  showQuantitySelector?: boolean;
}

/**
 * 添加到购物车按钮组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  collection,
  userId,
  className = '',
  size = 'md',
  showQuantitySelector = false,
}) => {
  const { cart } = useCartContext();
  const { addItemToCart, updateItemQuantity, removeItemFromCart, loading } = useCart(userId);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // 检查当前画集是否已在购物车中
  const cartItem = cart.items.find(item => item.collectionId === collection.id);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  // 按钮尺寸样式
  const sizeStyles = {
    sm: 'add-to-cart-button-sm',
    md: 'add-to-cart-button-md',
    lg: 'add-to-cart-button-lg',
  };

  // 当购物车数据更新时，同步本地状态
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
      setIsAdded(true);
    } else {
      setQuantity(1);
      setIsAdded(false);
    }
  }, [cartItem]);

  /**
   * 处理添加到购物车
   */
  const handleAddToCart = async () => {
    try {
      if (isInCart) {
        // 如果已在购物车中，增加数量
        await updateItemQuantity(collection.id, currentQuantity + quantity);
      } else {
        // 如果不在购物车中，添加新项
        await addItemToCart({
          userId,
          collectionId: collection.id,
          quantity,
          collection // 传递完整的画集信息
        });
      }
      setIsAdded(true);
    } catch (error) {
      console.error('添加到购物车失败:', error);
    }
  };

  /**
   * 处理数量变化
   */
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  /**
   * 处理购物车中商品数量变化
   */
  const handleCartQuantityChange = async (newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        // 如果数量为0或负数，从购物车中移除
        await removeItemFromCart(collection.id);
      } else {
        // 否则更新数量
        await updateItemQuantity(collection.id, newQuantity);
      }
    } catch (error) {
      console.error('更新购物车数量失败:', error);
    }
  };

  return (
    <View className={`add-to-cart-container ${className}`}>
      {isInCart ? (
        // 已在购物车中的状态
        <View className="add-to-cart-in-cart">
          {/* 已添加状态按钮 */}
          <Button
            disabled={loading}
            className={`add-to-cart-button add-to-cart-button-added ${sizeStyles[size]}`}
          >
            <Text className="add-to-cart-icon">✅</Text>
            <Text>已加入购物车</Text>
          </Button>
          
          {/* 数量控制控件 */}
          <View className="add-to-cart-quantity-control">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCartQuantityChange(currentQuantity - 1);
              }}
              disabled={loading}
              className="add-to-cart-quantity-button"
            >
              <Text className="add-to-cart-quantity-icon">➖</Text>
            </Button>
            <Text className="add-to-cart-quantity-display">
              {currentQuantity}
            </Text>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCartQuantityChange(currentQuantity + 1);
              }}
              disabled={loading}
              className="add-to-cart-quantity-button"
            >
              <Text className="add-to-cart-quantity-icon">➕</Text>
            </Button>
          </View>
        </View>
      ) : (
        // 未在购物车中的状态
        <View className="add-to-cart-not-in-cart">
          {/* 数量选择器 */}
          {showQuantitySelector && (
            <View className="add-to-cart-quantity-control">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(quantity - 1);
                }}
                disabled={quantity <= 1 || loading}
                className="add-to-cart-quantity-button"
              >
                <Text className="add-to-cart-quantity-icon">➖</Text>
              </Button>
              <Text className="add-to-cart-quantity-display">{quantity}</Text>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(quantity + 1);
                }}
                disabled={loading}
                className="add-to-cart-quantity-button"
              >
                <Text className="add-to-cart-quantity-icon">➕</Text>
              </Button>
            </View>
          )}

          {/* 添加到购物车按钮 */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={loading}
            className={`add-to-cart-button add-to-cart-button-add ${sizeStyles[size]}`}
          >
            <Text className="add-to-cart-icon">🛒</Text>
            <Text>加入购物车</Text>
          </Button>
        </View>
      )}
    </View>
  );
}; 