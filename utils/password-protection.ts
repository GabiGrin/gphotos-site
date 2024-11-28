const COOKIE_NAME = "site_password";
const COOKIE_EXPIRES_DAYS = 7;

export function setSitePassword(domain: string, password: string) {
  const date = new Date();
  date.setDate(date.getDate() + COOKIE_EXPIRES_DAYS);
  document.cookie = `${COOKIE_NAME}_${domain}=${password}; expires=${date.toUTCString()}; path=/`;
}

export function getSitePassword(domain: string) {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) =>
    c.trim().startsWith(`${COOKIE_NAME}_${domain}=`)
  );
  return cookie ? cookie.split("=")[1] : undefined;
}

export function validateSitePassword(
  sitePassword: string | undefined,
  providedPassword: string | undefined
) {
  if (!sitePassword) return true;
  if (!providedPassword) return false;
  return sitePassword === providedPassword;
}
