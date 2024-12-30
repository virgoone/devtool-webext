import { StateStorage } from "zustand/middleware"

import { storage, StorageArea } from "wxt/storage"

class WXTStorage implements StateStorage {
  public async getItem(
    name: string,
    itemKey: StorageArea = "local"
  ): Promise<string | null> {
    try {
      const value = await storage.getItem<string | null>(`${itemKey}:${name}`)
      return value
    } catch (error) {
      return localStorage.getItem(name)
    }
  }

  public async setItem(
    name: string,
    value: string,
    itemKey: StorageArea = "local"
  ): Promise<void> {
    try {
      const _value = JSON.parse(value)
      if (!_value?.state?._hasHydrated) {
        console.warn("skip setItem", name)
        return
      }
      await storage.setItem(`${itemKey}:${name}`, value)
    } catch (error) {
      localStorage.setItem(name, value)
    }
  }

  public async removeItem(
    name: string,
    itemKey: StorageArea = "local"
  ): Promise<void> {
    try {
      await storage.removeItem(`${itemKey}:${name}`)
    } catch (error) {
      localStorage.removeItem(name)
    }
  }

  public async clear(): Promise<void> {
    try {
      await storage.removeItems([])
    } catch (error) {
      localStorage.clear()
    }
  }
}

export const wxtStorage = new WXTStorage()
