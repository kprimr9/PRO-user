/* eslint-disable @next/next/no-img-element */
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

// 动态加载优化后的弹窗
const LoginModal = dynamic(() => import('./LoginModal'), { ssr: false })
const RegModal = dynamic(() => import('./RegModal'), { ssr: false })

export const Hero = (props) => {
  const loginModalRef = useRef(null)
  const regModalRef = useRef(null)

  return <>
    <div id="home" className="relative h-screen bg-black pt-[120px] overflow-hidden">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-col items-center">
          <div className="w-full px-4 text-center">
            <div className="hero-content wow fadeInUp mx-auto max-w-[780px]" data-wow-delay=".2s">
              <h1 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
                <span>PRO+</span><span className='text-red-700 ml-2'>一站式</span>
              </h1>
              <p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-gray-400">
                Your one-stop favorites will never be lost!<br />
                {siteConfig('STARTER_HERO_TITLE_2', null, CONFIG)}
              </p>

              <ul className="mb-10 flex flex-wrap items-center justify-center gap-5">
                <li>
                  <button 
                    onClick={() => loginModalRef.current?.openModal()}
                    className="inline-flex items-center justify-center rounded-md bg-white px-20 py-[14px] text-center text-base font-bold text-black shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    会员登录
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => regModalRef.current?.openModal()}
                    className="flex items-center rounded-md bg-white/[0.08] border border-white/10 px-16 py-[14px] text-base font-medium text-white transition-all duration-300 hover:bg-white/[0.15] active:scale-95"
                  >
                    注册说明
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* 背景装饰：增加一点Vercel风格的暗光效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>
    </div>

    <LoginModal cRef={loginModalRef} {...props} />
    <RegModal cRef={regModalRef} />
  </>
}
