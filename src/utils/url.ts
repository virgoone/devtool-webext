import { wildcardMatch } from "./wildcard-match"

export const padLeftProtocol = (url: string) => {
  if (url?.startsWith("http")) {
    return url
  } else if (url?.startsWith("//")) {
    return url.replace("//", "https://")
  }
  return url
}

interface urlParam {
  shotParams: string | ""
  shotUrl: string
}

export const getUrlParams = (originUrl: string): urlParam => {
  const url = originUrl
  let index = url.indexOf("?")
  let shotParams, shotUrl
  if (index !== -1) {
    shotParams = url.substr(index + 1)
    shotUrl = url.substr(0, index)
  } else {
    shotUrl = url
    shotParams = ""
  }
  return {
    shotParams,
    shotUrl
  }
}

export function getOrigin(url: string) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.origin
  } catch (error) {
    return null
  }
}

export function getProtocol(url: string) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol
  } catch (error) {
    return null
  }
}

export function getHost(url: string) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.host
  } catch (error) {
    return url
  }
}

export const matchesPattern = (url: string, pattern: string): boolean => {
  if (!url || !pattern) {
    return true
  }
  if (url.startsWith("/")) {
    return false
  }
  if (pattern.includes("*")) {
    return wildcardMatch(pattern)(getHost(url))
  }

  const protocol = getProtocol(url)
  return protocol === "http:" || protocol === "https:" || !protocol
    ? pattern === getOrigin(url)
    : url.startsWith(pattern)
}
