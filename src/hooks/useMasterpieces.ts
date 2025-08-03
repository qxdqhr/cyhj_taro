/**
 * useMasterpieces Hook - 画集数据管理和浏览状态管理 - Taro 版本
 * 
 * 这是一个自定义React Hook，提供了完整的画集数据管理和浏览功能。
 * 主要用于ShowMasterpiece模块的前端页面，封装了所有与画集相关的状态和操作。
 * 
 * 主要功能：
 * - 画集数据的加载和缓存
 * - 画集浏览状态管理（当前选中的画集、当前页面等）
 * - 翻页操作（上一页、下一页、跳转）
 * - 搜索功能
 * - 错误处理和加载状态管理
 * 
 * 性能优化：
 * - 内存缓存机制，减少重复API调用
 * - 使用useCallback优化函数引用稳定性
 * - 懒加载和按需加载
 * 
 * 适配微信小程序环境
 */

import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { ArtCollection } from '../types';
import { MasterpiecesService } from '../services/masterpiecesService';

// ===== 数据缓存配置 =====

/** 画集数据缓存存储 */
let collectionsCache: ArtCollection[] | null = null;

/** 缓存时间戳，用于判断缓存是否过期 */
let collectionsCacheTime: number = 0;

/** 缓存持续时间：3分钟 */
const COLLECTIONS_CACHE_DURATION = 3 * 60 * 1000; // 3分钟缓存

/**
 * useMasterpieces Hook 主体函数
 * 
 * 提供画集数据管理和浏览状态管理的完整解决方案。
 * 包含状态管理、数据获取、缓存机制和用户交互功能。
 */
export const useMasterpieces = () => {
  // ===== 状态管理 =====
  
  /** 所有画集数据列表 */
  const [collections, setCollections] = useState<ArtCollection[]>([]);
  
  /** 当前选中的画集（null表示在画集列表页面） */
  const [selectedCollection, setSelectedCollection] = useState<ArtCollection | null>(null);
  
  /** 当前查看的作品页面索引（从0开始） */
  const [currentPage, setCurrentPage] = useState(0);
  
  /** 数据加载状态 */
  const [loading, setLoading] = useState(false);
  
  /** 错误信息（null表示无错误） */
  const [error, setError] = useState<string | null>(null);

  // ===== 数据加载方法 =====
  
  /**
   * 加载所有画集数据
   * 
   * 支持缓存机制，避免重复的网络请求。
   * 如果缓存有效，直接使用缓存数据；否则从服务器获取新数据。
   * 
   * @param forceRefresh - 是否强制刷新，忽略缓存
   */
  const loadCollections = useCallback(async (forceRefresh = false) => {
    console.log('🔄 [Hook] 开始加载画集数据...', { forceRefresh });
    
    try {
      // 检查缓存是否有效
      const now = Date.now();
      if (!forceRefresh && collectionsCache && (now - collectionsCacheTime) < COLLECTIONS_CACHE_DURATION) {
        console.log('📦 [Hook] 使用缓存数据:', {
          缓存时间: new Date(collectionsCacheTime).toLocaleString(),
          缓存数据量: collectionsCache.length
        });
        setCollections(collectionsCache);
        return;
      }

      console.log('🌐 [Hook] 从服务器获取数据...');
      setLoading(true);
      setError(null);
      
      // 显示加载提示
      Taro.showLoading({
        title: '加载中...',
      });

      const data = await MasterpiecesService.getAllCollections();
      
      console.log('✅ [Hook] 数据加载成功:', {
        画集数量: data.length,
        画集列表: data.map(c => ({ id: c.id, title: c.title, category: c.category }))
      });
      
      // 更新缓存
      collectionsCache = data;
      collectionsCacheTime = now;
      
      setCollections(data);

      // 隐藏加载提示
      Taro.hideLoading();
    } catch (err) {
      console.error('❌ [Hook] 加载画集失败:', err);
      setError('加载画集失败');
      
      // 显示错误提示
      Taro.showToast({
        title: '加载画集失败',
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
      Taro.hideLoading();
    }
  }, []);

  // ===== 画集浏览操作 =====
  
  /**
   * 选择一个画集进行查看
   * 
   * 设置当前选中的画集，并重置页面索引为第一页。
   * 
   * @param collection - 要查看的画集对象
   */
  const selectCollection = useCallback((collection: ArtCollection) => {
    console.log('🎯 [Hook] 选择画集:', {
      id: collection.id,
      title: collection.title,
      category: collection.category,
      作品数量: collection.pages.length
    });
    setSelectedCollection(collection);
    setCurrentPage(0); // 重置到第一页
  }, []);

  /**
   * 切换到下一页作品
   * 
   * 检查是否还有下一页，如果有则切换到下一页。
   * 自动处理边界条件，不会超出作品总数。
   */
  const nextPage = useCallback(() => {
    console.log('➡️ [Hook] 尝试下一页:', {
      当前页: currentPage,
      总页数: selectedCollection?.pages.length || 0,
      画集标题: selectedCollection?.title
    });
    
    if (selectedCollection && currentPage < selectedCollection.pages.length - 1) {
      const newPage = currentPage + 1;
      console.log('✅ [Hook] 切换到下一页:', { 新页: newPage });
      setCurrentPage(newPage);
    } else {
      console.log('⚠️ [Hook] 已经是最后一页');
      // 显示提示
      Taro.showToast({
        title: '已经是最后一页了',
        icon: 'none',
        duration: 1500,
      });
    }
  }, [selectedCollection, currentPage]);

  /**
   * 切换到上一页作品
   * 
   * 检查是否还有上一页，如果有则切换到上一页。
   * 自动处理边界条件，不会低于第一页。
   */
  const prevPage = useCallback(() => {
    console.log('⬅️ [Hook] 尝试上一页:', {
      当前页: currentPage,
      画集标题: selectedCollection?.title
    });
    
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      console.log('✅ [Hook] 切换到上一页:', { 新页: newPage });
      setCurrentPage(newPage);
    } else {
      console.log('⚠️ [Hook] 已经是第一页');
      // 显示提示
      Taro.showToast({
        title: '已经是第一页了',
        icon: 'none',
        duration: 1500,
      });
    }
  }, [currentPage, selectedCollection]);

  /**
   * 跳转到指定页面的作品
   * 
   * 直接跳转到指定的页面索引。
   * 包含边界检查，确保索引在有效范围内。
   * 
   * @param pageIndex - 目标页面索引（从0开始）
   */
  const goToPage = useCallback((pageIndex: number) => {
    console.log('🎯 [Hook] 跳转到页面:', {
      目标页: pageIndex,
      当前页: currentPage,
      总页数: selectedCollection?.pages.length || 0,
      画集标题: selectedCollection?.title
    });
    
    if (selectedCollection && pageIndex >= 0 && pageIndex < selectedCollection.pages.length) {
      console.log('✅ [Hook] 页面跳转成功:', { 新页: pageIndex });
      setCurrentPage(pageIndex);
    } else {
      console.log('❌ [Hook] 页面索引无效:', { 目标页: pageIndex, 有效范围: `0-${(selectedCollection?.pages.length || 0) - 1}` });
      // 显示错误提示
      Taro.showToast({
        title: '页面索引无效',
        icon: 'error',
        duration: 1500,
      });
    }
  }, [selectedCollection, currentPage]);

  /**
   * 返回画集列表页面
   * 
   * 清除当前选中的画集，回到画集列表视图。
   * 同时重置页面索引。
   */
  const backToGallery = useCallback(() => {
    console.log('🏠 [Hook] 返回画集列表:', {
      当前画集: selectedCollection?.title,
      当前页: currentPage
    });
    setSelectedCollection(null);
    setCurrentPage(0);
  }, [selectedCollection, currentPage]);

  // ===== 搜索功能 =====
  
  /**
   * 搜索画集
   * 
   * 根据关键词搜索画集，支持标题、作者、描述等字段的模糊匹配。
   * 搜索结果会替换当前的画集列表。
   * 
   * @param query - 搜索关键词
   */
  const searchCollections = useCallback(async (query: string) => {
    if (!query.trim()) {
      // 如果搜索词为空，重新加载所有画集
      await loadCollections(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 显示加载提示
      Taro.showLoading({
        title: '搜索中...',
      });

      const data = await MasterpiecesService.searchCollections(query);
      setCollections(data);

      // 显示搜索结果提示
      Taro.showToast({
        title: `找到 ${data.length} 个结果`,
        icon: 'success',
        duration: 1500,
      });

      // 隐藏加载提示
      Taro.hideLoading();
    } catch (err) {
      console.error('Error searching collections:', err);
      setError('搜索失败');
      
      // 显示错误提示
      Taro.showToast({
        title: '搜索失败',
        icon: 'error',
        duration: 2000,
      });
    } finally {
      setLoading(false);
      Taro.hideLoading();
    }
  }, [loadCollections]);

  // ===== 辅助方法 =====
  
  /**
   * 获取当前正在查看的作品
   * 
   * 根据当前选中的画集和页面索引，返回对应的作品对象。
   * 如果没有选中画集或索引无效，返回null。
   * 
   * @returns 当前作品对象或null
   */
  const getCurrentArtwork = useCallback(() => {
    if (!selectedCollection || !selectedCollection.pages[currentPage]) {
      return null;
    }
    return selectedCollection.pages[currentPage];
  }, [selectedCollection, currentPage]);

  // ===== 计算属性 =====
  
  /** 是否可以切换到下一页 */
  const canGoNext = selectedCollection ? currentPage < selectedCollection.pages.length - 1 : false;
  
  /** 是否可以切换到上一页 */
  const canGoPrev = currentPage > 0;

  // ===== 初始化 =====
  
  /**
   * 组件挂载时自动加载画集数据
   */
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // ===== 返回值 =====
  
  return {
    // === 状态数据 ===
    /** 所有画集数据 */
    collections,
    /** 当前选中的画集 */
    selectedCollection,
    /** 当前页面索引 */
    currentPage,
    /** 加载状态 */
    loading,
    /** 错误信息 */
    error,
    
    // === 计算属性 ===
    /** 获取当前作品的方法 */
    getCurrentArtwork,
    /** 是否可以下一页 */
    canGoNext,
    /** 是否可以上一页 */
    canGoPrev,
    
    // === 操作方法 ===
    /** 选择画集 */
    selectCollection,
    /** 下一页 */
    nextPage,
    /** 上一页 */
    prevPage,
    /** 跳转到指定页 */
    goToPage,
    /** 返回画集列表 */
    backToGallery,
    /** 搜索画集 */
    searchCollections,
    /** 加载画集数据 */
    loadCollections,
  };
}; 