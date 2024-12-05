import { default as DebugPackage } from 'debug'

const enableDebug = () => {
  // 获取当前已启用的调试命名空间
  const currentDebug = localStorage.debug;
  // 合并现有的调试命名空间和我们的命名空间
  DebugPackage.enable(currentDebug ? `${currentDebug},devtool-extension:*` : 'devtool-extension:*');
}
const debug = DebugPackage('devtool-extension:debug')

const disableDebug = () => {
  debug.destroy()
}

export { enableDebug, disableDebug, debug }
