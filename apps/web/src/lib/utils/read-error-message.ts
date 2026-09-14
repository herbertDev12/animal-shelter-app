export const readErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const body = await response.json();
    const message = (body as { message?: unknown })?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.length > 0) return message;
  } catch (error) {
    if (import.meta.env.DEV)
      console.warn(
        `[readErrorMessage] Could not read error body for ${response.status} ${response.url}`,
        error,
      );
  }
  return fallback;
};
