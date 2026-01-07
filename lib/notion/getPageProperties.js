import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../utils/formatDate'
import { mapImgUrl } from './mapImage'

export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const rawProperties = Object.entries(value?.properties || [])
  const properties = { id }

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    if (schema[key]?.name) {
      properties[schema[key].name] = getTextContent(val)
    }
  }

  // --- 关键修改：隐藏密码列 ---
  // 我们从 Notion 原始数据里直接抓取 'password' 列
  const rawPwd = properties['password'] || ''
  
  // 1. 把真正的密码存在这个新变量里，给我们的登录弹窗用
  properties.member_pwd = rawPwd 
  
  // 2. 把系统自带的 password 变量强行清空，防止弹出自带的验证框
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
