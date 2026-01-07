/* eslint-disable @next/next/no-img-element */
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useRef } from 'react'

// 动态加载我们新做的登录弹窗
const LoginModal = dynamic(() => import('@/themes/starter/components/LoginModal'), { ssr: false })
// 保留注册说明弹窗
const RegAlgoliaSearchModal = dynamic(() => import('@/themes/starter/components/RegAlgoliaSearchModal'), { ssr: false })

/**
 * 英雄大图区块 - PRO+ 登录版
 */
export const Hero = (props) => {
  const router = useRouter()
  const loginModalRef = useRef(null) // 登录弹窗引用
  const regSearchModal = useRef(null) // 注册说明弹窗引用

  // 处理会员登录点击
  function handleLoginClick() {
    if (loginModalRef.current) {
        loginModalRef.current.openSearch()
    } else {
        // 备用方案：如果组件没加载好，跳转到搜索页（建议确保组件加载）
        router.push('/search')
    }
  }

  // 处理注册说明点击
  function handleRegSearch() {
    if (regSearchModal.current) {
      regSearchModal.current.openSearch()
    } else {
      router.push('/search')
    }
  }

  return <>
    <div
      id="home"
      className="relative h-screen bg-black pt-[120px] md:pt-[130px] lg:pt-[160px]"
    >
      <div className="container">
        <div className="-mx-4 flex flex-col items-center">
          <div className="w-full px-4">
            <div
              className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
              data-wow-delay=".2s"
            >
              {/* 主标题 */}
              <h1 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
                <span>PRO+</span><span className='text-red-700 ml-2'>一站式</span>
              </h1>
              
              {/* 次标题 */}
              <p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-white sm:text-lg sm:leading-[1.44]">
                Your one-stop favorites will never be lost!<br />
                {siteConfig('STARTER_HERO_TITLE_2', null, CONFIG)}
              </p>

              {/* 按钮组 */}
              <ul className="mb-10 flex flex-wrap items-center justify-center gap-5">
                {siteConfig('STARTER_HERO_BUTTON_1_TEXT', null, CONFIG) &&
                  <li>
                    <button 
                      onClick={handleLoginClick}
                      className="inline-flex items-center justify-center rounded-md bg-white px-20 py-[14px] text-center text-base font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-red-700 hover:text-white"
                    >
                      {siteConfig('STARTER_HERO_BUTTON_1_TEXT', null, CONFIG)}
                    </button>
                  </li>
                }
                
                {siteConfig('STARTER_HERO_BUTTON_2_TEXT', null, CONFIG) &&
                  <li>
                    <button
                      onClick={handleRegSearch}
                      className="flex items-center rounded-md bg-white/[0.12] px-16 py-[14px] text-base font-medium text-white transition duration-300 ease-in-out hover:bg-white hover:text-dark"
                    >
                      {siteConfig('STARTER_HERO_BUTTON_2_ICON', null, CONFIG) && <img className='mr-4 w-5' src={siteConfig('STARTER_HERO_BUTTON_2_ICON', null, CONFIG)} alt="icon" />}
                      {siteConfig('STARTER_HERO_BUTTON_2_TEXT', null, CONFIG)}
                    </button>
                  </li>
                }
              </ul>
            </div>
          </div>

          {/* 产品预览图片 - 如果没有配置则不显示 */}
          {siteConfig('STARTER_HERO_PREVIEW_IMAGE', null, CONFIG) && (
            <div className="w-full px-4">
              <div className="wow fadeInUp relative z-10 mx-auto max-w-[845px]" data-wow-delay=".25s">
                <div className="mt-16">
                  <img
                    src={siteConfig('STARTER_HERO_PREVIEW_IMAGE', null, CONFIG)}
                    alt="hero"
                    className="mx-auto max-w-full rounded-t-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* 弹窗组件挂载 */}
    <LoginModal cRef={loginModalRef} {...props} />
    <RegAlgoliaSearchModal cRef={regSearchModal} {...props} />
  </>
}
