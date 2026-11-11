import { SettingsContentColumn } from '@renderer/components/SettingsPrimitives'
import { UserProfileEditor } from '@renderer/components/UserProfileEditor'

/**
 * K-Studio keeps the profile local: avatar, display name and appearance.
 * Cherry account, subscription and sign-out surfaces are intentionally absent.
 */
export function ProfileSettings() {
  return (
    <SettingsContentColumn>
      <div className="space-y-6">
        <div id="setting-profile-profile">
          <UserProfileEditor />
        </div>
      </div>
    </SettingsContentColumn>
  )
}
