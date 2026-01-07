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

// 【恢复关键导出】确保其他页面构建不报错
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
  if (BLOG.BUNDLE_ANALYZER) return data

  try {
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const id = extractLangId(siteId)
      const prefix = extractLangPrefix(siteId)
      if (index === 0 || locale === prefix) {
        data = await getSiteDataByPageId({ pageId: id, from })
      }
    }
  } catch (error) {
    console.error('getGlobalData Error', error)
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

async function convertNotionToSiteDate(pageId, from, pageRecordMap) {
  if (!pageRecordMap) return {}
  pageId = idToUuid(pageId)
  let block = pageRecordMap.block || {}
  const rawMetadata = block[pageId]?.value
  if (rawMetadata?.type !== 'collection_view_page' && rawMetadata?.type !== 'collection_view') {
    return EmptyData(pageId)
  }
  
  const collection = pageRecordMap.collection ? Object.values(pageRecordMap.collection)[0]?.value : {}
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

  // 【放开过滤】允许所有带 Slug 的页面通过，无论 status 是 Published 还是 Invisible
  const allPages = collectionData.filter(post => post && post.slug)

  return {
    NOTION_CONFIG,
    siteInfo: getSiteInfo({ collection, block, NOTION_CONFIG }),
    allPages,
    allNavPages: allPages,
    latestPosts: allPages.slice(0, 6)
  }
}

function handleDataBeforeReturn(db) {
  // 删掉没用的数据减小体积
  delete db.block
  delete db.schema
  delete db.rawMetadata
  // 【关键】禁止调用 cleanPages，防止将会员页过滤掉
  return db
}

const EmptyData = pageId => ({ siteInfo: {}, allPages: [], allNavPages: [], latestPosts: [] })
function getCustomNav({ allPages }) { return [] }
async function getCustomMenu({ c
