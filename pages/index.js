import BLOG from '@/blog.config'
import { getGlobalData } from '@/lib/notion/getNotionData'
import { useGlobal } from '@/lib/global'
import { THEME } from '@/blog.config'
import dynamic from 'next/dynamic'

/**
 * 首页 - 强制加载全量会员数据
 * @param {*} props
 * @returns
 */
const Index = (props) => {
  const { theme } = useGlobal()
  
  // 调试日志：如果这里 > 0，登录就成功了
  console.log('--- 首页数据载入成功 ---')
  console.log('当前页面获取到的总数据量:', props?.allPages?.length || 0)

  const ThemeComponents = dynamic(() => import(`@/themes/${theme}`), { ssr: true })
  return <ThemeComponents {...props} />
}

/**
 * 静态内容抓取
 */
export async function getStaticProps() {
  const from = 'archive' // 【关键修改】将 from 改为 archive 模式，强制系统抓取全站数据
  const props = await getGlobalData({ from })

  // 确保数据被正确映射到 allPages
  const allPages = props.allPages || props.posts || []

  return {
    props: {
      ...props,
      allPages: allPages
    },
    revalidate: BLOG.NEXT_REVALIDATE_SECOND
  }
}

export default Index
