import { default as DebugPackage } from 'debug'
import { storage } from '@wxt-dev/storage'

const enableDebug = async () => {
  try {
    // 使用 wxt storage 获取调试设置
    const currentDebug = await storage.getItem<string>('local:debug')
    // 合并现有的调试命名空间和我们的命名空间
    const debugNamespace = currentDebug ? `${currentDebug},devtool-extension:*` : 'devtool-extension:*'
    DebugPackage.enable(debugNamespace);
    
    // 同时设置到 localStorage 以确保 debug 包正常工作
    if (typeof localStorage !== 'undefined') {
      localStorage.debug = debugNamespace
    }
  } catch (error) {
    console.warn('无法访问 storage，使用默认调试设置')
    DebugPackage.enable('devtool-extension:*');
  }
}

// 自动启用调试
enableDebug()

const debug = DebugPackage('devtool-extension:debug')

const disableDebug = () => {
  debug.destroy()
}

export { enableDebug, disableDebug, debug }
