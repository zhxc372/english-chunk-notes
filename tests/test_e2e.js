
const { chromium } = require('playwright');

(async () => {
  const results = [];
  const check = (name, ok, detail) => {
    results.push({ name, ok, detail });
    process.stdout.write(ok ? '  ✅ ' : '  ❌ ');
    process.stdout.write(name + (detail ? ' — ' + detail : '') + '\n');
  };

  const dist = 'docs/.vitepress/dist';
  const baseURL = 'file://' + require('path').resolve(dist);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 1. 首页加载
    await page.goto(baseURL + '/index.html', { timeout: 10000 });
    check('首页加载', true);

    // 2. 首页有内容
    const title = await page.title();
    check('首页有标题', title.length > 0, title);

    // 3. 导航到主题列表
    await page.goto(baseURL + '/themes/index.html', { timeout: 10000 });
    const themesContent = await page.textContent('body');
    check('主题列表页有内容', themesContent.length > 100, themesContent.length + ' chars');

    // 4. 主题列表包含所有5个主题
    const themes = ['AI Coding', 'Education', 'Work', 'Software Engineering', 'Project Management'];
    for (const t of themes) {
      check(`主题列表含 "${t}"`, themesContent.includes(t));
    }

    // 5. 导航到 AI Coding Workflow
    await page.goto(baseURL + '/themes/ai-coding-workflow.html', { timeout: 10000 });
    const lessonContent = await page.textContent('body');
    check('AI Coding 页面加载', lessonContent.length > 100);

    // 6. 检查 chunk 卡片渲染
    const chunkCount = (lessonContent.match(/chunk/gi) || []).length;
    check('AI Coding 页面有chunk内容', chunkCount > 5, `${chunkCount} matches`);

    // 7. 导航到教育学习
    await page.goto(baseURL + '/themes/education-learning.html', { timeout: 10000 });
    const eduContent = await page.textContent('body');
    check('Education 页面加载', eduContent.length > 100);

    // 8. 导航到闪卡页面
    await page.goto(baseURL + '/flashcards.html', { timeout: 10000 });
    const flashContent = await page.textContent('body');
    check('闪卡页面加载', flashContent.length > 50);

    // 9. 导航到收藏页面
    await page.goto(baseURL + '/favorites.html', { timeout: 10000 });
    const favContent = await page.textContent('body');
    check('收藏页面加载', favContent.length > 50);

    // 10. 导航到技术英语页面
    await page.goto(baseURL + '/tech-english.html', { timeout: 10000 });
    const techContent = await page.textContent('body');
    check('技术英语页面加载', techContent.length > 100);

    // 11. 404页面
    await page.goto(baseURL + '/nonexistent.html', { timeout: 10000 });
    const notFound = await page.textContent('body');
    check('404页面可访问', notFound.length > 0);

    // 12. 控制台无JS错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(baseURL + '/index.html', { timeout: 10000 });
    await page.waitForTimeout(2000);
    check('首页无JS错误', errors.length === 0,
      errors.length > 0 ? errors.slice(0,3).join('; ') : '');

    // 13. 所有图片/资源可加载
    const resources = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs).map(img => ({
        src: img.src,
        ok: img.complete && img.naturalWidth > 0
      }));
    });
    const brokenImgs = resources.filter(r => !r.ok);
    check('首页图片全部加载', brokenImgs.length === 0,
      brokenImgs.length > 0 ? brokenImgs.map(b => b.src).join('; ') : '');

    // 14. CSS 加载
    const cssLoaded = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      return links.length > 0;
    });
    check('首页CSS已加载', cssLoaded);

    // 15. LessonPage 组件渲染（检查 Vue 挂载）
    await page.goto(baseURL + '/themes/work-career.html', { timeout: 10000 });
    const workContent = await page.textContent('body');
    check('Work Career 页面加载', workContent.length > 100);

    // 16. Software Engineering 页面
    await page.goto(baseURL + '/themes/software-engineering.html', { timeout: 10000 });
    const seContent = await page.textContent('body');
    check('Software Engineering 页面加载', seContent.length > 100);

    // 17. Project Management 页面
    await page.goto(baseURL + '/themes/project-management.html', { timeout: 10000 });
    const pmContent = await page.textContent('body');
    check('Project Management 页面加载', pmContent.length > 100);

    // 18. 首页链接可点击
    await page.goto(baseURL + '/index.html', { timeout: 10000 });
    const links = await page.$$('a[href]');
    const hrefs = [];
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('http')) {
        hrefs.push(href);
      }
    }
    check('首页有导航链接', hrefs.length > 0, `找到 ${hrefs.length} 个`);

  } catch (e) {
    check('E2E 执行', false, e.message.substring(0, 200));
  } finally {
    await browser.close();
  }

  const passCount = results.filter(r => r.ok).length;
  const failCount = results.filter(r => !r.ok).length;
  process.stdout.write('\nE2E 测试: ' + passCount + ' 通过, ' + failCount + ' 失败\n');
  process.exit(failCount > 0 ? 1 : 0);
})();
