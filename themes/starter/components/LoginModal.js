import { useState, useImperativeHandle } from 'react'
import { useRouter } from 'next/router'

/**
 * PRO+ 最终修复版登录弹窗
 * 1. 自动适配多数据源 (allPages/posts)
 * 2. 包含明文比对逻辑 (方便排查)
 * 3. 完美适配 Starter 主题深色风格
 */
const LoginModal = (props) => {
  const { cRef, allPages, posts } = props
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 暴露给父组件 (Hero.js) 的方法
  useImperativeHandle(cRef, () => ({
    openSearch: () => {
      setIsOpen(true)
      setError('')
      console.log('--- 登录弹窗开启，当前 props 数据状态 ---')
      console.log('allPages 数量:', allPages?.length || 0)
      console.log('posts 数量:', posts?.length || 0)
    }
  }))

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)

    // 数据源多重兜底：优先取 allPages，其次取 posts，最后取空数组
    const pageList = allPages || posts || []
    
    console.log('--- 正在执行登录校验 ---')
    console.log('当前可用账号总数:', pageList.length)

    if (pageList.length === 0) {
      setError('系统数据正在同步中，请刷新页面或稍后再试')
      setLoading(false)
      return
    }

    const inputSlug = String(username).trim()
    const inputPwd = String(password).trim()

    // 在数据列表中寻找匹配项
    const matchedUser = pageList.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.password || '').trim()
      
      // 调试：如果账号对上了，打印出密码对比情况
      if (dbSlug === inputSlug) {
          console.log('>>> 找到匹配账号:', dbSlug)
          console.log('>>> 数据库存储的密码:', dbPwd)
          console.log('>>> 您当前输入的密码:', inputPwd)
      }
      
      return dbSlug === inputSlug && dbPwd === inputPwd
    })

    if (matchedUser) {
      console.log('登录成功，正在跳转空间...')
      setIsOpen(false)
      // 使用原生跳转确保静态路由刷新
      window.location.href = `/${matchedUser.slug}`
    } else {
      setLoading(false)
      setError('账号或密码错误')
      console.warn('登录失败：账号密码不匹配')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(255,0,0,0.2)] p-8 overflow-hidden">
        {/* 顶部红色装饰条 */}
        <div className="absolute top-0 left-0 h-1 w-full bg-red-700"></div>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white tracking-widest">会员登录</h3>
          <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.2em]">One-Stop Favorites Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 ml-1 uppercase">Account</label>
            <input
              type="text"
              placeholder="请输入账号"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all placeholder:text-gray-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 ml-1 uppercase">Password</label>
            <input
              type="password"
              placeholder="请输入密码"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all placeholder:text-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-white text-black font-bold rounded-xl hover:bg-red-700 hover:text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '正在验证身份...' : '立即登录进入'}
          </button>
        </form>

        <button 
          onClick={() => setIsOpen(false)}
          className="w-full mt-6 text-gray-500 text-xs hover:text-white transition-colors"
        >
          取消并返回
        </button>
      </div>
    </div>
  )
}

export default LoginModal
