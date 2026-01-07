import { useState, useImperativeHandle, useEffect } from 'react'
import md5 from 'js-md5'

const LoginModal = (props) => {
  const { cRef, allPages, posts } = props
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 核心：防止 Hydration 错误
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
    const hashedInput = md5(inputSlug + inputPwd)

    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.password || '').trim()
      return dbSlug === inputSlug && dbPwd === hashedInput
    })

    if (matchedUser) {
      setIsOpen(false)
      window.location.href = `/${matchedUser.slug}`
    } else {
      setLoading(false)
      setError('账号或密码不正确')
    }
  }

  // 如果还没挂载到浏览器，不渲染任何内容，防止异常
  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        <h3 className="text-2xl font-bold text-white text-center mb-6 tracking-widest">会员登录</h3>
        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="账号"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="密码"
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-all">
            {loading ? '正在验证...' : '确认进入'}
          </button>
        </form>
        <button onClick={() => setIsOpen(false)} className="w-full mt-6 text-gray-600 text-xs hover:text-white transition-colors">取消返回</button>
      </div>
    </div>
  )
}

export default LoginModal
