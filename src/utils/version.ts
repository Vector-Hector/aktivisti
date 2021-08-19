/**
 * Takes the app version an calculates a integer version of it
 * i.e. 0.3.2-beta.19 translates to 302919
 * All numbers are parsed and padded to 2 digits.
 * Prerelease modifiers are translated to constants, an absent prerelease modifier produces a 9
 * alpha = 1
 * beta = 2
 * rc = 3
 * n/a = 9
 */
function getVersionCode(): number {

  const versionString = process.env.APP_VERSION!
  const versionRegex = /([0-9]{1,2})\.([0-9]{1,2}).([0-9]{1,2})(?:-(alpha|beta|rc)\.([0-9]{1,2}))?/
  const match = versionRegex.exec(versionString)
  if (!match) return 0
  const [, major, minor, patch, preReleaseModifier, preReleaseNumber] = match
  let prereleaseModifierInteger
  switch (preReleaseModifier) {
  case 'alpha':
    prereleaseModifierInteger = 1
    break
  case 'beta':
    prereleaseModifierInteger = 2
    break
  case 'rc':
    prereleaseModifierInteger = 3
    break
  default:
    prereleaseModifierInteger = 9
    break
  }
  return parseInt(
    `${major.padStart(2, '0')}${minor.padStart(2, '0')}${patch.padStart(2, '0')}${prereleaseModifierInteger}${preReleaseNumber?.padStart(2, '0') ?? '00'}`
  )
}

export const VERSION_CODE = getVersionCode()
