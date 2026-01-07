import BLOG from '@/blog.config'
import { getGlobalData } from '@/lib/db/getSiteData'
import dynamic from 'next/dynamic'

/**
 * 首页 - 极简稳健版
 * 解决了动态引用主题导致的客户端异常
 */
const Index = (props) => {
  // 直接从配置读取主题文件夹，这是最稳的方法
  const ThemeComponents = dynamic(() => import(`@/themes/${BLOG.THEME}`), { ssr: true })
  
  // 调试日志：如果数字 > 0，登录功能就通了
  console.log('--- 数据注入检查 ---')
  console.log('首页总共接收到的页面数:', props?.allPages?.length || 0)

  return <ThemeComponents {...props} />
}

/**
 * 静态内容抓取
 */
export async function getStaticProps() {
  const from = 'archive' // 强制绕过首页优化，抓取全库数据
  const props = await getGlobalData({ from })

  // 这里的处理确保 allPages 绝对不会是 undefined
  const allPages = props?.allPages || props?.posts || []

  return {
    props: {
      ...props,
      allPages: allPages
    }
  }
}

export default Index
