/**
 * Cart 页面组件
 * 
 * 购物车页面，用于展示用户的购物车内容和结算功能
 * 
 * @component
 */

import React from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCart } from '../../hooks/useCart';
import { useCartContext } from '../../contexts/CartContext';
import { CartProvider } from '../../contexts/CartContext';

/**
 * Cart 内容组件
 * 
 * @returns React函数组件
 */
function CartContent() {
  const {
    cart,
    loading,
    error,
    refreshCart
  } = useCartContext();
  
  const {
    removeItemFromCart,
    updateItemQuantity,
    clearCart
  } = useCart(1); // 临时使用用户ID 1

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Taro.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }
    
    // 这里可以添加结算逻辑
    Taro.showToast({
      title: '结算功能开发中',
      icon: 'none'
    });
  };

  const handleRemoveItem = (collectionId: number) => {
    removeItemFromCart(collectionId);
  };

  const handleUpdateQuantity = (collectionId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromCart(collectionId);
    } else {
      updateItemQuantity(collectionId, quantity);
    }
  };

  if (loading) {
    return (
      <View className="cart-page-loading">
        <View className="cart-page-loading-content">
          <View className="cart-page-loading-spinner"></View>
          <Text className="cart-page-loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="cart-page-error">
        <View className="cart-page-error-content">
          <Text className="cart-page-error-title">加载失败：{error}</Text>
          <Button
            onClick={() => Taro.reLaunch({ url: '/pages/cart/index' })}
            className="cart-page-error-button"
          >
            重试
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="cart-page">
      {/* 顶部导航 */}
      <View className="cart-page-header">
        <View className="cart-page-header-content">
          <View className="cart-page-header-nav">
            <Button
              onClick={() => Taro.navigateBack()}
              className="cart-page-back-button"
            >
              <Text>◀</Text>
              <Text>返回</Text>
            </Button>
            <Text className="cart-page-title">购物车</Text>
            <View className="cart-page-spacer"></View>
          </View>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="cart-page-content">
        {cart.items.length === 0 ? (
          /* 空购物车状态 */
          <View className="cart-page-empty">
            <Text className="cart-page-empty-icon">🛒</Text>
            <Text className="cart-page-empty-title">购物车为空</Text>
            <Text className="cart-page-empty-subtitle">快去添加一些商品吧</Text>
            <Button
              onClick={() => Taro.navigateBack()}
              className="cart-page-empty-button"
            >
              继续购物
            </Button>
          </View>
        ) : (
          /* 购物车内容 */
          <View className="cart-page-items">
            {/* 购物车商品列表 */}
            <ScrollView scrollY className="cart-page-scroll">
              <View className="cart-page-item-list">
                {cart.items.map((item) => (
                  <View key={item.collectionId} className="cart-page-item">
                    <View className="cart-page-item-content">
                      {/* 商品图片 */}
                      <View className="cart-page-item-image">
                        {item.collection.coverImage && (
                          <Image
                            src={item.collection.coverImage}
                            className="cart-page-item-image-content"
                            mode="aspectFill"
                          />
                        )}
                      </View>
                      
                      {/* 商品信息 */}
                      <View className="cart-page-item-info">
                        <Text className="cart-page-item-title">
                          {item.collection.title}
                        </Text>
                        <Text className="cart-page-item-category">
                          {item.collection.category}
                        </Text>
                        <Text className="cart-page-item-price">
                          ¥{item.collection.price}
                        </Text>
                      </View>
                      
                      {/* 数量控制 */}
                      <View className="cart-page-item-controls">
                        <Button
                          onClick={() => handleUpdateQuantity(item.collectionId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="cart-page-quantity-button"
                        >
                          <Text className="cart-page-quantity-icon">➖</Text>
                        </Button>
                        <Text className="cart-page-quantity-display">{item.quantity}</Text>
                        <Button
                          onClick={() => handleUpdateQuantity(item.collectionId, item.quantity + 1)}
                          className="cart-page-quantity-button"
                        >
                          <Text className="cart-page-quantity-icon">➕</Text>
                        </Button>
                      </View>
                      
                      {/* 删除按钮 */}
                      <Button
                        onClick={() => handleRemoveItem(item.collectionId)}
                        className="cart-page-remove-button"
                      >
                        <Text className="cart-page-remove-icon">🗑️</Text>
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* 购物车底部 */}
            <View className="cart-page-footer">
              <View className="cart-page-summary">
                <Text className="cart-page-summary-label">商品总数：</Text>
                <Text className="cart-page-summary-value">{cart.totalQuantity}</Text>
              </View>
              <View className="cart-page-summary">
                <Text className="cart-page-summary-label">总价：</Text>
                <Text className="cart-page-summary-price">¥{cart.totalPrice}</Text>
              </View>
              <Button
                onClick={handleCheckout}
                className="cart-page-checkout-button"
              >
                立即结账
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Cart 主组件
 * 
 * @returns React函数组件
 */
export default function CartPage() {
  // 获取用户ID，临时默认为1（应该要求登录）
  const userId = 1;

  return (
    <CartProvider userId={userId}>
      <CartContent />
    </CartProvider>
  );
} 