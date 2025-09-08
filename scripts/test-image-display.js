const fs = require('fs');
const path = require('path');

// 检查图片文件是否存在
const imageDir = path.join(__dirname, '..', 'public', 'images');
const images = [
  'counting-game.png',
  'matching-game.png',
  'sequence-game.png',
  'odd-even-game.png',
  'skip-counting-game.png',
  'comparison-game.png',
  'estimation-game.png'
];

console.log('检查生成的游戏截图...');

if (!fs.existsSync(imageDir)) {
  console.log('错误: 图片目录不存在');
  process.exit(1);
}

const missingImages = [];
const existingImages = [];

images.forEach(image => {
  const imagePath = path.join(imageDir, image);
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log(`✓ ${image} - ${stats.size} bytes`);
    existingImages.push(image);
  } else {
    console.log(`✗ ${image} - 未找到`);
    missingImages.push(image);
  }
});

console.log(`\n总结:`);
console.log(`找到 ${existingImages.length} 个图片文件`);
console.log(`缺失 ${missingImages.length} 个图片文件`);

if (missingImages.length > 0) {
  console.log(`缺失的图片: ${missingImages.join(', ')}`);
}

console.log('\n所有检查完成!');
