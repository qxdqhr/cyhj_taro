/**
 * 九宫格分类组件
 * 
 * 以九宫格形式展示商品分类，支持图标、名称和数量显示
 */

import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { CollectionCategory, CollectionCategoryType } from '../types';

interface CategoryGridProps {
  /** 当前选中的分类 */
  selectedCategory: CollectionCategoryType;
  /** 分类选择回调 */
  onCategorySelect: (category: CollectionCategoryType) => void;
  /** 各分类的商品数量 */
  categoryCounts: Record<CollectionCategoryType, number>;
}



// 分类颜色映射
const categoryColors: Record<CollectionCategoryType, string> = {
  [CollectionCategory.COLLECTION]: '#3b82f6',
  [CollectionCategory.ACRYLIC]: '#8b5cf6',
  [CollectionCategory.BADGE]: '#f59e0b',
  [CollectionCategory.COLOR_PAPER]: '#10b981',
  [CollectionCategory.POSTCARD]: '#ef4444',
  [CollectionCategory.LASER_TICKET]: '#06b6d4',
  [CollectionCategory.CANVAS_BAG]: '#84cc16',
  [CollectionCategory.SUPPORT_STICK]: '#f97316',
  [CollectionCategory.OTHER]: '#6b7280'
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onCategorySelect,
  categoryCounts
}) => {
  const categories = Object.values(CollectionCategory);

  return (
    <View className="category-grid">
      <View className="category-grid-title">
        <Text className="category-grid-title-text">商品分类</Text>
      </View>
      
      <View className="category-grid-container">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const count = categoryCounts[category] || 0;
          
          return (
            <View
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`category-grid-item ${isSelected ? 'category-grid-item-active' : ''}`}
              style={{
                backgroundColor: isSelected ? `${categoryColors[category]}10` : 'transparent'
              }}
            >
              <View className="category-grid-item-content">
                <View className="category-grid-item-info">
                  <Text 
                    className="category-grid-item-name"
                    style={{ color: isSelected ? categoryColors[category] : '#1e293b' }}
                  >
                    {category}
                  </Text>
                  <Text className="category-grid-item-count">
                    {count} 件
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}; 