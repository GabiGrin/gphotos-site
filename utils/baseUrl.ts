const isLocalhost = process.env.NEXT_PUBLIC_VERCEL_URL === undefined;

export function getBaseUrl() {
  if (isLocalhost) {
    return "http://app.local-myphotos.site:3000";
  }
  return "https://app.myphotos.site";
}

export function getSiteHost(username: string) {
  if (isLocalhost) {
    return `${username}.local-myphotos.site:3000`;
  }
  return `${username}.myphotos.site`;
}

export function getSiteUrl(username: string) {
  if (isLocalhost) {
    return `http://${getSiteHost(username)}`;
  }
  return `https://${getSiteHost(username)}`;
}
