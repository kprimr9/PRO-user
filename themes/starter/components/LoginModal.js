import { useState, useImperativeHandle, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useGlobal } from '@/lib/global'

/**
 * PRO+ 自动补全版登录弹窗
 * 解决了首页没有全量数据的问题
 */
const LoginModal = (props) => {
  const { cRef } = props
  const { allPages: globalPages } = useGlobal() // 尝试获取全局数据
  
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [localPages, setLocalPages] = useState([]) // 存储手动抓取的数据
  const router = useRouter()

  // --- 关键逻辑：自动抓取全站索引 ---
  useEffect(() => {
    // 如果全局没数据，或者数据是空的，就去抓取搜索索引
    if (isOpen && (!globalPages || globalPages.length === 0) && localPages.length === 0) {
      console.log('检测到内存无数据，正在自动拉取全站索引...')
      fetch('/search.json')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            console.log('全站索引拉取成功，数据条数:', data.length)
            setLocalPages(data)
          }
        })
        .catch(err => console.error('索引拉取失败:', err))
    }
  }, [isOpen, globalPages, localPages])

  useImperativeHandle(cRef, () => ({
    openSearch: () => {
      setIsOpen(true)
      setError('')
    }
  }))

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    // 优先使用全局数据，没有则使用手动抓取的数据
    const pageList = (globalPages && globalPages.length > 0) ? globalPages : localPages
    
    console.log('--- 登录尝试 ---')
    console.log('当前可用账号总数:', pageList.length)

    if (pageList.length === 0) {
      setError('系统正在初始化会员数据，请稍等3秒后重试')
      setLoading(false)
      return
    }

    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()

    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.password || '').trim()
      
      // 辅助调试：如果账号对上了，打印一下
      if (dbSlug === inputSlug) {
          console.log('找到账号，正在对比密码...')
          console.log('数据库密码:', dbPwd)
      }
      return dbSlug === inputSlug && dbPwd === inputPwd
    })

    if (matchedUser) {
      setIsOpen(false)
      router.push(`/${matchedUser.slug}`)
    } else {
      setLoading(false)
      setError('账号或密码不正确')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        <h3 className="text-2xl font-bold text-white text-center mb-6">会员登录</h3>
        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="账号"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all placeholder:text-gray-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="密码"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all placeholder:text-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-all">
            {loading ? '身份验证中...' : '确认登录'}
          </button>
        </form>
        <button onClick={() => setIsOpen(false)} className="w-full mt-6 text-gray-500 text-xs hover:text-gray-300">取消返回</button>
      </div>
    </div>
  )
}

export default LoginModal
