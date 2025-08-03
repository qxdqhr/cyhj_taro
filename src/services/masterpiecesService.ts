/**
 * ShowMasterpiece 模块 - 画集数据服务 - Taro 版本
 * 
 * 提供画集相关的API调用服务，适配微信小程序环境
 * 使用 Taro.request 替代 fetch
 */

import Taro from '@tarojs/taro';
import { ArtCollection, MasterpiecesConfig, CollectionCategory } from '../types';

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
  console.log('🌐 [API] 发起请求:', {
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

    console.log('✅ [API] 请求成功:', {
      url: fullUrl,
      statusCode: response.statusCode,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      console.error('❌ [API] 请求失败:', {
        url: fullUrl,
        statusCode: response.statusCode,
        data: response.data
      });
      throw new Error(`请求失败: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ [API] 请求异常:', {
      url: fullUrl,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

/**
 * 画集服务类
 */
export class MasterpiecesService {
  /**
   * 获取所有画集
   */
  static async getAllCollections(): Promise<ArtCollection[]> {
    console.log('📚 [Service] 开始获取所有画集...');
    
    const response = await request<ArtCollection[]>({
      url: '/api/masterpieces/collections',
      method: 'GET',
    });

    console.log('📚 [Service] 画集数据响应:', {
      dataLength: Array.isArray(response) ? response.length : 'N/A',
      isArray: Array.isArray(response)
    });

    if (Array.isArray(response)) {
      console.log('✅ [Service] 成功获取画集数据:', {
        画集数量: response.length,
        画集列表: response.map(c => ({ id: c.id, title: c.title, category: c.category }))
      });
      return response;
    } else {
      console.error('❌ [Service] 获取画集失败: 响应格式错误');
      throw new Error('获取画集失败: 响应格式错误');
    }
  }

  /**
   * 根据ID获取画集
   */
  static async getCollectionById(id: number): Promise<ArtCollection> {
    console.log('📚 [Service] 开始获取画集详情:', { id });
    
    const response = await request<ArtCollection>({
      url: `/api/masterpieces/collections/${id}`,
      method: 'GET',
    });

    console.log('✅ [Service] 成功获取画集详情:', {
      id: response.id,
      title: response.title,
      category: response.category
    });
    return response;
  }

  /**
   * 搜索画集
   */
  static async searchCollections(query: string): Promise<ArtCollection[]> {
    console.log('🔍 [Service] 开始搜索画集:', { query });
    
    const response = await request<ArtCollection[]>({
      url: `/api/masterpieces/collections/search?q=${encodeURIComponent(query)}`,
      method: 'GET',
    });

    console.log('✅ [Service] 搜索画集成功:', {
      查询词: query,
      结果数量: response.length
    });
    return response;
  }

  /**
   * 根据分类获取画集
   */
  static async getCollectionsByCategory(category: string): Promise<ArtCollection[]> {
    console.log('📂 [Service] 开始获取分类画集:', { category });
    
    const response = await request<ArtCollection[]>({
      url: `/api/masterpieces/collections/category?category=${encodeURIComponent(category)}`,
      method: 'GET',
    });

    console.log('✅ [Service] 获取分类画集成功:', {
      分类: category,
      结果数量: response.length
    });
    return response;
  }

  /**
   * 获取画集概览数据
   */
  static async getCollectionsOverview(): Promise<{
    total: number;
    categories: Record<string, number>;
  }> {
    const response = await request<ApiResponse<{
      total: number;
      categories: Record<string, number>;
    }>>({
      url: '/api/masterpieces/collections/overview',
      method: 'GET',
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || '获取画集概览失败');
    }
  }
}

/**
 * 配置服务函数
 */
export const masterpiecesConfigService = {
  /**
   * 获取系统配置
   */
  async getConfig(): Promise<MasterpiecesConfig> {
    console.log('⚙️ [Config] 开始获取系统配置...');
    
    const response = await request<MasterpiecesConfig>({
      url: '/api/masterpieces/config',
      method: 'GET',
    });

    console.log('✅ [Config] 成功获取系统配置:', response);
    return response;
  },

  /**
   * 更新系统配置
   */
  async updateConfig(config: Partial<MasterpiecesConfig>): Promise<MasterpiecesConfig> {
    const response = await request<ApiResponse<MasterpiecesConfig>>({
      url: '/api/masterpieces/config',
      method: 'PUT',
      data: config,
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || '更新配置失败');
    }
  },
};

// 导出默认配置
export const defaultConfig: MasterpiecesConfig = {
  siteName: '艺术画集展览',
  heroTitle: '艺术画集展览',
  heroSubtitle: '探索精美的艺术作品，感受创作的魅力',
  maxCollectionsPerPage: 20,
  enableSearch: true,
  enableCategories: true,
  defaultCategory: '画集',
  theme: 'light',
  language: 'zh',
}; 