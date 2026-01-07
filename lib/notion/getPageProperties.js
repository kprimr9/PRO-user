import { getTextContent } from 'notion-utils'
import formatDate from '../utils/formatDate'
import BLOG from '@/blog.config'

export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const properties = { id }
  const rawProps = value?.properties || {}
  
  // 遍历 schema，将 Notion 的列名映射到代码变量名
  Object.keys(schema).forEach(key => {
    const name = schema[key].name
    properties[name] = getTextContent(rawProps[key])
  })

  // 【核心】提取密码并隐藏原始 password 字段以防锁屏
  // 无论你在 Notion 里给密码列起什么名字，只要你在配置里映射了，或者它叫 password，都能抓到
  properties.member_pwd = properties.member_pwd || properties.password || properties['密码'] || ''
  properties.password = '' // 清空这个，防止弹出自带验证框

  properties.slug = properties.slug || ''
  properties.type = properties.type || ''
  properties.status = properties.status || ''

  return properties
}

export function adjustPageProperties(properties) {
  properties.href = '/' + properties.slug
}
