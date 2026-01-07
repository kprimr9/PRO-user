import BLOG from '@/blog.config'
import { getOrSetDataWithCache } from '@/lib/cache/cache_manager'
import getAllPageIds from '@/lib/notion/getAllPageIds'
import { getConfigMapFromConfigPage } from '@/lib/notion/getNotionConfig'
import getPageProperties, { adjustPageProperties } from '@/lib/notion/getPageProperties'
import { fetchInBatches, getPage } from '@/lib/notion/getPostBlocks'
import { compressImage, mapImgUrl } from '@/lib/notion/mapImage'
import { deepClone } from '@/lib/utils'
import { idToUuid } from 'notion-utils'

export async function getGlobalData({ pageId = BLOG.NOTION_PAGE_ID, from }) {
  const siteIds = pageId?.split(',') || []
  let data = { allPages: [] }
  try {
    const id = idToUuid(siteIds[0])
    data = await getSiteDataByPageId({ pageId: id, from })
  } catch (error) {
    console.error('获取数据异常', error)
  }
  return handleDataBeforeReturn(deepClone(data))
}

export async function getSiteDataByPageId({ pageId, from }) {
  return await getOrSetDataWithCache(`site_data_${pageId}`, async (pageId, from) => {
    const pageRecordMap = await getPage(pageId, from)
    let block = pageRecordMap.block || {}
    const rawMetadata = block[idToUuid(pageId)]?.value
    const collection = Object.values(pageRecordMap.collection)[0]?.value || {}
    const schema = collection?.schema
    const viewIds = rawMetadata?.view_ids
    
    const pageIds = getAllPageIds(pageRecordMap.collection_query, rawMetadata?.collection_id, pageRecordMap.collection_view, viewIds)
    const blockIdsNeedFetch = pageIds.filter(id => !block[id]?.value)
    const fetchedBlocks = await fetchInBatches(blockIdsNeedFetch)
    block = Object.assign({}, block, fetchedBlocks)

    const collectionData = []
    for (const id of pageIds) {
      const value = block[id]?.value
      const props = await getPageProperties(id, value, schema, null, [])
      if (props) collectionData.push(props)
    }

    const NOTION_CONFIG = (await getConfigMapFromConfigPage(collectionData)) || {}
    collectionData.forEach(element => adjustPageProperties(element, NOTION_CONFIG))

    // 【暴力放行】不进行任何 status 和 type 的过滤，确保 383 条数据全部通过
    const allPages = collectionData.filter(p => p.slug) 

    return { NOTION_CONFIG, allPages, siteInfo: { title: BLOG.TITLE } }
  }, pageId, from)
}

function handleDataBeforeReturn(db) {
  // 仅删除冗余块，绝对不调用任何 cleanPages 过滤器
  delete db.block
  delete db.schema
  delete db.rawMetadata
  return db
}
