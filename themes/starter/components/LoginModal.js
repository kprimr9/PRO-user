import { useState, useImperativeHandle, useEffect } from 'react'
import { useRouter } from 'next/router'

const LoginModal = (props) => {
  const { cRef, allPages, posts } = props
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimate, setIsAnimate] = useState(false) // 用于控制动效
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 处理动效开启
  useImperativeHandle(cRef, () => ({
    openModal: () => {
      setIsOpen(true)
      setTimeout(() => setIsAnimate(true), 10)
      setError('')
    }
  }))

  const closeModal = () => {
    setIsAnimate(false)
    setTimeout(() => setIsOpen(false), 300)
  }

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    const pageList = allPages || posts || []
    const inputSlug = username.trim()
    const inputPwd = password.trim()

    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.member_pwd || p.password || '').trim()
      return dbSlug === inputSlug && dbPwd === inputPwd
    })

    if (matchedUser) {
      window.location.href = `/${matchedUser.slug}`
    } else {
      setLoading(false)
      setError('账号或密码不正确')
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isAnimate ? 'bg-black/80 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'}`}>
      <div 
        className={`relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] p-8 transition-all duration-300 transform ${isAnimate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        <div className="text-center mb-10">
          <h3 className="text-2xl font-semibold text-white tracking-tight">会员登录</h3>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="group">
            <input
              type="text"
              placeholder="账号"
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/[0.05] placeholder:text-gray-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <input
              type="password"
              placeholder="密码"
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/[0.05] placeholder:text-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end px-1">
              <a 
                href="#" // 这里后续填入你的找回密码链接
                onClick={(e) => { e.preventDefault(); alert('请联系管理员找回密码') }}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                忘记密码？
              </a>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold rounded-lg transition-all duration-300 hover:bg-gray-200 active:scale-[0.98] shadow-lg disabled:opacity-50"
          >
            {loading ? '正在进入...' : '确认进入'}
          </button>
        </form>

        <button 
          onClick={closeModal}
          className="w-full mt-6 text-gray-500 text-xs hover:text-gray-300 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

export default LoginModal
