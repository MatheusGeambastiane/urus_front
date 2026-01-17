export const getSellPaymentLabel = (value: string | null | undefined) => {
  if (!value) {
    return "Desconhecido";
  }
  switch (value) {
    case "creditcard":
    case "credit":
      return "Cartão de crédito";
    case "debit":
      return "Cartão de débito";
    case "pix":
      return "Pix";
    case "dinheiro":
    case "money":
      return "Dinheiro";
    default:
      return value;
  }
};
