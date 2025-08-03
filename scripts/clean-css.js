const fs = require('fs');
const path = require('path');

// 清理CSS文件中的有问题的类名
function cleanCSSFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 移除包含转义字符的CSS规则
    const lines = content.split('}');
    const cleanedLines = lines.filter(line => {
      // 过滤掉包含 \ 的类名
      return !line.includes('\\');
    });
    
    const cleanedContent = cleanedLines.join('}');
    
    // 写入清理后的内容
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log(`✅ 已清理CSS文件: ${filePath}`);
  } catch (error) {
    console.error(`❌ 清理CSS文件失败: ${filePath}`, error);
  }
}

// 清理dist目录下的CSS文件
const distPath = path.join(__dirname, '../dist');
const cssFiles = ['app-origin.wxss', 'app.wxss'];

cssFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    cleanCSSFile(filePath);
  }
});

console.log('🎉 CSS清理完成！'); 