import { useState, useImperativeHandle, useEffect } from 'react'

const LoginModal = (props) => {
  const { cRef, allPages, posts } = props
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

    const matchedUser = pageList.find(p => {
      return String(p.slug).trim() === inputSlug && String(p.password).trim() === inputPwd
    })

    if (matchedUser) {
      console.log('首页验证通过，正在强力解锁内部页面...')
      
      // --- 绝杀逻辑：注入所有可能的解锁 Key ---
      const pageId = matchedUser.id // 这里的 ID 可能是带横线的 UUID
      const lockKey = `notion_pwd_${pageId}`
      
      try {
        // 1. 注入 LocalStorage (这是 NotionNext 2.0+ 的标准解锁方式)
        localStorage.setItem(lockKey, inputPwd)
        localStorage.setItem('notion_pwd_' + pageId.replace(/-/g, ''), inputPwd) // 兼容去横线的 ID
        
        // 2. 注入 Cookie
        document.cookie = `${lockKey}=${inputPwd}; path=/; max-age=86400`
        
        console.log('解锁凭证已成功注入:', lockKey)
      } catch (err) {
        console.error('凭证注入异常:', err)
      }

      setIsOpen(false)
      // 使用 window.location.replace 确保跳转并刷新状态
      window.location.replace(`/${matchedUser.slug}`)
    } else {
      setLoading(false)
      setError('账号或密码不正确')
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 w-full bg-red-700"></div>
        <h3 className="text-2xl font-bold text-white text-center mb-8 tracking-widest">会员登录</h3>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" placeholder="账号" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="密码" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95">
            {loading ? '正在同步数据...' : '确认登录'}
          </button>
        </form>
        <button onClick={() => setIsOpen(false)} className="w-full mt-6 text-gray-500 text-xs hover:text-white transition-colors text-center cursor-pointer">
          返回首页
        </button>
      </div>
    </div>
  )
}

export default LoginModal
