/* eslint-disable react/no-unknown-property */

/**
 * Starter主题专用全局样式 - 彻底去乱码稳健版
 */
const Style = () => {
  return <style jsx global>{`

  /** 1. 强行锁定页面高度，禁止多余的滚动 (因为登录页不需要滚动) **/
  html, body {
      overflow-x: hidden;
      overflow-y: auto;
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: black;
  }

  /** 2. 暴力隐藏所有统计节点、页脚以及可能在滚动时跳出来的容器 **/
  #busuanzi_container_site_pv,
  #busuanzi_container_site_uv,
  #busuanzi_container_page_pv,
  #busuanzi_value_site_pv,
  #busuanzi_value_site_uv,
  #busuanzi_value_page_pv,
  .busuanzi_container_site_pv,
  #notion-next-statistics,
  footer,
  .footer,
  #footer,
  [id*="busuanzi"],
  [class*="busuanzi"] {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      max-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      position: absolute !important;
      top: -9999px !important;
      pointer-events: none !important;
  }

  /** 3. 修正主题基础样式 **/
  #theme-starter {
      background-color: black;
      min-height: 100vh;
  }

  #theme-starter .sticky {
    position: fixed;
    z-index: 20;
    background-color: rgb(0 0 0 / 0.8);
    backdrop-filter: blur(5px);
    transition: all 0.3s;
  }
  
  :is(.dark #theme-starter .sticky){
    background-color: rgb(17 25 40 / 0.8);
  }

  .text-body-color{
    color: rgb(99 115 129);
  }

  /* 解决WOW.js可能导致的初始化不可见问题 */
  .wow {
    visibility: visible !important;
  }
  `}</style>
}

export { Style }
