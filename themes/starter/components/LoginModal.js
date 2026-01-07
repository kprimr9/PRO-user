import { useState, useImperativeHandle } from 'react'
import { useRouter } from 'next/router'

const LoginModal = (props) => {
  const { cRef, allPages, posts } = props
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useImperativeHandle(cRef, () => ({
    openSearch: () => {
      setIsOpen(true)
      setError('')
      // 检查 props 结构
      console.log('登录弹窗已开启，数据源 props:', props)
    }
  }))

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    // 尝试从所有可能的 key 中获取数据
    const pageList = allPages || posts || props.siteInfo?.allPages || []
    
    console.log('--- 登录校验 ---')
    console.log('当前可用数据总量:', pageList.length)

    if (pageList.length === 0) {
      setError('系统数据尚未载入，请尝试刷新页面')
      setLoading(false)
      return
    }

    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()

    // 查找匹配
    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      // 注意：这里由于我们在 getPageProperties 开启了 MD5，所以建议你先手动用明文测试
      // 如果你之前改了 getPageProperties 的 MD5 逻辑，这里也要对应。
      // 为了跑通，我们先假设它是明文：
      const dbPwd = String(p.password || '').trim()
      
      if (dbSlug === inputSlug) {
          console.log('账号匹配，正在对比密码...')
          console.log('数据库内密码:', dbPwd)
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
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        <h3 className="text-2xl font-bold text-white text-center mb-6">会员登录</h3>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="账号" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="密码" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-white text-black font-bold rounded-xl">确认进入</button>
        </form>
        <button onClick={() => setIsOpen(false)} className="w-full mt-4 text-gray-500 text-xs">取消</button>
      </div>
    </div>
  )
}

export default LoginModal
