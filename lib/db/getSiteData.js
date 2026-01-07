import BLOG from '@/blog.config'
import { getOrSetDataWithCache } from '@/lib/cache/cache_manager'
import { getAllCategories } from '@/lib/notion/getAllCategories'
import getAllPageIds from '@/lib/notion/getAllPageIds'
import { getAllTags } from '@/lib/notion/getAllTags'
import { getConfigMapFromConfigPage } from '@/lib/notion/getNotionConfig'
import getPageProperties, {
  adjustPageProperties
} from '@/lib/notion/getPageProperties'
import { fetchInBatches, getPage } from '@/lib/notion/getPostBlocks'
import { compressImage, mapImgUrl } from '@/lib/notion/mapImage'
import { deepClone } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import { siteConfig } from '../config'
import { extractLangId, extractLangPrefix, getShortId } from '../utils/pageId'

export { getAllTags } from '../notion/getAllTags'
export { getPost } from '../notion/getNotionPost'
export { getPage as getPostBlocks } from '../notion/getPostBlocks'

export async function getGlobalData({
  pageId = BLOG.NOTION_PAGE_ID,
  from,
  locale
}) {
  const siteIds = pageId?.split(',') || []
  let data = EmptyData(pageId)
  try {
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const id = extractLangId(siteId)
      const prefix = extractLangPrefix(siteId)
      if (index === 0 || locale === prefix) {
        data = await getSiteDataByPageId({
          pageId: id,
          from
        })
      }
    }
  } catch (error) {
    console.error('异常', error)
  }
  return handleDataBeforeReturn(deepClone(data))
}

export async function getSiteDataByPageId({ pageId, from }) {
  return await getOrSetDataWithCache(
    `site_data_${pageId}`,
    async (pageId, from) => {
      const pageRecordMap = await getPage(pageId, from)
      return convertNotionToSiteDate(pageId, from, deepClone(pageRecordMap))
    },
    pageId,
    from
  )
}

async function getNotice(post) {
  if (!post) return null
  post.blockMap = await getPage(post.id, 'data-notice')
  return post
}

const EmptyData = pageId => ({
  notice: null,
  siteInfo: getSiteInfo({}),
  allPages: [{ id: 1, title: `加载中...`, status: 'Published', type: 'Post', slug: 'oops' }],
  allNavPages: [],
  tagOptions: [],
  categoryOptions: [],
  customNav: [],
  customMenu: [],
  postCount: 0,
  latestPosts: []
})

async function convertNotionToSiteDate(pageId, from, pageRecordMap) {
  if (!pageRecordMap) return {}
  pageId = idToUuid(pageId)
  let block = pageRecordMap.block || {}
  const rawMetadata = block[pageId]?.value
  if (rawMetadata?.type !== 'collection_view_page' && rawMetadata?.type !== 'collection_view') {
    return EmptyData(pageId)
  }
  const collection = Object.values(pageRecordMap.collection)[0]?.value || {}
  const collectionId = rawMetadata?.collection_id
  const schema = collection?.schema
  const pageIds = getAllPageIds(pageRecordMap.collection_query, collectionId, pageRecordMap.collection_view, rawMetadata?.view_ids)
  const blockIdsNeedFetch = pageIds.filter(id => !block[id]?.value)
  const fetchedBlocks = await fetchInBatches(blockIdsNeedFetch)
  block = Object.assign({}, block, fetchedBlocks)

  const collectionData = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value || fetchedBlocks[id]?.value
    const props = await getPageProperties(id, value, schema, null, [])
    if (props) collectionData.push(props)
  }

  const NOTION_CONFIG = (await getConfigMapFromConfigPage(collectionData)) || {}
  collectionData.forEach(element => adjustPageProperties(element, NOTION_CONFIG))
  const siteInfo = getSiteInfo({ collection, block, NOTION_CONFIG })

  // 【核心修改】不拦截 Invisible 或 Page 类型的页面，只要有 Slug 统统放行给登录窗使用
  const allPages = collectionData.filter(post => post && post.slug)

  const categoryOptions = getAllCategories({ allPages, categoryOptions: getCategoryOptions(schema) })
  const tagOptions = getAllTags({ allPages, tagOptions: getTagOptions(schema), NOTION_CONFIG }) || null
  const customNav = getCustomNav({ allPages: collectionData.filter(p => p.status === 'Published') })
  const customMenu = await getCustomMenu({ collectionData, NOTION_CONFIG })
  const latestPosts = allPages.slice(0, 6)
  const allNavPages = allPages

  return { NOTION_CONFIG, siteInfo, allPages, allNavPages, tagOptions, categoryOptions, customNav, customMenu, latestPosts }
}

function handleDataBeforeReturn(db) {
  delete db.block
  delete db.schema
  delete db.rawMetadata
  
  // 【关键修改】注释掉这两行，防止会员页面因为没有 Tag 而被系统过滤删掉
  // db.allNavPages = cleanPages(db?.allNavPages, db.tagOptions)
  // db.allPages = cleanPages(db.allPages, db.tagOptions)

  return db
}

function cleanPages(allPages, tagOptions) { return allPages }
function shortenIds(items) { return items }
function cleanIds(items) { return items }
function cleanBlock(item) { return item }
function getLatestPosts({ allPages, latestPostCount }) { return allPages.slice(0, latestPostCount) }

function getCustomNav({ allPages }) {
  const nav = []
  allPages.forEach(p => { nav.push({ name: p.title || '', href: p.href, show: true }) })
  return nav
}

function getCustomMenu({ collectionData, NOTION_CONFIG }) {
  return collectionData.filter(p => p.status === 'Published' && (p.type === 'Menu' || p.type === 'SubMenu'))
}

function getTagOptions(schema) {
  if (!schema) return []
  return Object.values(schema).find(e => e.name === BLOG.NOTION_PROPERTY_NAME.tags)?.options || []
}

function getCategoryOptions(schema) {
  if (!schema) return []
  return Object.values(schema).find(e => e.name === BLOG.NOTION_PROPERTY_NAME.category)?.options || []
}

function getSiteInfo({ collection, NOTION_CONFIG }) {
  return {
    title: collection?.name?.[0][0] || 'PRO+',
    description: NOTION_CONFIG?.DESCRIPTION || 'Favorites',
    pageCover: '/bg_image.jpg',
    icon: '/avatar.svg'
  }
}

function isInRange() { return true }
export function getNavPages({ allPages }) { return allPages }
