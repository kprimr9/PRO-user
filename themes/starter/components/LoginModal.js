import { useState, useImperativeHandle } from 'react'
import { useRouter } from 'next/router'

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

    // --- 调试开始 ---
    console.log('--- 登录尝试 ---')
    console.log('用户输入账号:', inputSlug)
    console.log('用户输入密码:', inputPwd)
    console.log('当前数据库中总页面数:', allPages?.length)
    // --- 调试结束 ---

    const matchedUser = allPages?.find(p => {
      const dbSlug = String(p.slug || '').trim()
      const dbPwd = String(p.password || '').trim()
      
      // 在这里打印每一个对比过的页面（仅前几个），帮你确认数据是否存在
      if (dbSlug === inputSlug) {
          console.log('找到匹配账号，正在对比密码...')
          console.log('数据库密码:', dbPwd)
          console.log('输入密码:', inputPwd)
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
        <h3 className="text-2xl font-bold text-white text-center mb-6">会员登录 (调试版)</h3>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="账号" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="密码" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95">
            {loading ? '正在校验 (请看控制台)...' : '进入空间'}
          </button>
        </form>
        <button onClick={() => setIsOpen(false)} className="w-full mt-4 text-gray-500 text-xs">取消</button>
      </div>
    </div>
  )
}

export default LoginModal
