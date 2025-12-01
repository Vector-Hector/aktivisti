import { defineBoot } from '#q-app/wrappers'

const KEY_LOCAL_STORAGE_VERSION = 'KEY_LOCAL_STORAGE_VERSION'

function m0001_set_default_sorting_filter_preference() {
  const filterPreferencesString = localStorage.getItem(
    'KEY_FILTERPREFERENCES'
  ) as string | null
  if (filterPreferencesString !== null) {
    try {
      const filterPreferences = JSON.parse(filterPreferencesString)
      filterPreferences.sorting = '-start_date'
      localStorage.setItem(
        'KEY_FILTERPREFERENCES',
        JSON.stringify(filterPreferences)
      )
    } catch {
      localStorage.removeItem('KEY_FILTERPREFERENCES')
    }
  }
}

export function migrate() {
  let localStorageVersion = localStorage.getItem(KEY_LOCAL_STORAGE_VERSION)

  if (localStorageVersion === null) {
    m0001_set_default_sorting_filter_preference()
    localStorageVersion = '1'
  }
  // Example for future migrations
  // if (localStorageVersion === '1') {
  //   m0002_change_default_locale()
  //   localStorageVersion = '2'
  // }
  // if (localStorageVersion === '2') {
  //   m0003_change_default_theme()
  //   localStorageVersion = '3'
  // }
  localStorage.setItem(KEY_LOCAL_STORAGE_VERSION, localStorageVersion)
}

export default defineBoot(() => {
  migrate()
})
