import { useState, useImperativeHandle } from 'react'
import { useRouter } from 'next/router'
import md5 from 'js-md5'

/**
 * PRO+ 专属登录弹窗
 */
const LoginModal = ({ cRef, allPages }) => {
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
    }
  }))

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()

    // 匹配逻辑：将输入的账号密码也进行相同的 MD5 加密后对比
    const matchedUser = allPages?.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPassword = String(p.password || '').trim()
      const hashedInput = md5(inputSlug + inputPwd)
      return dbSlug === inputSlug && dbPassword === hashedInput
    })

    if (matchedUser) {
      setIsOpen(false)
      router.push(`/${matchedUser.slug}`)
    } else {
      setLoading(false)
      setError('账号或密码不正确，请联系管理员')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-red-700"></div>
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white tracking-widest">会员登录</h3>
            <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.2em]">Member Access Control</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95"
            >
              {loading ? '验证中...' : '进入空间'}
            </button>
          </form>
          <button onClick={() => setIsOpen(false)} className="w-full mt-6 text-gray-600 text-xs hover:text-gray-400">
            取消返回
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
