const isLocalhost = process.env.NEXT_PUBLIC_VERCEL_URL === undefined;

export function getBaseUrl() {
  if (isLocalhost) {
    return "http://app.local-gphotos.site:3000";
  }
  return "https://app.gphotos.site";
}

export function getSiteHost(username: string) {
  if (isLocalhost) {
    return `${username}.local-gphotos.site:3000`;
  }
  return `${username}.gphotos.site`;
}

export function getSiteUrl(username: string) {
  if (isLocalhost) {
    return `http://${getSiteHost(username)}`;
  }
  return `https://${getSiteHost(username)}`;
}
