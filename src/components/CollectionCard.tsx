/**
 * 画集卡片组件 (CollectionCard) - Taro 版本
 * 
 * 这是一个用于展示单个画集信息的卡片组件，主要用于画集列表页面。
 * 
 * 主要功能：
 * - 画集封面图片展示（支持懒加载）
 * - 画集基本信息显示（标题、编号、分类、描述等）
 * - 作品页数统计显示
 * - 点击进入画集浏览
 * 
 * 性能优化特性：
 * - 图片懒加载
 * - 加载状态和错误处理
 * - Tailwind CSS 样式
 * 
 * @component
 */

import React, { useState } from 'react';
import { View, Image, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ArtCollection, CollectionCategory } from '../types';
import { AddToCartButton } from './AddToCartButton';

/**
 * CollectionCard 组件的 Props 接口
 */
interface CollectionCardProps {
  /** 要展示的画集数据 */
  collection: ArtCollection;
  /** 用户ID */
  userId: number;
  /** 用户选择画集时的回调函数 */
  onSelect: (collection: ArtCollection) => void;
}

/**
 * 画集卡片组件主体
 * 
 * @param props - 组件属性
 * @param props.collection - 画集数据对象
 * @param props.userId - 用户ID
 * @param props.onSelect - 选择画集的回调函数
 * @returns React函数组件
 */
export const CollectionCard: React.FC<CollectionCardProps> = ({ 
  collection, 
  userId,
  onSelect 
}) => {
  // ===== 状态管理 =====
  
  /** 图片是否正在加载 */
  const [imageLoading, setImageLoading] = useState(true);
  
  /** 图片是否加载失败 */
  const [imageError, setImageError] = useState(false);

  // ===== 图片处理函数 =====
  
  /**
   * 图片加载成功处理函数
   * 隐藏加载状态，显示图片
   */
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  /**
   * 图片加载失败处理函数
   * 隐藏加载状态，显示错误状态
   */
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // ===== 渲染函数 =====
  
  /**
   * 渲染图片加载状态
   */
  const renderImageLoading = () => (
    <View className="collection-card-loading">
      <View className="collection-card-loading-spinner"></View>
    </View>
  );

  /**
   * 渲染图片错误状态
   */
  const renderImageError = () => (
    <View className="collection-card-error">
      <Text className="text-3xl">🖼️</Text>
      <Text>图片加载失败</Text>
    </View>
  );

  /**
   * 渲染画集封面图片
   */
  const renderCoverImage = () => {
    if (imageError) {
      return renderImageError();
    }

    return (
      <Image
        src={collection.coverImage}
        mode="aspectFill"
        className={`collection-card-image ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        lazyLoad
      />
    );
  };

  /**
   * 格式化价格显示
   */
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) {
      return '价格待定';
    }
    if (price === 0) {
      return '免费';
    }
    return `¥${price}`;
  };

  /**
   * 判断是否为商品类型
   */
  const isProduct = collection.category !== CollectionCategory.COLLECTION;

  /**
   * 处理卡片点击
   */
  const handleCardClick = () => {
    if (!isProduct) {
      onSelect(collection);
    }
  };

  return (
    <View
      className={`collection-card ${
        isProduct 
          ? '' 
          : ''
      }`}
      onClick={handleCardClick}
    >
      {/* 图片容器 */}
      <View className="collection-card-image-container">
        {/* 图片覆盖层 */}
        <View className="collection-card-overlay"></View>
        
        {/* 画集徽章 */}
        <View className="collection-card-badge">
          <View className="collection-card-badge-content">
            {isProduct ? (
              <>
                <Text className="text-sm">🛍️</Text>
                <Text className="text-sm font-medium">商品</Text>
              </>
            ) : (
              <>
                <Text className="text-sm">📖</Text>
                <Text className="text-sm font-medium">
                  {collection.pages.length} 页
                </Text>
              </>
            )}
          </View>
        </View>

        {/* 封面图片 */}
        {renderCoverImage()}
        
        {/* 加载状态 */}
        {imageLoading && renderImageLoading()}
      </View>

      {/* 内容区域 */}
      <View className="collection-card-content">
        {/* 标题 */}
        <Text className="collection-card-title">
          {collection.title}
        </Text>
        
        {/* 编号 */}
        <Text className="collection-card-info">
          编号：{collection.number}
        </Text>
        
        {/* 分类 */}
        {collection.category && (
          <Text className="collection-card-info">
            分类：{collection.category}
          </Text>
        )}
        
        {/* 价格 */}
        <Text className="collection-card-price">
          价格：{formatPrice(collection.price)}
        </Text>
        
        {/* 描述 */}
        {collection.description && (
          <Text className="collection-card-description">
            {collection.description}
          </Text>
        )}
        
        {/* 操作按钮 */}
        <View className="collection-card-actions">
          {/* 查看按钮 - 只在画集类型时显示 */}
          {!isProduct && (
            <Button
              className="collection-card-button collection-card-button-primary"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(collection);
              }}
            >
              <Text className="text-sm">👁️</Text>
              <Text>查看画集</Text>
            </Button>
          )}
          
          {/* 加入购物车按钮 - 商品类型时占满宽度 */}
          <AddToCartButton
            collection={collection}
            userId={userId}
            className={isProduct ? "collection-card-button-full" : "collection-card-button-flex"}
            size="md"
          />
        </View>
      </View>
    </View>
  );
}; 