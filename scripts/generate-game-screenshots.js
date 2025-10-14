const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 游戏页面列表
const games = [
  { 
    name: "counting", 
    url: "http://localhost:3003/number-sense/games/counting",
    output: "public/images/counting-game.png"
  },
  { 
    name: "matching", 
    url: "http://localhost:3003/number-sense/games/matching",
    output: "public/images/matching-game.png"
  },
  { 
    name: "sequence", 
    url: "http://localhost:3003/number-sense/games/sequence",
    output: "public/images/sequence-game.png"
  },
  { 
    name: "odd-even", 
    url: "http://localhost:3003/number-sense/patterns/odd-even",
    output: "public/images/odd-even-game.png"
  },
  { 
    name: "skipcountinggame", 
    url: "http://localhost:3003/number-sense/patterns/skipcountinggame",
    output: "public/images/skip-counting-game.png"
  },
  { 
    name: "comparison", 
    url: "http://localhost:3003/number-sense/basics/comparison",
    output: "public/images/comparison-game.png"
  },
  { 
    name: "estimation", 
    url: "http://localhost:3003/number-sense/basics/estimation",
    output: "public/images/estimation-game.png"
  },
];

async function generateScreenshots() {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  
  for (const game of games) {
    try {
      console.log(`正在生成 ${game.name} 的截图...`);
      const page = await browser.newPage();
      
      // 设置视口大小
      await page.setViewport({ width: 800, height: 600 });
      
      // 访问游戏页面
      await page.goto(game.url, { waitUntil: 'networkidle2' });
      
      // 等待页面加载完成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 截图并保存
      try {
        await page.screenshot({ 
          path: game.output,
          fullPage: false,
          clip: { x: 0, y: 0, width: 800, height: 600 }
        });
        console.log(`已保存 ${game.name} 的截图到 ${game.output}`);
      } catch (screenshotError) {
        console.error(`保存 ${game.name} 的截图时出错:`, screenshotError);
      }
      await page.close();
    } catch (error) {
      console.error(`生成 ${game.name} 的截图时出错:`, error);
    }
  }
  
  await browser.close();
  console.log('所有截图生成完成！');
}

generateScreenshots().catch(console.error);
