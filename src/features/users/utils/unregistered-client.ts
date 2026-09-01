export const UNREGISTERED_CLIENT_PHONE = "7199999999";
export const UNREGISTERED_CLIENT_PHONE_DISPLAY = "71 99999999";

const normalizeNamePart = (value: string, fallback: string) => {
  const firstPart = value.trim().split(/\s+/)[0] ?? "";
  const normalized = firstPart
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return normalized || fallback;
};

export const buildUnregisteredClientEmail = (
  firstName: string,
  lastName: string,
) => {
  const firstPart = normalizeNamePart(firstName, "cliente");
  const secondPart = normalizeNamePart(lastName, "semnome");
  return `${firstPart}.${secondPart}.genericuserurus@gmail.com`;
};
