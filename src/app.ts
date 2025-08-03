import { Component, PropsWithChildren } from 'react'

import './app.css'

// 添加应用启动日志
console.log('🚀 [App] 应用启动！');
console.log('📱 [App] 当前时间:', new Date().toLocaleString());

  class App extends Component<PropsWithChildren> {

  componentDidMount () {
    console.log('✅ [App] 应用组件挂载成功');
  }

  componentDidShow () {
    console.log('👁️ [App] 应用显示');
  }

  componentDidHide () {
    console.log('🙈 [App] 应用隐藏');
  }

  componentDidCatchError () {
    console.log('❌ [App] 应用发生错误');
  }

  // this.props.children 是将要会渲染的页面
  render () {
    console.log('🎨 [App] 应用开始渲染');
    return this.props.children
  }
}


export default App
