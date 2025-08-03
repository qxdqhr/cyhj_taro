/**
 * ShowMasterpiece 主页面组件 - Taro 版本
 * 
 * 这是ShowMasterpiece模块的主要页面组件，提供完整的画集浏览体验。
 * 支持两种视图模式：画集列表视图和作品详情视图。
 * 
 * 主要功能：
 * - 画集列表展示和搜索
 * - 画集详情浏览和作品查看
 * - 用户权限控制和认证
 * - 响应式设计和优化的用户体验
 * - 配置管理入口（需要管理员权限）
 * 
 * 技术特点：
 * - 使用自定义Hook进行状态管理
 * - 集成认证系统，支持权限控制
 * - 动态配置加载，支持个性化设置
 * - 性能优化：使用useMemo缓存计算结果
 * - 使用 Tailwind CSS 进行样式管理
 * 
 * @component
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
// import { useMasterpieces } from '../../hooks/useMasterpieces';
import { masterpiecesConfigService, MasterpiecesService } from '../../services/masterpiecesService';
import { MasterpiecesConfig, CollectionCategory, CollectionCategoryType, ArtCollection } from '../../types';
import { 
  CollectionCard, 
  ArtworkViewer, 
  ThumbnailSidebar, 
  CartModal, 
  CartButton,
  CategoryGrid
} from '../../components';
import { CartProvider } from '../../contexts/CartContext';

// 添加测试日志
console.log('🎯 [Page] 页面文件加载成功！');
console.log('📱 [Page] Taro版本:', Taro.getSystemInfoSync());

/**
 * ShowMasterpiece 内容组件
 * 
 * 主要的业务逻辑组件，包含状态管理和视图渲染。
 * 需要在CartProvider包装器内使用，以便访问购物车状态。
 * 
 * @returns React函数组件
 */
function ShowMasterPiecesContent() {
  console.log('🚀 [Page] ShowMasterPiecesContent 组件开始渲染');
  console.log('🚀 [Page] 组件渲染时间:', new Date().toLocaleString());
  
  // ===== 状态管理 =====
  
  /** 画集数据 */
  const [collections, setCollections] = useState<ArtCollection[]>([]);
  
  /** 加载状态 */
  const [loading, setLoading] = useState(true);
  
  /** 错误状态 */
  const [error, setError] = useState<string | null>(null);
  
  /** 当前选中的画集（null表示在画集列表页面） */
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  
  /** 当前查看的作品页面索引（从0开始） */
  const [currentPage, setCurrentPage] = useState(0);
  
  /** 系统配置状态 */
  const [config, setConfig] = useState<MasterpiecesConfig | null>(null);
  
  /** 购物车弹窗状态 */
  const [cartModalOpen, setCartModalOpen] = useState(false);
  
  /** 当前选中的分类 */
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategoryType>(CollectionCategory.COLLECTION);

  // 计算各分类的商品数量
  const categoryCounts = useMemo(() => {
    const counts: Record<CollectionCategoryType, number> = {
      [CollectionCategory.COLLECTION]: 0,
      [CollectionCategory.ACRYLIC]: 0,
      [CollectionCategory.BADGE]: 0,
      [CollectionCategory.COLOR_PAPER]: 0,
      [CollectionCategory.POSTCARD]: 0,
      [CollectionCategory.LASER_TICKET]: 0,
      [CollectionCategory.CANVAS_BAG]: 0,
      [CollectionCategory.SUPPORT_STICK]: 0,
      [CollectionCategory.OTHER]: 0
    };
    
    collections.forEach(collection => {
      if (counts[collection.category] !== undefined) {
        counts[collection.category]++;
      }
    });
    
    return counts;
  }, [collections]);

  // ===== 数据加载 =====
  
  useEffect(() => {
    console.log('🚀 [Page] 页面组件挂载，开始加载数据');
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📚 [Page] 开始加载画集数据...');
        const collectionsData = await MasterpiecesService.getAllCollections();
        console.log('✅ [Page] 画集数据加载成功:', {
          画集数量: collectionsData.length,
          画集列表: collectionsData.map(c => ({ id: c.id, title: c.title, category: c.category }))
        });
        setCollections(collectionsData);
        
        console.log('⚙️ [Page] 开始加载系统配置...');
        const configData = await masterpiecesConfigService.getConfig();
        console.log('✅ [Page] 系统配置加载成功:', configData);
        setConfig(configData);
        
      } catch (err) {
        console.error('❌ [Page] 数据加载失败:', err);
        setError(err instanceof Error ? err.message : '数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ===== 数据过滤 =====
  
  const filteredCollections = useMemo(() => {
    const filtered = collections.filter(collection => collection.category === selectedCategory);
    console.log('🔍 [Page] 画集过滤结果:', {
      选中分类: selectedCategory,
      总画集数: collections.length,
      过滤后数量: filtered.length
    });
    return filtered;
  }, [collections, selectedCategory]);

  // ===== 事件处理函数 =====
  
  const handleCartClick = () => {
    console.log('🛒 [Page] 用户点击购物车按钮');
    setCartModalOpen(true);
  };

  const handleSelectCollection = (collection) => {
    console.log('🎯 [Page] 选择画集:', collection.title);
    setSelectedCollection(collection);
    setCurrentPage(0);
  };

  const handleBackToGallery = () => {
    console.log('🏠 [Page] 返回画集列表');
    setSelectedCollection(null);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (selectedCollection && currentPage < selectedCollection.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGoToPage = (pageIndex) => {
    if (selectedCollection && pageIndex >= 0 && pageIndex < selectedCollection.pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  // ===== 计算属性 =====
  
  const getCurrentArtwork = () => {
    if (!selectedCollection || !selectedCollection.pages[currentPage]) {
      return null;
    }
    return selectedCollection.pages[currentPage];
  };

  const canGoNext = selectedCollection ? currentPage < selectedCollection.pages.length - 1 : false;
  const canGoPrev = currentPage > 0;

  // ===== 渲染函数 =====
  
  const renderLoading = () => (
    <View className="index-page-loading">
      <View className="index-page-loading-content">
        <View className="index-page-loading-spinner"></View>
        <Text className="index-page-loading-text">加载中...</Text>
      </View>
    </View>
  );

  const renderError = () => (
    <View className="index-page-error">
      <View className="index-page-error-content">
        <Text className="index-page-error-title">加载失败</Text>
        <Button
          onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}
          className="index-page-error-button"
        >
          重试
        </Button>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="index-page-empty">
      <View className="index-page-empty-content">
        <Text className="index-page-empty-icon">🎨</Text>
        <Text className="index-page-empty-title">暂无可用画集</Text>
        <Text className="index-page-empty-subtitle">当前没有可预订的画集，请稍后再试</Text>
      </View>
    </View>
  );

  // ===== 主渲染逻辑 =====
  
  console.log('🔍 [Page] 开始主渲染逻辑');
  console.log('🔍 [Page] loading:', loading);
  console.log('🔍 [Page] error:', error);
  console.log('🔍 [Page] collections:', collections);
  console.log('🔍 [Page] collections.length:', collections?.length);
  
  // 加载状态
  if (loading) {
    console.log('🔍 [Page] 加载状态渲染');
    return renderLoading();
  }
  
  // 错误状态
  if (error) {
    console.log('🔍 [Page] 错误状态渲染');
    return renderError();
  }
  
  // 空状态
  if (!collections || collections.length === 0) {
    console.log('🔍 [Page] 空状态渲染');
    return renderEmptyState();
  }
  console.log('🔍 [Page] 正常渲染，collections有数据');
  // 获取用户ID，临时默认为1（应该要求登录）
  const userId = 1;

  return (
    <View className="index-page">
      {/* 顶部导航 */}
      <View className="index-page-header">
        <View className="index-page-header-content">
          <View className="index-page-header-nav">
            {/* 左侧：返回按钮和标题 */}
            <View className="index-page-header-left">
              {selectedCollection && (
                <Button
                  onClick={handleBackToGallery}
                  className="index-page-back-button"
                >
                  <Text className="index-page-back-icon">◀</Text>
                  <Text className="index-page-back-text">返回</Text>
                </Button>
              )}
              <View className="index-page-title-container">
                <Text className="index-page-title">
                  {config?.heroTitle || '艺术画集展览'}
                </Text>
                <Text className="index-page-subtitle">
                  {config?.heroSubtitle || '探索精美的艺术作品，感受创作的魅力'}
                </Text>
              </View>
            </View>

            {/* 右侧：购物车和购买记录按钮 */}
            <View className="index-page-header-right">
              <Button
                onClick={() => Taro.navigateTo({ url: '/pages/orders/index' })}
                className="index-page-orders-button"
              >
                <Text className="index-page-orders-text">记录</Text>
              </Button>
              <CartButton 
                userId={userId}
                onClick={handleCartClick}
                className="index-page-cart-button"
              />
            </View>
          </View>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="index-page-content">
        {selectedCollection ? (
          // 画集详情视图
          <View className="index-page-detail-layout">
            {/* 侧边栏：缩略图导航 */}
            <View className="index-page-sidebar">
              <ThumbnailSidebar
                pages={selectedCollection.pages}
                currentPage={currentPage}
                onPageSelect={handleGoToPage}
              />
            </View>
            
            {/* 主内容区：作品查看器 */}
            <View className="index-page-main">
              {getCurrentArtwork() && (
                <ArtworkViewer
                  artwork={getCurrentArtwork()!}
                  collectionId={selectedCollection.id}
                  onNext={handleNextPage}
                  onPrev={handlePrevPage}
                  canGoNext={canGoNext}
                  canGoPrev={canGoPrev}
                />
              )}
            </View>
          </View>
        ) : (
          // 画集列表视图
          <View className="index-page-list-layout">
            {/* 九宫格分类筛选 */}
            <CategoryGrid
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              categoryCounts={categoryCounts}
            />

            {/* 画集列表 */}
            <View className="index-page-collections">
              {filteredCollections.length === 0 ? (
                <View className="index-page-no-results">
                  <Text className="index-page-no-results-text">
                    没有找到相关画集
                  </Text>
                  <Text className="index-page-no-results-hint">
                    请尝试其他分类或稍后再试
                  </Text>
                </View>
              ) : (
                                 <View className="index-page-grid">
                   {filteredCollections.map((collection) => (
                     <CollectionCard
                       key={collection.id}
                       collection={collection}
                       userId={userId}
                       onSelect={handleSelectCollection}
                     />
                   ))}
                 </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* 购物车弹窗 */}
      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        title="购物车"
        userId={userId}
      />
    </View>
  );
}

/**
 * ShowMasterpiece 主组件
 * 
 * 提供购物车上下文包装器，确保组件能够访问购物车状态。
 * 
 * @returns React函数组件
 */
export default function ShowMasterPieces() {
  console.log('🎯 [Page] ShowMasterPieces 主组件开始渲染');
  
  // 获取用户ID，临时默认为1（应该要求登录）
  const userId = 1;

  return (
    <CartProvider userId={userId}>
      <ShowMasterPiecesContent />
    </CartProvider>
  );
}
