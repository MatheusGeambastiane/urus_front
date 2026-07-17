const validationErrorKeys = [
  "non_field_errors",
  "password",
  "new_password",
  "new_password1",
  "new_password2",
];

const generalErrorKeys = ["message", "detail", "error", "errors"];

const uniqueMessages = (messages: string[]) =>
  messages.filter((message, index) => message && messages.indexOf(message) === index);

const normalizeApiErrorString = (value: string): string[] => {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const djangoErrorDetails = Array.from(
    trimmed.matchAll(/ErrorDetail\(string=(['"])(.*?)\1,\s*code=(['"]).*?\3\)/g),
  ).map((match) => match[2].replace(/\\'/g, "'").replace(/\\"/g, '"'));

  if (djangoErrorDetails.length > 0) return uniqueMessages(djangoErrorDetails);

  return [trimmed];
};

const extractMessages = (value: unknown): string[] => {
  if (typeof value === "string") return normalizeApiErrorString(value);
  if (Array.isArray(value)) return uniqueMessages(value.flatMap(extractMessages));
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  if (typeof record.string === "string") return normalizeApiErrorString(record.string);

  for (const key of validationErrorKeys) {
    const messages = extractMessages(record[key]);
    if (messages.length > 0) return messages;
  }

  for (const key of generalErrorKeys) {
    const messages = extractMessages(record[key]);
    if (messages.length > 0) return messages;
  }

  return uniqueMessages(
    Object.entries(record)
      .filter(([key]) => key !== "exception")
      .flatMap(([, fieldValue]) => extractMessages(fieldValue)),
  );
};

export const getApiErrorMessage = (payload: unknown, fallback: string) => {
  const messages = extractMessages(payload);
  return messages.length > 0 ? messages.join("\n") : fallback;
};
