import BLOG from '@/blog.config'
import { getGlobalData } from '@/lib/db/getSiteData' // 修正后的路径
import { useGlobal } from '@/lib/global'
import { THEME } from '@/blog.config'
import dynamic from 'next/dynamic'

/**
 * 首页 - 强制注入会员数据
 */
const Index = (props) => {
  const { theme } = useGlobal()
  
  // 调试日志
  console.log('--- 首页数据载入检查 ---')
  console.log('当前页面获取到的总数据量:', props?.allPages?.length || 0)

  const ThemeComponents = dynamic(() => import(`@/themes/${theme}`), { ssr: true })
  return <ThemeComponents {...props} />
}

/**
 * 静态内容抓取
 */
export async function getStaticProps() {
  const from = 'archive' // 强制绕过首页缓存优化，抓取全量数据
  const props = await getGlobalData({ from })

  // 确保数据源被正确解构
  return {
    props: {
      ...props,
      allPages: props.allPages || props.posts || []
    },
    revalidate: BLOG.NEXT_REVALIDATE_SECOND
  }
}

export default Index
