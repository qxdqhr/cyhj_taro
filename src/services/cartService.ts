/**
 * ShowMasterpiece 模块 - 购物车服务 - Taro 版本
 * 
 * 提供购物车相关的API调用服务，适配微信小程序环境
 * 使用 Taro.request 替代 fetch
 */

import Taro from '@tarojs/taro';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, RemoveFromCartRequest, ClearCartRequest, BatchBookingRequest, BatchBookingResponse } from '../types/cart';

/**
 * API 基础配置
 * 使用与原项目相同的API接口
 */
const API_BASE_URL = 'http://localhost:3000'; // Next.js 开发服务器地址

/**
 * 网络请求封装
 */
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

/**
 * 通用请求方法
 */
async function request<T>(options: Taro.request.Option): Promise<T> {
  const fullUrl = `${API_BASE_URL}${options.url}`;
  console.log('🛒 [Cart API] 发起请求:', {
    url: fullUrl,
    method: options.method || 'GET',
    data: options.data
  });

  try {
    const response = await Taro.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header,
      },
      timeout: 10000,
    });

    console.log('✅ [Cart API] 请求成功:', {
      url: fullUrl,
      statusCode: response.statusCode,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      console.error('❌ [Cart API] 请求失败:', {
        url: fullUrl,
        statusCode: response.statusCode,
        data: response.data
      });
      throw new Error(`请求失败: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ [Cart API] 请求异常:', {
      url: fullUrl,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

/**
 * 购物车服务类
 */
export class CartService {
  /**
   * 获取用户购物车
   */
  static async getCart(userId: number): Promise<Cart> {
    console.log('🛒 [Cart] 开始获取用户购物车:', { userId });
    try {
      const response = await request<Cart>({
        url: `/api/cart/${userId}`,
        method: 'GET',
      });

      console.log('✅ [Cart] 成功获取购物车:', {
        userId,
        商品数量: response.items.length,
        总数量: response.totalQuantity,
        总价格: response.totalPrice
      });
      return response;
    } catch (error) {
      console.error('❌ [Cart] 获取购物车失败:', error);
      // 返回空购物车
      const emptyCart = {
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      };
      console.log('🔄 [Cart] 返回空购物车:', emptyCart);
      return emptyCart;
    }
  }

  /**
   * 添加到购物车
   */
  static async addToCart(userId: number, requestData: AddToCartRequest): Promise<Cart> {
    try {
      const response = await request<ApiResponse<Cart>>({
        url: `/api/cart/${userId}/add`,
        method: 'POST',
        data: requestData,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || '添加到购物车失败');
      }
    } catch (error) {
      console.error('添加到购物车失败:', error);
      throw error;
    }
  }

  /**
   * 更新购物车项数量
   */
  static async updateCartItem(userId: number, requestData: UpdateCartItemRequest): Promise<Cart> {
    try {
      const response = await request<ApiResponse<Cart>>({
        url: `/api/cart/${userId}/update`,
        method: 'PUT',
        data: requestData,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || '更新购物车失败');
      }
    } catch (error) {
      console.error('更新购物车失败:', error);
      throw error;
    }
  }

  /**
   * 从购物车移除商品
   */
  static async removeFromCart(userId: number, requestData: RemoveFromCartRequest): Promise<Cart> {
    try {
      const response = await request<ApiResponse<Cart>>({
        url: `/api/cart/${userId}/remove`,
        method: 'DELETE',
        data: requestData,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || '移除购物车商品失败');
      }
    } catch (error) {
      console.error('移除购物车商品失败:', error);
      throw error;
    }
  }

  /**
   * 清空购物车
   */
  static async clearCart(userId: number): Promise<Cart> {
    try {
      const response = await request<ApiResponse<Cart>>({
        url: `/api/cart/${userId}/clear`,
        method: 'DELETE',
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || '清空购物车失败');
      }
    } catch (error) {
      console.error('清空购物车失败:', error);
      throw error;
    }
  }

  /**
   * 批量预订
   */
  static async batchBooking(userId: number, requestData: BatchBookingRequest): Promise<BatchBookingResponse> {
    try {
      const response = await request<ApiResponse<BatchBookingResponse>>({
        url: `/api/cart/${userId}/booking`,
        method: 'POST',
        data: requestData,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || '批量预订失败');
      }
    } catch (error) {
      console.error('批量预订失败:', error);
      throw error;
    }
  }
}

/**
 * 购物车服务函数
 */
export const cartService = {
  /**
   * 获取购物车
   */
  async getCart(userId: number): Promise<Cart> {
    return CartService.getCart(userId);
  },

  /**
   * 添加到购物车
   */
  async addToCart(userId: number, request: AddToCartRequest): Promise<Cart> {
    return CartService.addToCart(userId, request);
  },

  /**
   * 更新购物车项
   */
  async updateCartItem(userId: number, request: UpdateCartItemRequest): Promise<Cart> {
    return CartService.updateCartItem(userId, request);
  },

  /**
   * 从购物车移除
   */
  async removeFromCart(userId: number, request: RemoveFromCartRequest): Promise<Cart> {
    return CartService.removeFromCart(userId, request);
  },

  /**
   * 清空购物车
   */
  async clearCart(userId: number): Promise<Cart> {
    return CartService.clearCart(userId);
  },

  /**
   * 批量预订
   */
  async batchBooking(userId: number, request: BatchBookingRequest): Promise<BatchBookingResponse> {
    return CartService.batchBooking(userId, request);
  },
};

// 导出便捷函数
export const getCart = cartService.getCart;
export const addToCart = cartService.addToCart;
export const updateCartItem = cartService.updateCartItem;
export const removeFromCart = cartService.removeFromCart;
export const clearCart = cartService.clearCart;
export const batchBooking = cartService.batchBooking; 