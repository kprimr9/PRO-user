import { useState, useImperativeHandle, useEffect } from 'react'

/**
 * PRO+ 极速登录弹窗 (定稿版)
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
    e.preventDefault()
    setError('')
    setLoading(true)

    // 数据源自动识别
    const pageList = allPages || posts || []
    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()

    console.log('--- 正在执行登录校验 ---')
    console.log('可用数据条数:', pageList.length)

    // 在数据中寻找
    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.member_pwd || '').trim() // 使用我们自定义的 member_pwd
      
      if (dbSlug === inputSlug) {
        console.log('账号匹配成功，对比密码...')
        console.log('数据库内密码:', dbPwd)
        console.log('用户输入密码:', inputPwd)
        return dbPwd === inputPwd
      }
      return false
    })

    if (matchedUser) {
      console.log('登录成功，正在跳转...')
      setIsOpen(false)
      // 使用 window.location.href 跳转，不带任何残留状态
      window.location.href = `/${matchedUser.slug}`
    } else {
      setLoading(false)
      setError('账号或密码不正确')
      console.error('校验未通过：账号不存在或密码错误')
    }
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden font-sans">
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white tracking-widest">会员登录</h3>
          <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest">Member Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="请输入账号"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all placeholder:text-gray-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="请输入密码"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 transition-all placeholder:text-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95"
          >
            {loading ? '正在载入空间...' : '立即登录'}
          </button>
        </form>

        <button 
          onClick={() => setIsOpen(false)}
          className="w-full mt-6 text-gray-500 text-xs text-center hover:text-white transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

export default LoginModal
