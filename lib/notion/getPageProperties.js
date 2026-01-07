import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../utils/formatDate'
import { mapImgUrl } from './mapImage'

export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const rawProperties = Object.entries(value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = { id }

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    }
  }

  // 映射键：用户自定义表头名
  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]])
        properties[key] = properties[fieldNames[key]]
    })
  }

  // 确保抓取我们重命名后的 member_pwd
  properties.member_pwd = properties.member_pwd || properties['password'] || ''
  // 强行清空系统自带的 password 属性，彻底禁用内置锁屏
  properties.password = ''

  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.slug = properties.slug || ''
  properties.publishDate = new Date(properties?.date?.start_date || value.created_time).getTime()
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''

  return properties
}

export function adjustPageProperties(properties) {
  properties.href = '/' + (properties.slug || properties.id)
  properties.target = '_self'
}
