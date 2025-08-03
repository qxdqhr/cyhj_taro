/**
 * 缩略图侧边栏组件 (ThumbnailSidebar) - Taro 版本
 * 
 * 用于展示作品集的缩略图导航，支持懒加载
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { View, Image, Text, Button, ScrollView } from '@tarojs/components';
import { ArtworkPage } from '../types';

interface ThumbnailSidebarProps {
  pages: ArtworkPage[];
  currentPage: number;
  onPageSelect: (pageIndex: number) => void;
}

interface ThumbnailItemProps {
  page: ArtworkPage;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

// 🚀 懒加载缩略图组件
const ThumbnailItem: React.FC<ThumbnailItemProps> = ({ page, index, isActive, onSelect }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  // 当组件可见时才加载图片
  useEffect(() => {
    if (!isVisible) return;

    const loadThumbnail = async () => {
      setImageLoading(true);
      setImageError(false);

      try {
        // 如果已有图片数据，直接使用
        if (page.image && page.image.trim() !== '') {
          setImageSrc(page.image);
          setImageLoading(false);
          return;
        }

        // 否则直接使用image
        if (page.image) {
          setImageSrc(page.image);
        } else {
          throw new Error('无图片数据');
        }
      } catch (error) {
        console.error('缩略图加载失败:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadThumbnail();
  }, [isVisible, page.id, page.image]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // 简单的可见性检测
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // 延迟加载，避免同时加载太多图片

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Button
      onClick={onSelect}
      className={`thumbnail-item ${isActive ? 'thumbnail-item-active' : ''}`}
      aria-label={`查看第 ${index + 1} 页：${page.title}`}
    >
      <View className="thumbnail-item-container">
        {/* 加载状态 */}
        {imageLoading && (
          <View className="thumbnail-loading">
            <View className="thumbnail-loading-spinner"></View>
          </View>
        )}

        {/* 错误状态 */}
        {imageError && (
          <View className="thumbnail-error">
            <Text className="thumbnail-error-icon">🖼️</Text>
          </View>
        )}

        {/* 缩略图 */}
        {imageSrc && !imageError && (
          <Image
            src={imageSrc}
            mode="aspectFill"
            className={`thumbnail-image ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            lazyLoad
          />
        )}
      </View>
      
      {/* 作品信息 */}
      <View className="thumbnail-info">
        <Text className="thumbnail-title">{page.title}</Text>
        <Text className="thumbnail-number">{page.number}</Text>
      </View>
    </Button>
  );
};

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPage,
  onPageSelect
}) => {
  return (
    <View className="thumbnail-sidebar">
      <View className="thumbnail-sidebar-header">
        <Text className="thumbnail-sidebar-title">作品列表</Text>
        <Text className="thumbnail-sidebar-counter">
          {currentPage + 1} / {pages.length}
        </Text>
      </View>
      
      <ScrollView 
        scrollY 
        className="thumbnail-sidebar-scroll"
        showScrollbar={false}
      >
        <View className="thumbnail-sidebar-content">
          {pages.map((page, index) => (
            <ThumbnailItem
              key={page.id}
              page={page}
              index={index}
              isActive={index === currentPage}
              onSelect={() => onPageSelect(index)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}; 