const isDev = import.meta.env?.DEV === true;

export function getErrorMessageForUser(
  err: unknown,
  fallback: string
): string {
  if (isDev && err != null) {
    if (err instanceof Error) {
      console.error(`[Error] ${err.message}`, err);
    } else {
      console.error('[Error]', err);
    }
  }
  return fallback;
}
