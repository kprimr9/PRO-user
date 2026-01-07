import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * 优化后的会员登录弹窗
 */
const LoginModal = ({ isOpen, setIsOpen, allPages }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const modalRef = useRef()

  // 这里的 allPages 是 NotionNext 传递进来的所有页面索引数据
  // 请确保你的 Notion 数据库中有 password 属性，并且 NotionNext 已将其抓取到前端

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    // 1. 查找匹配的页面 (Slug 对应账号，password 对应密码)
    const matchedUser = allPages?.find(p => {
        const slugMatch = String(p.slug).trim() === String(username).trim()
        // 注意：Notion 中的属性在 NotionNext 中通常是 p.password 或者 p.properties.password.value
        // 根据 NotionNext 的映射，通常直接在 p 对象上
        const pwdMatch = String(p.password || '').trim() === String(password).trim()
        return slugMatch && pwdMatch
    })

    if (matchedUser) {
      // 登录成功
      setLoading(false)
      setIsOpen(false)
      // 跳转到个人主页
      router.push(`/${matchedUser.slug}`)
    } else {
      // 登录失败
      setLoading(false)
      setError('账号或密码不正确，请重新输入')
    }
  }

  // 点击背景关闭
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-sm overflow-hidden bg-[#121212] border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]"
      >
        {/* 装饰条 */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white">会员登录</h3>
            <p className="text-gray-500 text-sm mt-2">请输入您的会员账号与密码</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="账号"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="密码"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? '验证中...' : '立即进入'}
            </button>
          </form>

          <button 
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            取消返回
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
