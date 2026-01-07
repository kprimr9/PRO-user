import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../utils/formatDate'
import { siteConfig } from '../config'
import {
  checkStartWithHttp,
  convertUrlStartWithOneSlash,
  getLastSegmentFromUrl
} from '../utils'
import { extractLangPrefix } from '../utils/pageId'
import { mapImgUrl } from './mapImage'
import notionAPI from '@/lib/notion/getNotionAPI'

export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const rawProperties = Object.entries(value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = { id } // 确保 ID 被保留

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        default:
          break
      }
    }
  }

  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]])
        properties[key] = properties[fieldNames[key]]
    })
  }

  // 核心：强制抓取明文密码，绝不加密
  properties.password = properties.password || properties['password'] || ''
  
  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.publishDate = new Date(properties?.date?.start_date || value.created_time).getTime()
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.fullWidth = value?.format?.page_full_width ?? false
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''
  properties.pageCoverThumbnail = mapImgUrl(value?.format?.page_cover, value, 'block') ?? ''

  mapProperties(properties)
  return properties
}

function mapProperties(properties) {
  const typeMap = { [BLOG.NOTION_PROPERTY_NAME.type_post]: 'Post', [BLOG.NOTION_PROPERTY_NAME.type_page]: 'Page' }
  const statusMap = { [BLOG.NOTION_PROPERTY_NAME.status_publish]: 'Published', [BLOG.NOTION_PROPERTY_NAME.status_invisible]: 'Invisible' }
  if (properties?.type && typeMap[properties.type]) properties.type = typeMap[properties.type]
  if (properties?.status && statusMap[properties.status]) properties.status = statusMap[properties.status]
}

export function adjustPageProperties(properties, NOTION_CONFIG) {
  properties.href = convertUrlStartWithOneSlash(properties.slug || properties.id)
  properties.target = '_self'
}
