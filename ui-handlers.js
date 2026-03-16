
/**
 * Calcule le montant USD pour RedotPay
 */
window.calculateRedotpayUsd = function() {
  const dzdInput = document.getElementById('redotpayDzdAmount');
  const usdDisplay = document.getElementById('redotpayUsdDisplay');
  if (!dzdInput || !usdDisplay) return;

  const dzd = parseFloat(dzdInput.value) || 0;
  const rate = window.getRedotpayRate ? window.getRedotpayRate() : 250;
  const usd = dzd / rate;

  usdDisplay.textContent = `${usd.toFixed(2)} $`;
};
