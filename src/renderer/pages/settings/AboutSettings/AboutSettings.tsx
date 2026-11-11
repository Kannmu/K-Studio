import { Bug, FileText, Github, Package, Star } from 'lucide-react'
import type { FC, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge, Button, Divider } from '@cherrystudio/ui'
import AppLogo from '@renderer/assets/images/logo.png'
import LogoAvatar from '@renderer/components/icons/LogoAvatar'
import {
  SettingGroup,
  SettingRow,
  SettingRowTitle,
  SettingsContentColumn
} from '@renderer/components/SettingsPrimitives'
import { useTheme } from '@renderer/hooks/useTheme'
import { ipcApi } from '@renderer/ipc'
import { openExternalWebsite } from '@renderer/services/website'

const KSTUDIO_REPOSITORY = 'https://github.com/Kannmu/K-Studio'
const KSTUDIO_GUIDE = 'https://github.com/Kannmu/K-Studio/blob/main/K-STUDIO.md'
const KSTUDIO_RELEASES = 'https://github.com/Kannmu/K-Studio/releases'
const CHERRY_UPSTREAM = 'https://github.com/CherryHQ/cherry-studio'

const AboutSettings: FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [version, setVersion] = useState('')
  const [isPortable, setIsPortable] = useState(false)

  useEffect(() => {
    void (async () => {
      const appInfo = await ipcApi.request('app.get_info')
      setVersion(appInfo.version)
      setIsPortable(appInfo.isPortable)
    })()
  }, [])

  const open = (url: string) => void openExternalWebsite(url)
  const debug = () => void ipcApi.request('system.toggle_dev_tools')

  return (
    <SettingsContentColumn theme={theme}>
      <SettingGroup theme={theme}>
        <div className="flex min-w-0 items-center gap-3 py-1">
          <LogoAvatar logo={AppLogo} size={72} className="rounded-full" alt="" />
          <div className="flex min-h-18 flex-col items-start justify-center">
            <div className="mb-1 text-lg font-bold text-foreground">K-Studio</div>
            <div className="text-muted-foreground text-sm">{t('kstudio.about.description')}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge className="rounded-md border-primary/20 bg-primary/10 px-1.5 py-0 text-[11px] leading-4 text-primary">
                v{version}
              </Badge>
              {isPortable ? <span className="text-muted-foreground text-xs">{t('kstudio.about.portable')}</span> : null}
            </div>
          </div>
        </div>
      </SettingGroup>

      <SettingGroup theme={theme}>
        <AboutActionRow
          icon={<FileText className="size-4.5" />}
          title={t('kstudio.about.guide')}
          actionLabel={t('kstudio.about.open')}
          onAction={() => open(KSTUDIO_GUIDE)}
        />
        <Divider className="my-3" />
        <AboutActionRow
          icon={<Github className="size-4.5" />}
          title={t('kstudio.about.repository')}
          actionLabel={
            <>
              <Star aria-hidden="true" className="lucide-custom size-3.5 text-foreground-tertiary" />
              {t('kstudio.about.repository_button')}
            </>
          }
          onAction={() => open(KSTUDIO_REPOSITORY)}
        />
        <Divider className="my-3" />
        <AboutActionRow
          icon={<Package className="size-4.5" />}
          title={t('kstudio.about.releases')}
          actionLabel={t('kstudio.about.open')}
          onAction={() => open(KSTUDIO_RELEASES)}
        />
        <Divider className="my-3" />
        <AboutActionRow
          icon={<Github className="size-4.5" />}
          title={t('kstudio.about.upstream')}
          actionLabel={t('kstudio.about.open')}
          onAction={() => open(CHERRY_UPSTREAM)}
        />
        <Divider className="my-3" />
        <AboutActionRow
          icon={<Bug className="size-4.5" />}
          title={t('kstudio.about.debug')}
          actionLabel={t('kstudio.about.open')}
          onAction={debug}
        />
      </SettingGroup>

      <p className="px-1 text-muted-foreground text-xs leading-relaxed">{t('kstudio.about.license')}</p>
    </SettingsContentColumn>
  )
}

function AboutActionRow({
  actionLabel,
  icon,
  onAction,
  title
}: {
  actionLabel: ReactNode
  icon: ReactNode
  onAction: () => void | Promise<void>
  title: string
}) {
  return (
    <SettingRow className="gap-3">
      <SettingRowTitle className="gap-2.5">
        {icon}
        {title}
      </SettingRowTitle>
      <Button size="sm" onClick={() => void onAction()} variant="outline">
        {actionLabel}
      </Button>
    </SettingRow>
  )
}

export default AboutSettings
