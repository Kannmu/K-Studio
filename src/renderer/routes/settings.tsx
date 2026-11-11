import { createFileRoute, redirect } from '@tanstack/react-router'

import { K_STUDIO_HIDDEN_SETTINGS_ROUTES } from '@renderer/components/settingsMenu'
import SettingsPage from '@renderer/pages/settings/SettingsPage'

// 布局路由：SettingsPage 作为布局组件，使用 Outlet 渲染子路由
export const Route = createFileRoute('/settings')({
  beforeLoad: ({ location }) => {
    // K-Studio hides agent/account surfaces from the menu; an old tab or a
    // manual URL must not resurrect them. Nested routes are covered by prefix.
    const hidden = [...K_STUDIO_HIDDEN_SETTINGS_ROUTES].some(
      (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
    )
    if (hidden) {
      throw redirect({ to: '/settings/provider', replace: true })
    }
  },
  component: SettingsPage
})
