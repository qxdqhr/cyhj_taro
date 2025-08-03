/**
 * ShowMasterpiece 模块 - 购物车弹窗组件 - Taro 版本
 * 
 * 购物车弹窗，显示购物车内容和操作按钮
 * 
 * @fileoverview 购物车弹窗组件
 */

import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { useCartContext } from '../contexts/CartContext';
import { useCart } from '../hooks/useCart';

/**
 * 购物车弹窗组件属性
 */
interface CartModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  
  /** 关闭弹窗回调 */
  onClose: () => void;
  
  /** 弹窗标题 */
  title?: string;
  
  /** 用户ID */
  userId: number;
}

/**
 * 购物车弹窗组件
 * 
 * @param props 组件属性
 * @returns React组件
 */
export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  title = '购物车',
  userId,
}) => {
  const { cart } = useCartContext();
  const { clearCart } = useCart(userId);

  if (!isOpen) {
    return null;
  }

  const handleClearCart = async () => {
    await clearCart();
    onClose();
  };

  const handleCheckout = () => {
    // TODO: 实现结账功能
    console.log('结账功能待实现');
  };

  return (
    <View className="cart-modal-overlay">
      <View className="cart-modal">
        {/* 弹窗头部 */}
        <View className="cart-modal-header">
          <Text className="cart-modal-title">{title}</Text>
          <Button
            onClick={onClose}
            className="cart-modal-close-button"
          >
            <Text className="cart-modal-close-icon">✕</Text>
          </Button>
        </View>

        {/* 弹窗内容 */}
        <View className="cart-modal-content">
          {cart.items.length === 0 ? (
            <View className="cart-modal-empty">
              <Text className="cart-modal-empty-icon">🛒</Text>
              <Text className="cart-modal-empty-title">购物车是空的</Text>
              <Text className="cart-modal-empty-subtitle">快去添加一些商品吧！</Text>
            </View>
          ) : (
            <View className="cart-modal-items">
              {cart.items.map((item) => (
                <View key={item.collectionId} className="cart-modal-item">
                  <View className="cart-modal-item-image">
                    <Text className="cart-modal-item-icon">🖼️</Text>
                  </View>
                  <View className="cart-modal-item-info">
                    <Text className="cart-modal-item-title">
                      {item.collection.title}
                    </Text>
                    <Text className="cart-modal-item-quantity">
                      数量：{item.quantity}
                    </Text>
                    <Text className="cart-modal-item-price">
                      价格：¥{item.collection.price || 0}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 弹窗底部 */}
        {cart.items.length > 0 && (
          <View className="cart-modal-footer">
            <View className="cart-modal-total">
              <Text className="cart-modal-total-label">总计：</Text>
              <Text className="cart-modal-total-price">
                ¥{cart.totalPrice}
              </Text>
            </View>
            
            <View className="cart-modal-actions">
              <Button
                onClick={handleClearCart}
                className="cart-modal-button cart-modal-button-clear"
              >
                清空购物车
              </Button>
              <Button
                onClick={handleCheckout}
                className="cart-modal-button cart-modal-button-checkout"
              >
                立即结账
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}; 