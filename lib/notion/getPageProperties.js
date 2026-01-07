import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../utils/formatDate'
import { mapImgUrl } from './mapImage'

/**
 * 获取页面元素成员属性
 */
export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const rawProperties = Object.entries(value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = { id }

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    if (schema[key]?.name) {
      properties[schema[key].name] = getTextContent(val)
    }
  }

  // --- 【核心修改】绕过内置密码锁 ---
  // 1. 获取 Notion 数据库中原本名为 'password' 的列内容
  const realPassword = properties.password || properties['password'] || ''
  
  // 2. 将真实密码转存到 member_pwd（系统不认识这个变量，所以不会锁屏）
  properties.member_pwd = String(realPassword).trim()
  
  // 3. 强行将系统识别的 password 置空，彻底禁用自带的二次验证界面
  properties.password = '' 
  // --------------------------------

  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.slug = properties.slug || ''
  properties.publishDate = new Date(properties?.date?.start_date || value.created_time).getTime()
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''

  // 映射自定义表头名（如果配置了）
  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]]) {
        properties[key] = properties[fieldNames[key]]
      }
    })
  }

  return properties
}

/**
 * 调整页面路径映射
 */
export function adjustPageProperties(properties) {
  properties.href = '/' + (properties.slug || properties.id)
  properties.target = '_self'
}
