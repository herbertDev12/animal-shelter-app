/** First 8 characters of a UUID — enough to tell rows apart in the UI. */
export const shortId = (id: string): string => id.slice(0, 8);
