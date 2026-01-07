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

/**
 * 获取博客数据; 基于Notion实现
 */
export async function getGlobalData({
  pageId = BLOG.NOTION_PAGE_ID,
  from,
  locale
}) {
  const siteIds = pageId?.split(',') || []
  let data = EmptyData(pageId)

  if (BLOG.BUNDLE_ANALYZER) {
    return data
  }

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
    console.error('获取全局数据异常', error)
  }
  return handleDataBeforeReturn(deepClone(data))
}

/**
 * 获取指定notion的collection数据
 */
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
  allPages: [{ id: 1, title: `数据加载中...`, status: 'Published', type: 'Post', slug: 'oops' }],
  allNavPages: [],
  tagOptions: [],
  categoryOptions: [],
  customNav: [],
  customMenu: [],
  postCount: 0,
  latestPosts: []
})

/**
 * 将Notion数据转站点数据
 */
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
  const viewIds = rawMetadata?.view_ids
  const collectionData = []

  const pageIds = getAllPageIds(pageRecordMap.collection_query, collectionId, pageRecordMap.collection_view, viewIds)

  const blockIdsNeedFetch = []
  for (let i = 0; i < pageIds.length; i++) {
    if (!block[pageIds[i]]?.value) blockIdsNeedFetch.push(pageIds[i])
  }
  const fetchedBlocks = await fetchInBatches(blockIdsNeedFetch)
  block = Object.assign({}, block, fetchedBlocks)

  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value || fetchedBlocks[id]?.value
    const props = await getPageProperties(id, value, schema, null, getTagOptions(schema))
    if (props) collectionData.push(props)
  }

  const NOTION_CONFIG = (await getConfigMapFromConfigPage(collectionData)) || {}
  collectionData.forEach(element => adjustPageProperties(element, NOTION_CONFIG))

  const siteInfo = getSiteInfo({ collection, block, NOTION_CONFIG })
  
  // 核心：确保全量数据通过，不被 status 或 type 轻易拦截
  const allPages = collectionData.filter(post => {
    return post && post.slug && (post.status === 'Published' || post.status === 'Invisible')
  })

  const categoryOptions = getAllCategories({ allPages, categoryOptions: getCategoryOptions(schema) })
  const tagOptions = getAllTags({ allPages, tagOptions: getTagOptions(schema), NOTION_CONFIG }) || null
  const customNav = getCustomNav({ allPages: collectionData.filter(p => p.status === 'Published') })
  const customMenu = await getCustomMenu({ collectionData, NOTION_CONFIG })
  const latestPosts = allPages.slice(0, 6)
  const allNavPages = allPages

  return { NOTION_CONFIG, siteInfo, allPages, allNavPages, tagOptions, categoryOptions, customNav, customMenu, latestPosts }
}

/**
 * 【关键】返回给前端前的数据处理 - 停止清洗
 */
function handleDataBeforeReturn(db) {
  // 仅仅删除巨大的 block 对象以减小体积，不再调用 cleanPages
  delete db.block
  delete db.schema
  delete db.rawMetadata
  delete db.pageIds
  delete db.viewIds
  delete db.collection
  delete db.collectionQuery
  
  // --- 这里的 cleanPages 是导致自定义属性消失的元凶，现在将其注释掉 ---
  // db.allNavPages = cleanPages(db?.allNavPages, db.tagOptions)
  // db.allPages = cleanPages(db.allPages, db.tagOptions)
  
  return db
}

/**
 * 辅助函数保持原样，但 handleDataBeforeReturn 不再主动调用它们
 */
function cleanPages(allPages, tagOptions) { return allPages }
function shortenIds(items) { return items }
function cleanIds(items) { return items }

function getCustomNav({ allPages }) {
  const nav = []
  allPages.forEach(p => {
    nav.push({ icon: p.icon || null, name: p.title || '', href: p.href, target: p.target, show: true })
  })
  return nav
}

async function getCustomMenu({ collectionData, NOTION_CONFIG }) {
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

function getSiteInfo({ collection, block, NOTION_CONFIG }) {
  return {
    title: collection?.name?.[0][0] || 'PRO+',
    description: NOTION_CONFIG?.DESCRIPTION || 'Member System',
    pageCover: mapImgUrl(collection?.cover, collection, 'collection') || '/bg_image.jpg',
    icon: compressImage(mapImgUrl(collection?.icon, collection, 'collection') || '/avatar.svg')
  }
}

export function getNavPages({ allPages }) {
  return allPages.map(item => ({ title: item.title, slug: item.slug, href: item.href }))
}
