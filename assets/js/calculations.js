// === CALCULATIONS.JS ===

/**
 * Calcule le solde théorique basé sur l'historique
 */
window.calculateTheoreticalBalance = function() {
  let liq = 0;
  let bar = 0;
  let usdt = 0;

  // 1. Entrées (Paiements)
  (appState.payments || []).forEach(p => {
      const amt = Number(p.amount || 0);
      const method = (p.method || '').toLowerCase();
      const account = p.account || (method === 'baridimob' ? 'baridimob' : (method === 'usdt' ? 'usdt' : 'liquide'));
      
      if (account === 'baridimob') bar += amt;
      else if (account === 'usdt') {
          const rate = getRedotpayRate();
          usdt += (amt / rate);
      }
      else liq += amt;
  });

  // 2. Sorties (Dépenses)
  (appState.expenses || []).forEach(e => {
      const amt = Number(e.amount || 0);
      const account = e.account || 'liquide';
      
      if (account === 'baridimob') bar -= amt;
      else if (account === 'usdt') {
          const rate = getRedotpayRate();
          usdt -= (amt / rate);
      }
      else liq -= amt;
  });

  // 3. Achats USD (DZD -> USDT)
  (appState.usdPurchases || []).forEach(u => {
      const dzdAmt = Number(u.totalDzd || 0);
      const usdtAmt = Number(u.amount || 0);
      const dzdAccount = u.dzdAccount || 'liquide';
      
      if (dzdAccount === 'baridimob') bar -= dzdAmt;
      else liq -= dzdAmt;
      
      usdt += usdtAmt;
  });

  // 4. Ventes USD (Transactions) - Diminue le stock USDT
  (appState.transactions || []).forEach(t => {
      const usdtAmt = Number(t.amount || 0);
      usdt -= usdtAmt;
  });

  // 5. Dépenses USDT
  (appState.usdtExpenses || []).forEach(e => {
      const usdtAmt = Number(e.amount || 0);
      usdt -= usdtAmt;
  });

  return { liquide: liq, baridimob: bar, usdt: usdt };
};

/**
 * Recalcule les soldes finaux (Théorique + Ajustements manuels)
 */
window.recalculateFinanceBalances = function() {
  const manual = appState.manualBalances || { liquide: 0, baridimob: 0, usdt: 0 };
  const theoretical = calculateTheoreticalBalance();

  const balances = { 
    liquide: theoretical.liquide + Number(manual.liquide || 0), 
    baridimob: theoretical.baridimob + Number(manual.baridimob || 0), 
    usdt: theoretical.usdt + Number(manual.usdt || 0) 
  };

  appState.balances = balances;
};

/**
 * Calcule le profit d'une transaction
 */
window.calculateTransactionProfit = function(amount, priceDzd, buyRate) {
  const costDzd = amount * buyRate;
  return priceDzd - costDzd;
};
