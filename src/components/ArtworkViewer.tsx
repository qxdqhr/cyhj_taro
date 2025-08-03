/**
 * 作品查看器组件 (ArtworkViewer) - Taro 版本
 * 
 * 用于展示单个作品的详细内容，支持翻页操作
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { View, Image, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ArtworkPage } from '../types';

interface ArtworkViewerProps {
  artwork: ArtworkPage;
  collectionId: number;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const ArtworkViewer: React.FC<ArtworkViewerProps> = ({
  artwork,
  collectionId,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  // 🚀 图片加载逻辑 - 优先使用imageUrl，不再支持Base64
  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true);
      setImageError(false);
      
      try {
        // 优先使用image（通过通用文件服务或API获取）
        if (artwork.image) {
          // 直接使用image，不再需要转换为blob
          setImageSrc(artwork.image);
          setImageLoading(false);
          return;
        }
        
        // 如果没有imageUrl，尝试使用fileId构建URL
        if (artwork.fileId) {
          const imageUrl = `/api/masterpieces/collections/${collectionId}/artworks/${artwork.id}/image`;
          setImageSrc(imageUrl);
          setImageLoading(false);
          return;
        }
        
        throw new Error('无图片数据');
      } catch (error) {
        console.error('图片加载失败:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [artwork.id, artwork.image, artwork.fileId, collectionId]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const retryImageLoad = () => {
    setImageError(false);
    setImageLoading(true);
    // 重新触发useEffect中的图片加载逻辑
    const currentSrc = imageSrc;
    setImageSrc('');
    setTimeout(() => {
      setImageSrc(currentSrc);
    }, 100);
  };

  return (
    <View className="artwork-viewer">
      <View className="artwork-viewer-container">
        {/* 图片加载状态 */}
        {imageLoading && (
          <View className="artwork-viewer-loading">
            <View className="artwork-viewer-loading-spinner"></View>
            <Text className="mt-4 text-slate-600">加载中...</Text>
          </View>
        )}

        {/* 图片错误状态 */}
        {imageError && (
          <View className="artwork-viewer-error">
            <Text className="artwork-viewer-error-icon">🖼️</Text>
            <Text className="artwork-viewer-error-text">图片加载失败</Text>
            <Button 
              onClick={retryImageLoad}
              className="artwork-viewer-retry-button"
            >
              重试
            </Button>
          </View>
        )}

        {/* 主图片 - 只有在有图片源且未出错时才显示 */}
        {imageSrc && !imageError && (
          <Image
            src={imageSrc}
            mode="aspectFit"
            className={`artwork-viewer-image ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* 翻页按钮 */}
        <Button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`artwork-viewer-nav-button artwork-viewer-nav-button-prev ${
            canGoPrev ? '' : 'artwork-viewer-nav-button-disabled'
          }`}
          aria-label="上一张"
        >
          <Text className="artwork-viewer-nav-button-icon">◀</Text>
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className={`artwork-viewer-nav-button artwork-viewer-nav-button-next ${
            canGoNext ? '' : 'artwork-viewer-nav-button-disabled'
          }`}
          aria-label="下一张"
        >
          <Text className="artwork-viewer-nav-button-icon">▶</Text>
        </Button>
      </View>
      
      {/* 作品信息 */}
      <View className="artwork-viewer-info">
        <Text className="artwork-viewer-title">{artwork.title}</Text>
        <Text className="artwork-viewer-detail">编号：{artwork.number}</Text>
        {artwork.createdTime && (
          <Text className="artwork-viewer-detail">创作时间：{artwork.createdTime}</Text>
        )}
        {artwork.theme && (
          <Text className="artwork-viewer-detail">主题：{artwork.theme}</Text>
        )}
        {artwork.description && (
          <Text className="artwork-viewer-description">{artwork.description}</Text>
        )}
      </View>
    </View>
  );
}; 