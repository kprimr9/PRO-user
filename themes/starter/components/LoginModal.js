import { useState, useImperativeHandle, useEffect } from 'react'

/**
 * PRO+ 自动解锁版登录弹窗
 * 解决了双重登录和密码错误的问题
 */
const LoginModal = (props) => {
  const { cRef, allPages, posts } = props
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

    const pageList = allPages || posts || []
    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()

    // 寻找匹配的会员页面
    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.password || '').trim()
      return dbSlug === inputSlug && dbPwd === inputPwd
    })

    if (matchedUser) {
      console.log('首页验证通过，正在注入解锁凭证...')
      
      // --- 关键逻辑：注入 NotionNext 页面解锁 Cookie ---
      // 这里的 matchedUser.id 就是该页面在 Notion 中的 ID
      // 有些版本使用 localStorage，有些使用 Cookie。我们双管齐下：
      try {
        const lockKey = `notion_pwd_${matchedUser.id}`
        // 1. 存入 SessionStorage (部分主题支持)
        sessionStorage.setItem(lockKey, inputPwd)
        // 2. 存入 Cookie (标准 NotionNext 逻辑)
        document.cookie = `${lockKey}=${inputPwd}; path=/; max-age=86400`
        console.log('凭证注入成功:', lockKey)
      } catch (err) {
        console.error('凭证注入失败:', err)
      }

      setIsOpen(false)
      // 使用 location.href 强制刷新进入页面
      window.location.href = `/${matchedUser.slug}`
    } else {
      setLoading(false)
      setError('账号或密码不正确')
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white tracking-widest">会员登录</h3>
          <p className="text-gray-500 text-[10px] mt-2 uppercase">Member Access</p>
        </div>

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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-white text-black font-bold rounded-xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95"
          >
            {loading ? '验证中...' : '立即登录进入'}
          </button>
        </form>

        <button 
          onClick={() => setIsOpen(false)}
          className="w-full mt-6 text-gray-500 text-xs hover:text-white transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

export default LoginModal
