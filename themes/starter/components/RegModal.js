import { useState, useImperativeHandle } from 'react'

/**
 * 注册说明弹窗 - 可自行编辑内容
 */
const RegModal = ({ cRef }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimate, setIsAnimate] = useState(false)

  useImperativeHandle(cRef, () => ({
    openModal: () => {
      setIsOpen(true)
      setTimeout(() => setIsAnimate(true), 10)
    }
  }))

  const closeModal = () => {
    setIsAnimate(false)
    setTimeout(() => setIsOpen(false), 300)
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isAnimate ? 'bg-black/80 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'}`}>
      <div 
        className={`relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 transition-all duration-300 transform ${isAnimate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <h3 className="text-xl font-bold text-white mb-6">注册说明</h3>
        
        {/* 这里你可以自由编辑说明文字 */}
        <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>1. 本平台暂不支持自行注册。</p>
          <p>2. 如需获取账号，请通过页面右下角聊天工具联系管理员</p>
          <p>3. 审核通过后，您的 Slug 即为登录账号。</p>
          <div className="bg-white/5 p-4 rounded-lg border border-white/5 text-gray-300">
             更多支持请访问：<span className="text-white font-mono">pro-plus.top</span>
          </div>
        </div>

        <button 
          onClick={closeModal}
          className="w-full mt-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all"
        >
          我知道了
        </button>
      </div>
    </div>
  )
}

export default RegModal
