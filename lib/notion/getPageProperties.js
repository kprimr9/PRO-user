import { getTextContent } from 'notion-utils'

/**
 * 获取页面元素成员属性
 */
export default async function getPageProperties(id, value, schema, authToken, tagOptions) {
  const properties = { id }
  const rawProps = value?.properties || {}
  
  // 基础映射
  if (schema) {
      Object.keys(schema).forEach(key => {
        const name = schema[key].name
        properties[name] = getTextContent(rawProps[key])
      })
  }

  // --- 【核心逻辑】 ---
  // 1. 抓取真实密码转存给登录窗使用
  const realPwd = properties['password'] || properties.password || ''
  properties.member_pwd = String(realPwd).trim()
  
  // 2. 强行置空系统的 password 变量，防止进入页面时弹出原生的验证框
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
