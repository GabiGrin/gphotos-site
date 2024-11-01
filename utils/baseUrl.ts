const isLocalhost = process.env.NEXT_PUBLIC_VERCEL_URL === undefined;

export function getBaseUrl() {
  if (isLocalhost) {
    return "http://app.local-gphotos.site:3000";
  }
  return "https://app.gphotos.site";
}

export function getSiteHost(username: string) {
  if (isLocalhost) {
    return `localhost:3000/${username}`;
  }
  return `${username}.gphotos.site`;
}

export function getSiteUrl(username: string) {
  if (isLocalhost) {
    return `http://localhost:3000/${username}`;
  }
  return `https://${getSiteHost(username)}`;
}
