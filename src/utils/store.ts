import { clone } from "lodash-es"
import { create } from "zustand"
import { combine, createJSONStorage, persist } from "zustand/middleware"

import { wxtStorage } from "@/utils/storage"

import { Updater } from "./typing"

type SecondParam<T> = T extends (
  _f: infer _F,
  _s: infer S,
  ...args: infer _U
) => any
  ? S
  : never

type MakeUpdater<T> = {
  lastUpdateTime: number
  _hasHydrated: boolean

  markUpdate: () => void
  update: Updater<T>
  setHasHydrated: (state: boolean) => void
}

type SetStoreState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined
) => void

export function createPersistStore<T extends object, M>(
  state: T,
  methods: (
    set: SetStoreState<T & MakeUpdater<T>>,
    get: () => T & MakeUpdater<T>
  ) => M,
  persistOptions: SecondParam<typeof persist<T & M & MakeUpdater<T>>>
) {
  persistOptions.storage = createJSONStorage(() => wxtStorage)
  const oldOonRehydrateStorage = persistOptions?.onRehydrateStorage
  persistOptions.onRehydrateStorage = (state) => {
    oldOonRehydrateStorage?.(state)
    return () => state.setHasHydrated(true)
  }

  return create(
    persist(
      combine(
        {
          ...state,
          lastUpdateTime: 0,
          _hasHydrated: false
        },
        (set, get) => {
          return {
            ...methods(set, get as any),

            markUpdate() {
              set({ lastUpdateTime: Date.now() } as Partial<
                T & M & MakeUpdater<T>
              >)
            },
            update(updater) {
              const state = clone(get())
              updater(state)
              set({
                ...state,
                lastUpdateTime: Date.now()
              })
            },
            setHasHydrated: (state: boolean) => {
              set({ _hasHydrated: state } as Partial<T & M & MakeUpdater<T>>)
            }
          } as M & MakeUpdater<T>
        }
      ),
      persistOptions as any
    )
  )
}
