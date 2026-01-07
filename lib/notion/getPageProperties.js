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
  const properties = {}

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
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
        case 'person': {
          const rawUsers = val.flat()
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await notionAPI.getUsers(userId)
              const resValue = res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              users.push({
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              })
            }
          }
          properties[schema[key].name] = users
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

  // 关键：不再使用 MD5 加密，直接提取明文密码
  properties.password = properties.password || properties['password'] || ''

  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.category = properties.category?.[0] || ''
  properties.publishDate = new Date(properties?.date?.start_date || value.created_time).getTime()
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.lastEditedDate = new Date(value?.last_edited_time).getTime()
  properties.fullWidth = value?.format?.page_full_width ?? false
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''
  properties.pageCover = mapImgUrl(value?.format?.page_cover, value) ?? ''
  properties.pageCoverThumbnail = mapImgUrl(value?.format?.page_cover, value, 'block') ?? ''
  properties.ext = convertToJSON(properties?.ext)
  properties.content = value.content ?? []
  properties.tagItems = properties?.tags?.map(tag => ({
    name: tag,
    color: tagOptions?.find(t => t.value === tag)?.color || 'gray'
  })) || []

  mapProperties(properties)
  delete properties.content
  return properties
}

function convertToJSON(str) {
  if (!str) return {}
  try { return JSON.parse(str.replace(/\s/g, '')) } catch (error) { return {} }
}

function mapProperties(properties) {
  const typeMap = { [BLOG.NOTION_PROPERTY_NAME.type_post]: 'Post', [BLOG.NOTION_PROPERTY_NAME.type_page]: 'Page', [BLOG.NOTION_PROPERTY_NAME.type_notice]: 'Notice', [BLOG.NOTION_PROPERTY_NAME.type_menu]: 'Menu', [BLOG.NOTION_PROPERTY_NAME.type_sub_menu]: 'SubMenu' }
  const statusMap = { [BLOG.NOTION_PROPERTY_NAME.status_publish]: 'Published', [BLOG.NOTION_PROPERTY_NAME.status_invisible]: 'Invisible' }
  if (properties?.type && typeMap[properties.type]) properties.type = typeMap[properties.type]
  if (properties?.status && statusMap[properties.status]) properties.status = statusMap[properties.status]
}

export function adjustPageProperties(properties, NOTION_CONFIG) {
  if (properties.type === 'Post' || properties.type === 'Page') {
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Menu' || properties.type === 'SubMenu') {
    properties.href = properties.slug ?? '#'
    properties.name = properties.title ?? ''
  }
  if (checkStartWithHttp(properties?.href)) {
    properties.target = '_blank'
  } else {
    properties.target = '_self'
    properties.href = convertUrlStartWithOneSlash(properties?.href || '')
  }
}
