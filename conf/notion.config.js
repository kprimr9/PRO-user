/**
 * 读取Notion相关的配置
 * 如果需要在Notion中添加自定义字段，可以修改此文件
 */
module.exports = {
  // 自定义配置notion数据库字段名
  NOTION_PROPERTY_NAME: {
    // 这里的 'password' 必须对应你 Notion 数据库里“密码”那一列的名字
    password: process.env.NEXT_PUBLIC_NOTION_PROPERTY_PASSWORD || 'password',
    
    type: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE || 'type', // 文章类型
    type_post: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_POST || 'Post', // 博文
    type_page: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_PAGE || 'Page', // 单页
    type_notice: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_NOTICE || 'Notice', // 公告
    type_menu: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_MENU || 'Menu', // 菜单
    type_sub_menu: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_SUB_MENU || 'SubMenu', // 子菜单
    
    title: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TITLE || 'title', // 文章标题
    status: process.env.NEXT_PUBLIC_NOTION_PROPERTY_STATUS || 'status',
    status_publish: process.env.NEXT_PUBLIC_NOTION_PROPERTY_STATUS_PUBLISH || 'Published', // 发布状态
    status_invisible: process.env.NEXT_PUBLIC_NOTION_PROPERTY_STATUS_INVISIBLE || 'Invisible', // 隐藏状态
    
    summary: process.env.NEXT_PUBLIC_NOTION_PROPERTY_SUMMARY || 'summary',
    slug: process.env.NEXT_PUBLIC_NOTION_PROPERTY_SLUG || 'slug',
    category: process.env.NEXT_PUBLIC_NOTION_PROPERTY_CATEGORY || 'category',
    date: process.env.NEXT_PUBLIC_NOTION_PROPERTY_DATE || 'date',
    tags: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TAGS || 'tags',
    icon: process.env.NEXT_PUBLIC_NOTION_PROPERTY_ICON || 'icon',
    ext: process.env.NEXT_PUBLIC_NOTION_PROPERTY_EXT || 'ext' // 扩展字段
  },
  NOTION_ACTIVE_USER: process.env.NOTION_ACTIVE_USER || '',
  NOTION_TOKEN_V2: process.env.NOTION_TOKEN_V2 || ''
}
