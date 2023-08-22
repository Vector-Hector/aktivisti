import { inject, InjectionKey, Ref } from 'vue'

export const GlobalLoadingInjectionKey: InjectionKey<Ref<boolean>> = Symbol()

export function useGlobalLoadingState(): Ref<boolean> {
  const loading = inject(GlobalLoadingInjectionKey)
  if (loading?.value === undefined) {
    throw new Error('useGlobalLoading is only allowed in global app contexts')
  } else {
    return loading
  }
}
