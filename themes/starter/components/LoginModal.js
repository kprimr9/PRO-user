import { useState, useImperativeHandle, useEffect } from 'react'
import md5 from 'js-md5'

/**
 * PRO+ 最终全能版登录弹窗
 * 兼容明文和MD5加密，确保100%登录成功
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

    // 数据源多重保障
    const pageList = allPages || posts || []
    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()
    
    // 计算 MD5 暗号（备用）
    const hashedInput = md5(inputSlug + inputPwd)

    console.log('--- 执行登录校验 ---')
    console.log('可用数据源条数:', pageList.length)

    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.password || '').trim()
      
      // 如果账号匹配，尝试两种比对方式
      if (dbSlug === inputSlug) {
          // 方式1：明文对比（针对你目前的情况）
          const isPlainMatch = (dbPwd === inputPwd)
          // 方式2：MD5对比（针对未来开启加密的情况）
          const isHashMatch = (dbPwd === hashedInput)
          
          if (isPlainMatch || isHashMatch) {
              console.log('>>> 验证通过！匹配方式:', isPlainMatch ? '明文' : '哈希')
              return true
          }
          
          console.warn('>>> 账号匹配但密码错误:', { 数据库存的: dbPwd, 你输入的: inputPwd })
      }
      return false
    })

    if (matchedUser) {
      setIsOpen(false)
      // 使用 window.location 强力跳转
      window.location.href = `/${matchedUser.slug}`
    } else {
      setLoading(false)
      setError('账号或密码错误')
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white tracking-widest">会员登录</h3>
          <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.2em]">Member Authentication</p>
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
            {loading ? '身份校验中...' : '立即登录'}
          </button>
        </form>
        <button onClick={() => setIsOpen(false)} className="w-full mt-6 text-gray-600 text-xs hover:text-white transition-colors text-center">
          取消返回
        </button>
      </div>
    </div>
  )
}

export default LoginModal
