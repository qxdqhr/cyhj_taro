/**
 * Collection 页面组件
 * 
 * 画集详情页面，用于展示特定画集的详细信息
 * 这个页面可以通过路由参数接收画集ID，然后展示对应的画集内容
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useMasterpieces } from '../../hooks/useMasterpieces';
import { ArtworkViewer, ThumbnailSidebar } from '../../components';

/**
 * Collection 页面组件
 * 
 * @returns React函数组件
 */
export default function CollectionPage() {
  const router = useRouter();
  const { collectionId } = router.params;
  
  const {
    collections,
    selectedCollection,
    currentPage,
    getCurrentArtwork,
    canGoNext,
    canGoPrev,
    nextPage,
    prevPage,
    goToPage,
    selectCollection,
  } = useMasterpieces();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId && collections.length > 0) {
      const collection = collections.find(c => c.id.toString() === collectionId);
      if (collection) {
        selectCollection(collection);
      }
      setLoading(false);
    }
  }, [collectionId, collections, selectCollection]);

  if (loading) {
    return (
      <View className="collection-page-loading">
        <View className="collection-page-loading-content">
          <View className="collection-page-loading-spinner"></View>
          <Text className="collection-page-loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  if (!selectedCollection) {
    return (
      <View className="collection-page-error">
        <View className="collection-page-error-content">
          <Text className="collection-page-error-title">画集不存在</Text>
          <Button
            onClick={() => Taro.navigateBack()}
            className="collection-page-error-button"
          >
            返回
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="collection-page">
      {/* 顶部导航 */}
      <View className="collection-page-header">
        <View className="collection-page-header-content">
          <View className="collection-page-header-nav">
            <Button
              onClick={() => Taro.navigateBack()}
              className="collection-page-back-button"
            >
              <Text>◀</Text>
              <Text>返回</Text>
            </Button>
            <Text className="collection-page-title">
              {selectedCollection.title}
            </Text>
            <View className="collection-page-spacer"></View>
          </View>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className="collection-page-content">
        <View className="collection-page-layout">
          {/* 侧边栏：缩略图导航 */}
          <View className="collection-page-sidebar">
            <ThumbnailSidebar
              pages={selectedCollection.pages}
              currentPage={currentPage}
              onPageSelect={goToPage}
            />
          </View>
          
          {/* 主内容区：作品查看器 */}
          <View className="collection-page-main">
            {getCurrentArtwork() && (
              <ArtworkViewer
                artwork={getCurrentArtwork()!}
                collectionId={selectedCollection.id}
                onNext={nextPage}
                onPrev={prevPage}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
} 