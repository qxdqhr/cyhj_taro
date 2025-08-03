/**
 * 购买记录页面
 * 
 * 显示用户的购买历史记录
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface OrderItem {
  id: number;
  collectionId: number;
  collection: {
    id: number;
    title: string;
    coverImage: string;
    price: number;
    category: string;
  };
  quantity: number;
  totalPrice: number;
  orderTime: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: 这里应该调用真实的API获取购买记录
      // 目前暂时设置为空数组，等待后端API实现
      setOrders([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <View className="orders-page-loading">
        <View className="orders-page-loading-content">
          <View className="orders-page-loading-spinner"></View>
          <Text className="orders-page-loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="orders-page-error">
        <View className="orders-page-error-content">
          <Text className="orders-page-error-title">加载失败：{error}</Text>
          <Button
            onClick={loadOrders}
            className="orders-page-error-button"
          >
            重试
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="orders-page">
      {/* 主要内容区域 */}
      <View className="orders-page-content">
        {orders.length === 0 ? (
          <View className="orders-page-empty">
            <Text className="orders-page-empty-icon">📋</Text>
            <Text className="orders-page-empty-title">暂无购买记录</Text>
            <Text className="orders-page-empty-subtitle">快去购买一些商品吧</Text>
            <Button
              onClick={() => Taro.navigateBack()}
              className="orders-page-empty-button"
            >
              去购物
            </Button>
          </View>
        ) : (
          <ScrollView scrollY className="orders-page-scroll">
            <View className="orders-page-list">
              {orders.map((order) => (
                <View key={order.id} className="orders-page-item">
                  <View className="orders-page-item-header">
                    <Text className="orders-page-item-time">{order.orderTime}</Text>
                    <Text 
                      className="orders-page-item-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                  
                  <View className="orders-page-item-content">
                    <View className="orders-page-item-image">
                      <Image
                        src={order.collection.coverImage}
                        className="orders-page-item-image-content"
                        mode="aspectFill"
                      />
                    </View>
                    
                    <View className="orders-page-item-info">
                      <Text className="orders-page-item-title">
                        {order.collection.title}
                      </Text>
                      <Text className="orders-page-item-category">
                        {order.collection.category}
                      </Text>
                      <Text className="orders-page-item-quantity">
                        数量：{order.quantity}
                      </Text>
                      <Text className="orders-page-item-price">
                        单价：¥{order.collection.price}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="orders-page-item-footer">
                    <Text className="orders-page-item-total">
                      总计：¥{order.totalPrice}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
} 