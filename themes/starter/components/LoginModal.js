import { useState, useImperativeHandle, useRef } from 'react'
import { useRouter } from 'next/router'

/**
 * 专门为 PRO+ 定制的登录弹窗
 */
const LoginModal = ({ cRef, allPages }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 暴露给父组件 Hero.js 的方法
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

    // 匹配逻辑：slug 对应账号，password 属性对应密码
    const matchedUser = allPages?.find(p => {
      const slugMatch = String(p.slug).trim() === String(username).trim()
      const pwdMatch = String(p.password || '').trim() === String(password).trim()
      return slugMatch && pwdMatch
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* 顶部红条装饰 */}
        <div className="h-1.5 w-full bg-red-700"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-wider">会员登录</h3>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Member Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input
                type="text"
                placeholder="会员账号"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all placeholder:text-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="安全密码"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900/50 py-2 rounded-lg text-red-500 text-xs text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? '验证中...' : '进入一站式空间'}
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
    </div>
  )
}

export default LoginModal
