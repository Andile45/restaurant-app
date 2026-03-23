const isDev = import.meta.env?.DEV === true;

export function getErrorMessageForUser(
  err: unknown,
  fallback: string
): string {
  if (isDev && err != null) {
    // Keep dev logs, but return a useful message to the UI.
    if (err instanceof Error) {
      console.error(`[Error] ${err.message}`, err);
    } else {
      console.error('[Error]', err);
    }
  }

  if (err instanceof Error && typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }

  if (err && typeof err === 'object') {
    const maybeMessage = (err as any).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;

    // Supabase errors often include `message`, and sometimes `details` / `hint`.
    const maybeDetails = (err as any).details;
    if (typeof maybeDetails === 'string' && maybeDetails.trim()) return maybeDetails;

    const maybeHint = (err as any).hint;
    if (typeof maybeHint === 'string' && maybeHint.trim()) return maybeHint;
  }

  // If we truly cannot extract a message, fall back to what the caller provided.
  return fallback;
}
