import { getTextContent } from 'notion-utils'

export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const properties = { id }
  const rawProps = value?.properties || {}
  
  // 将 Notion 里的列映射到对象属性中
  if (schema) {
      Object.keys(schema).forEach(key => {
        const name = schema[key].name
        properties[name] = getTextContent(rawProps[key])
      })
  }

  // --- 【核心逻辑】 ---
  // 1. 抓取真实密码（无论列名是小写 password 还是你自定义的名字）
  const realPwd = properties['password'] || properties.password || ''
  properties.member_pwd = String(realPwd).trim()
  
  // 2. 强行置空，绕过 NotionNext 的内置页面验证界面
  properties.password = '' 
  // ------------------

  properties.slug = properties.slug || ''
  properties.type = properties.type || ''
  properties.status = properties.status || ''

  return properties
}

export function adjustPageProperties(properties) {
  properties.href = '/' + (properties.slug || properties.id)
}
