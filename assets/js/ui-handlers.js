window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  if (modalId === 'paymentModal') populatePaymentClientDropdown();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.setListPage = function(key, page) {
  if (!appState.ui) appState.ui = {};
  if (!appState.ui.pages) appState.ui.pages = {};
  const p = Number(page);
  appState.ui.pages[key] = Number.isFinite(p) ? p : 1;
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.setListFilter = function(key, value) {
  if (!appState.ui) appState.ui = {};
  if (!appState.ui.filters) appState.ui.filters = {};
  if (!appState.ui.pages) appState.ui.pages = {};
  appState.ui.filters[key] = (value || '').toString();
  appState.ui.pages[key] = 1;
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

function populatePaymentClientDropdown() {
  const select = document.getElementById('paymentClientId');
  if (!select) return;
  const clients = appState.clients || [];
  select.innerHTML = '<option value="">-- Sélectionner un client --</option>' +
    clients.map(c => `<option value="${c.id}">${c.name} (Dette: ${formatCurrency(c.unpaid || 0)})</option>`).join('');
}

window.handleLoginClick = async function() {
  const emailEl = document.getElementById('loginEmail');
  const passwordEl = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginError');
  const email = (emailEl?.value || '').trim();
  const password = passwordEl?.value || '';

  if (errorEl) errorEl.textContent = '';

  if (!email || !password) {
    const msg = 'Veuillez remplir tous les champs.';
    if (errorEl) errorEl.textContent = msg;
    showToast(msg, 'error');
    return;
  }

  try {
    if (typeof loginWithEmailPassword === 'function') {
      await loginWithEmailPassword(email, password);
    } else if (window.auth && typeof auth.signInWithEmailAndPassword === 'function') {
      await auth.signInWithEmailAndPassword(email, password);
      showToast('Connexion réussie', 'success');
      if (typeof updateAuthUI === 'function') updateAuthUI(auth.currentUser);
      if (typeof loadFromCloud === 'function') await loadFromCloud();
      if (typeof renderTables === 'function') renderTables();
    } else {
      throw new Error('Authentification indisponible');
    }
  } catch (error) {
    console.error(error);
    const msg = (typeof firebaseErrorMessage === 'function')
      ? firebaseErrorMessage(error)
      : (error?.message || 'Erreur de connexion');
    if (errorEl) errorEl.textContent = msg;
    showToast(msg, 'error');
  }
};

window.forceCloudSave = function() {
  window.isManualSave = true;
  showToast('Sauvegarde en cours...', 'info');
  if (typeof saveToCloud === 'function') saveToCloud();
  else showToast('Fonction de sauvegarde indisponible', 'error');
};

window.exportPDF = function() {
  const element = document.getElementById('tabContentContainer');
  if (!element) return;
  if (typeof html2pdf !== 'function') {
    showToast('Export PDF indisponible (librairie non chargée)', 'error');
    return;
  }
  showToast('Génération du PDF...', 'info');
  const opt = {
    margin: [10, 10],
    filename: `Sponsor_Manager_Export_${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save().then(() => {
    showToast('PDF généré avec succès !', 'success');
  }).catch(err => {
    console.error(err);
    showToast('Erreur lors de la génération du PDF', 'error');
  });
};

window.addClient = function() {
  const name = document.getElementById('newClientName')?.value?.trim();
  const phone = document.getElementById('newClientPhone')?.value?.trim();
  const instagram = document.getElementById('newClientInstagram')?.value?.trim();
  const facebook = document.getElementById('newClientFacebook')?.value?.trim();
  const notes = document.getElementById('newClientNotes')?.value?.trim();

  if (!name) return showToast('Nom du client requis', 'error');

  if (window.editingClientId) {
    const client = (appState.clients || []).find(c => c.id === window.editingClientId);
    if (!client) return;
    client.name = name;
    client.phone = phone || '';
    client.contact = phone || instagram || facebook || '';
    client.notes = notes || '';
    const igHandle = instagram ? instagram.replace(/^@+/, '').trim() : '';
    client.username = igHandle || '';
    client.social = { instagram: igHandle ? [igHandle] : [], facebook: facebook ? [facebook.trim()] : [] };
    client.updatedAt = Date.now();
    window.editingClientId = null;
    showToast('Client modifié', 'success');
  } else {
    const cleanName = name.toLowerCase().trim();
    if ((appState.clients || []).some(c => (c.name || '').toLowerCase().trim() === cleanName)) {
      return showToast('Ce client existe déjà', 'warning');
    }
    const client = {
      id: generateId('client'),
      name,
      phone: phone || '',
      contact: phone || instagram || facebook || '',
      notes: notes || '',
      totalSpent: 0,
      unpaid: 0,
      updatedAt: Date.now(),
      social: {
        instagram: instagram ? [instagram.replace(/^@+/, '').trim()] : [],
        facebook: facebook ? [facebook.trim()] : []
      }
    };
    if (!appState.clients) appState.clients = [];
    appState.clients.push(client);
    showToast('Client ajouté', 'success');
  }

  closeModal('clientModal');
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.editClient = function(id) {
  const client = (appState.clients || []).find(c => c.id === id);
  if (!client) return;
  window.editingClientId = id;
  const ig = (client.social && Array.isArray(client.social.instagram) && client.social.instagram[0]) || client.username || '';
  const fb = (client.social && Array.isArray(client.social.facebook) && client.social.facebook[0]) || '';
  if (document.getElementById('newClientName')) document.getElementById('newClientName').value = client.name || '';
  if (document.getElementById('newClientPhone')) document.getElementById('newClientPhone').value = client.phone || '';
  if (document.getElementById('newClientInstagram')) document.getElementById('newClientInstagram').value = ig || '';
  if (document.getElementById('newClientFacebook')) document.getElementById('newClientFacebook').value = fb || '';
  if (document.getElementById('newClientNotes')) document.getElementById('newClientNotes').value = client.notes || '';
  openModal('clientModal');
};

window.deleteClient = function(id) {
  if (!confirm('Supprimer ce client ?')) return;
  appState.clients = (appState.clients || []).filter(c => c.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.addOffer = function() {
  const name = document.getElementById('newOfferName')?.value?.trim();
  const description = document.getElementById('newOfferDesc')?.value?.trim();
  const priceDzd = Number(document.getElementById('newOfferPrice')?.value || 0);
  const costPerUnit = Number(document.getElementById('newOfferCostPerUnit')?.value || 0);
  const duration = document.getElementById('newOfferDuration')?.value?.trim();

  if (!name || !priceDzd) return showToast('Nom et prix requis', 'error');

  if (window.editingOfferId) {
    const offer = (appState.offers || []).find(o => o.id === window.editingOfferId);
    if (!offer) return;
    Object.assign(offer, { name, description: description || '', priceDzd, costPerUnit, duration: duration || '', updatedAt: Date.now() });
    window.editingOfferId = null;
    showToast('Offre modifiée', 'success');
  } else {
    if (!appState.offers) appState.offers = [];
    appState.offers.push({ id: generateId('offer'), name, description: description || '', priceDzd, costPerUnit, duration: duration || '', updatedAt: Date.now() });
    showToast('Offre ajoutée', 'success');
  }
  closeModal('offerModal');
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.editOffer = function(id) {
  const offer = (appState.offers || []).find(o => o.id === id);
  if (!offer) return;
  window.editingOfferId = id;
  if (document.getElementById('newOfferName')) document.getElementById('newOfferName').value = offer.name || '';
  if (document.getElementById('newOfferDesc')) document.getElementById('newOfferDesc').value = offer.description || '';
  if (document.getElementById('newOfferPrice')) document.getElementById('newOfferPrice').value = offer.priceDzd || 0;
  if (document.getElementById('newOfferCostPerUnit')) document.getElementById('newOfferCostPerUnit').value = offer.costPerUnit || 0;
  if (document.getElementById('newOfferDuration')) document.getElementById('newOfferDuration').value = offer.duration || '';
  openModal('offerModal');
};

window.deleteOffer = function(id) {
  if (!confirm('Supprimer cette offre ?')) return;
  appState.offers = (appState.offers || []).filter(o => o.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.handleNewTodoSubmit = function(event) {
  event.preventDefault();
  const clientId = document.getElementById('todoClientId')?.value;
  const offerId = document.getElementById('todoOfferId')?.value;
  const priceDzd = Number(document.getElementById('todoPrice')?.value || 0);
  const paid = !!document.getElementById('todoPaid')?.checked;

  const client = (appState.clients || []).find(c => c.id === clientId);
  if (!client) return showToast('Client invalide', 'error');
  if (!offerId) return showToast('Offre invalide', 'error');
  if (!Number.isFinite(priceDzd) || priceDzd <= 0) return showToast('Prix DZD invalide', 'error');

  const isCustom = offerId === '__custom__';
  const offer = isCustom ? null : (appState.offers || []).find(o => o.id === offerId);
  if (!isCustom && !offer) return showToast('Offre introuvable', 'error');

  let finalOfferId = offerId;
  let finalOfferName = offer ? offer.name : 'Offre personnalisée';
  let amountUsd = offer ? Number(offer.costPerUnit || 0) : 0;
  let durationDays = null;

  if (isCustom) {
    finalOfferId = generateId('custom_offer');
    const customName = (document.getElementById('todoCustomName')?.value || '').trim();
    const customUsd = Number(document.getElementById('todoCustomUsd')?.value || 0);
    const customDuration = Number(document.getElementById('todoCustomDuration')?.value || 0);
    if (customName) finalOfferName = customName;
    if (!Number.isFinite(customUsd) || customUsd <= 0) return showToast('Montant USD invalide', 'error');
    if (!Number.isFinite(customDuration) || customDuration <= 0) return showToast('Durée invalide', 'error');
    amountUsd = customUsd;
    durationDays = customDuration;
  }

  const todo = {
    id: generateId('todo'),
    clientId: client.id,
    clientName: client.name,
    offerId: finalOfferId,
    offerName: finalOfferName,
    priceDzd,
    amount: amountUsd,
    paid,
    status: 'pending',
    date: getLocalDateString(),
    createdAt: Date.now(),
    customDurationDays: durationDays
  };
  if (!appState.todoTransactions) appState.todoTransactions = [];
  appState.todoTransactions.push(todo);
  if (typeof autoSave === 'function') autoSave();
  showToast('Tâche ajoutée à la To-Do List', 'success');
  if (typeof showTab === 'function') showTab('transactions');
};

window.updateTodoPrice = function() {
  const offerId = document.getElementById('todoOfferId')?.value;
  const offer = (appState.offers || []).find(o => o.id === offerId);
  const priceEl = document.getElementById('todoPrice');
  const customBox = document.getElementById('todoCustomOfferFields');
  const isCustom = offerId === '__custom__';

  if (customBox) {
    if (isCustom) customBox.classList.remove('hidden');
    else customBox.classList.add('hidden');
  }

  if (!priceEl) return;
  if (isCustom) {
    priceEl.readOnly = false;
    if (!priceEl.value) priceEl.value = '';
    return;
  }

  const v = offer ? (offer.priceDzd ?? offer.price ?? 0) : 0;
  priceEl.value = Number(v) || 0;
  priceEl.readOnly = false;
};

window.filterTodoOffers = function() {
  const searchEl = document.getElementById('todoOfferSearch');
  const select = document.getElementById('todoOfferId');
  const counter = document.getElementById('todoOfferMatchCount');
  if (!select) return;
  const query = (searchEl?.value || '').trim().toLowerCase();

  let visibleCount = 0;
  Array.from(select.options).forEach((opt, idx) => {
    if (idx === 0 || idx === 1) {
      opt.hidden = false;
      return;
    }
    const text = (opt.textContent || '').toLowerCase();
    const match = !query || text.includes(query);
    opt.hidden = !match;
    if (match) visibleCount += 1;
  });

  if (counter) {
    counter.textContent = query ? `${visibleCount} offre(s) trouvée(s)` : `${Math.max(0, select.options.length - 2)} offres`;
  }
};

window.clearTodoOfferSearch = function() {
  const searchEl = document.getElementById('todoOfferSearch');
  if (searchEl) searchEl.value = '';
  if (typeof filterTodoOffers === 'function') filterTodoOffers();
  if (searchEl) searchEl.focus();
};

window.validateTodoTransaction = function(id, status) {
  const idx = (appState.todoTransactions || []).findIndex(t => t.id === id);
  if (idx === -1) return;
  const todo = appState.todoTransactions[idx];

  if (!appState.transactions) appState.transactions = [];

  if (status === 'done') {
    appState.transactions.push({ ...todo, id: generateId('tx'), status: 'active', completedAt: Date.now() });
    const client = (appState.clients || []).find(c => c.id === todo.clientId);
    if (client) {
      client.totalSpent = (client.totalSpent || 0) + (todo.priceDzd || 0);
      if (!todo.paid) client.unpaid = (client.unpaid || 0) + (todo.priceDzd || 0);
      client.updatedAt = Date.now();
    }
    showToast('Transaction validée', 'success');
  } else if (status === 'problem') {
    appState.transactions.push({ ...todo, id: generateId('tx'), status: 'problem', updatedAt: Date.now() });
    showToast('Transaction marquée comme PROBLÈME', 'warning');
  }

  appState.todoTransactions.splice(idx, 1);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.deleteTodoTransaction = function(id) {
  if (!confirm('Supprimer cette tâche ?')) return;
  appState.todoTransactions = (appState.todoTransactions || []).filter(t => t.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.toggleTodoPayment = function(id) {
  const todo = (appState.todoTransactions || []).find(t => t.id === id);
  if (!todo) return;
  todo.paid = !todo.paid;
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.resolveProblem = function(id) {
  const tx = (appState.transactions || []).find(t => t.id === id);
  if (!tx) return;
  tx.status = 'active';
  tx.updatedAt = Date.now();
  const client = (appState.clients || []).find(c => c.id === tx.clientId);
  if (client) {
    client.totalSpent = (client.totalSpent || 0) + (tx.priceDzd || 0);
    if (!tx.paid) client.unpaid = (client.unpaid || 0) + (tx.priceDzd || 0);
    client.updatedAt = Date.now();
  }
  if (typeof autoSave === 'function') autoSave();
  showToast('Problème résolu', 'success');
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.addPayment = function() {
  const clientId = document.getElementById('paymentClientId')?.value;
  const amount = Number(document.getElementById('paymentAmount')?.value || 0);
  const method = document.getElementById('paymentMethod')?.value || 'Cash';
  const note = document.getElementById('paymentNote')?.value?.trim() || '';
  if (!clientId || !amount) return showToast('Client et montant requis', 'error');
  const client = (appState.clients || []).find(c => c.id === clientId);
  if (!client) return showToast('Client introuvable', 'error');

  const payment = { id: generateId('pay'), date: getLocalDateString(), clientId: client.id, clientName: client.name, amount, method, note, createdAt: Date.now() };
  if (!appState.payments) appState.payments = [];
  appState.payments.push(payment);
  client.unpaid = Math.max(0, (client.unpaid || 0) - amount);
  client.updatedAt = Date.now();

  closeModal('paymentModal');
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
  showToast('Paiement enregistré', 'success');
};

window.deletePayment = function(id) {
  if (!confirm('Supprimer ce paiement ? La dette du client sera réajustée.')) return;
  const pay = (appState.payments || []).find(p => p.id === id);
  if (pay) {
    const client = (appState.clients || []).find(c => c.id === pay.clientId);
    if (client) {
      client.unpaid = (client.unpaid || 0) + (pay.amount || 0);
      client.updatedAt = Date.now();
    }
  }
  appState.payments = (appState.payments || []).filter(p => p.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.addUsdPurchase = function() {
  const amount = Number(document.getElementById('usdAmount')?.value || 0);
  const rate = Number(document.getElementById('usdRate')?.value || 0);
  const source = document.getElementById('usdSource')?.value?.trim() || '';
  if (!amount || !rate) return showToast('Montant et taux requis', 'error');
  const purchase = { id: generateId('usd'), date: getLocalDateString(), amount, rate, totalDzd: amount * rate, source, createdAt: Date.now() };
  if (!appState.usdPurchases) appState.usdPurchases = [];
  appState.usdPurchases.push(purchase);
  closeModal('usdPurchaseModal');
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
  showToast('Achat USD enregistré', 'success');
};

window.deleteUsdPurchase = function(id) {
  if (!confirm('Supprimer cet achat USD ?')) return;
  appState.usdPurchases = (appState.usdPurchases || []).filter(p => p.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.openRequestModal = function(id) {
  const req = (appState.clientRequests || []).find(r => r.id === id);
  if (!req) return;
  req.read = true;
  if (typeof autoSave === 'function') autoSave();
  alert(`Détails de la demande:\n\nClient: ${req.instagram || req.pageFacebook || ''}\nOffre: ${req.offer || ''}\nLien: ${req.pubLink || ''}`);
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.deleteRequest = function(id) {
  if (!confirm('Supprimer cette demande ?')) return;
  appState.clientRequests = (appState.clientRequests || []).filter(r => r.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.sendWhatsAppReminder = function(clientId) {
  const client = (appState.clients || []).find(c => c.id === clientId);
  if (!client || !client.unpaid) return;
  const phone = normalizePhoneForWhatsApp(client.phone || client.contact);
  if (!phone) return showToast('Numéro WhatsApp invalide ou absent', 'error');

  const message = encodeURIComponent(
    `Bonjour ${client.name},\n\n` +
    `C'est Hichem Sponsor. Sauf erreur de notre part, il reste un montant impayé de ${formatCurrency(client.unpaid)} concernant vos dernières transactions.\n\n` +
    `Pourriez-vous nous confirmer le règlement dès que possible ?\n\n` +
    `Merci de votre confiance !`
  );
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};

window.addAdAccount = function() {
  const name = document.getElementById('accName')?.value?.trim();
  const platform = document.getElementById('accPlatform')?.value || 'meta';
  const balance = Number(document.getElementById('accBalance')?.value || 0);
  if (!name) return showToast('Nom du compte requis', 'error');
  const account = { id: generateId('acc'), name, platform, balance, status: 'active', updatedAt: Date.now() };
  if (!appState.adAccounts) appState.adAccounts = [];
  appState.adAccounts.push(account);
  closeModal('adAccountModal');
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
  showToast('Compte publicitaire ajouté', 'success');
};

window.deleteAdAccount = function(id) {
  if (!confirm('Supprimer ce compte publicitaire ?')) return;
  appState.adAccounts = (appState.adAccounts || []).filter(a => a.id !== id);
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
};

window.rechargeAdAccount = function(id) {
  const amountStr = prompt('Montant de la recharge ($) :');
  if (amountStr === null) return;
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return showToast('Montant invalide', 'error');
  const acc = (appState.adAccounts || []).find(a => a.id === id);
  if (!acc) return;
  acc.balance = Number(acc.balance || 0) + amount;
  acc.updatedAt = Date.now();
  if (typeof autoSave === 'function') autoSave();
  if (typeof renderCurrentTab === 'function') renderCurrentTab();
  showToast(`Compte rechargé de ${amount}$`, 'success');
};

window.filterClients = function() {
  const search = (document.getElementById('clientSearch')?.value || '').toLowerCase();
  const rows = document.querySelectorAll('#clientsTableBody tr');
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(search) ? '' : 'none';
  });
};

window.calculateRedotpayUsd = function() {
  const dzdInput = document.getElementById('redotpayDzdAmount');
  const usdDisplay = document.getElementById('redotpayUsdDisplay');
  if (!dzdInput || !usdDisplay) return;
  const dzd = parseFloat(dzdInput.value) || 0;
  const rate = window.getRedotpayRate ? window.getRedotpayRate() : 250;
  usdDisplay.textContent = `${(dzd / rate).toFixed(2)} $`;
};

window.previewFile = function(input) {
  const preview = document.getElementById('filePreview');
  if (!preview) return;
  if (input?.files && input.files[0]) {
    const file = input.files[0];
    preview.innerHTML = `<p class="text-green-600 font-bold">${file.name}</p>`;
  }
};

window.handleOrderSubmit = async function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Envoi en cours...';
    btn.disabled = true;
  }

  try {
    const platform = document.getElementById('platformSelect')?.value || 'N/A';
    const paymentMethod = document.getElementById('paymentMethodSelect')?.value || 'N/A';
    const token = localStorage.getItem('clientToken') || generateId('client_token');
    if (!localStorage.getItem('clientToken')) localStorage.setItem('clientToken', token);

    const orderData = {
      id: 'REQ-' + Date.now(),
      date: getLocalDateString(),
      read: false,
      processed: false,
      platform,
      paymentMethod,
      paymentProof: null,
      status: 'pending',
      clientToken: token
    };

    if (platform === 'meta') {
      orderData.metaObjective = document.getElementById('metaObjective')?.value;
      const followersTarget = document.querySelector('input[name="metaFollowersTarget"]:checked');
      if (followersTarget) orderData.metaFollowersTarget = followersTarget.value;
      const messagesTarget = document.querySelectorAll('input[name="metaMsgTarget"]:checked');
      if (messagesTarget.length > 0) {
        orderData.metaMessagesTarget = Array.from(messagesTarget).map(cb => cb.value).join(', ');
      }
    } else if (platform === 'tiktok') {
      orderData.tiktokObjective = document.getElementById('tiktokObjective')?.value;
      const tiktokMsg = document.querySelector('input[name="tiktokMsgTarget"]:checked');
      if (tiktokMsg) orderData.tiktokMsgTarget = tiktokMsg.value;
    }

    orderData.instagram = document.getElementById('metaInstaName')?.value || '';
    orderData.pageFacebook = document.getElementById('metaFbName')?.value || '';
    orderData.offer = document.getElementById('orderOfferSelect')?.value || '';
    orderData.websiteUrl = document.getElementById('websiteUrl')?.value || '';
    orderData.pubLink = document.getElementById('pubLink')?.value || '';
    orderData.clientNote = document.getElementById('clientNote')?.value || '';

    const proofInput = document.getElementById('paymentProof');
    if (proofInput && proofInput.files && proofInput.files[0]) {
      const file = proofInput.files[0];
      if (file.size > 5 * 1024 * 1024) throw new Error("L'image est trop volumineuse (Max 5MB)");
      if (typeof readFileAsDataURL === 'function') orderData.paymentProof = await readFileAsDataURL(file);
    }

    if (paymentMethod === 'redotpay') {
      const dzdAmount = parseFloat(document.getElementById('redotpayDzdAmount')?.value || 0);
      orderData.paymentDetails = {
        method: 'RedotPay',
        dzdAmount,
        usdToSend: dzdAmount / (window.getRedotpayRate ? window.getRedotpayRate() : 250)
      };
    }

    if (!appState.clientRequests) appState.clientRequests = [];
    appState.clientRequests.push(orderData);
    if (typeof autoSave === 'function') autoSave();

    showToast('Commande envoyée avec succès !', 'success');
    e.target.reset();
    const filePreview = document.getElementById('filePreview');
    if (filePreview) filePreview.innerHTML = '';
  } catch (error) {
    console.error('Erreur commande:', error);
    showToast(error?.message || "Erreur lors de l'envoi de la commande", 'error');
  } finally {
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
};
