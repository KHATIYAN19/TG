// Rupees -> paise for gateway amounts.
export const amountToPaise = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid payment amount.");
  }

  return Math.round(numericAmount * 100);
};
