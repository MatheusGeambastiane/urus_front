export const passwordRequirementLabels = {
  length: "Pelo menos 8 caracteres",
  uppercase: "Uma letra maiúscula",
  lowercase: "Uma letra minúscula",
  number: "Um número",
  special: "Um caractere especial",
} as const;

export const passwordRequirementCheck = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});
