/**
 * fetch-article.ts - 从 URL 获取文章正文
 * 
 * 使用 cheerio 提取正文，支持代理
 */

import * as https from 'node:https'
import * as http from 'node:http'
import cheerio from 'cheerio'

const PROXY = process.env.HTTP_PROXY || process.env.http_proxy || 'http://127.0.0.1:7890'

interface FetchResult {
  url: string
  title: string
  text: string
  html: string
  publishedAt?: string
  author?: string
  siteName: string
}

function fetchViaProxy(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proxyUrl = new URL(PROXY)
    const parsedUrl = new URL(url)
    
    const options = {
      host: proxyUrl.hostname,
      port: parseInt(proxyUrl.port || '7890'),
      path: url,
      method: 'GET',
      headers: {
        'Host': parsedUrl.host,
        'User-Agent': 'Mozilla/5.0 (compatible; EnglishChunkNotes/1.0; +https://github.com/hooooorg/english-chunk-notes)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }

    const req = http.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        fetchViaProxy(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    })

    req.on('error', reject)
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Fetch timeout')) })
    req.end()
  })
}

export async function fetchArticle(url: string): Promise<FetchResult> {
  const html = await fetchViaProxy(url)
  const $ = cheerio.load(html)

  // Remove noise
  $('script, style, nav, footer, header, .ad, .ads, .advertisement, .sidebar, .comment, .social, iframe').remove()

  // Extract title
  const title = $('meta[property="og:title"]').attr('content')
    || $('title').text().trim()
    || ''

  // Extract site name
  const siteName = $('meta[property="og:site_name"]').attr('content')
    || new URL(url).hostname.replace('www.', '')
    || ''

  // Extract published date
  const publishedAt = $('meta[property="article:published_time"]').attr('content')
    || $('time[datetime]').attr('datetime')
    || $('time').text().trim()
    || undefined

  // Extract author
  const author = $('meta[name="author"]').attr('content')
    || $('[rel="author"]').text().trim()
    || undefined

  // Extract main text - try article tag first, then body
  const articleEl = $('article').first()
  const mainEl = $('main').first()
  const bodyEl = $('body').first()

  const targetEl = articleEl.length ? articleEl : mainEl.length ? mainEl : bodyEl

  // Get text with reasonable whitespace
  const text = targetEl.text()
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 20)
    .join(' ')

  return { url, title, text, html: targetEl.html() || '', publishedAt, author, siteName }
}
