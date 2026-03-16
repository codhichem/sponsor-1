// === UI-RENDER.JS ===

/**
 * Affiche un onglet spécifique
 * @param {string} tabId 
 */
window.showTab = function(tabId) {
  appState.currentTab = tabId;
  
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('bg-blue-600', 'text-white');
    b.classList.add('bg-gray-100', 'text-gray-700');
  });
  
  const btn = document.querySelector(`button[onclick="showTab('${tabId}')"]`);
  if (btn) {
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    btn.classList.add('bg-blue-600', 'text-white');
  }
  
  renderCurrentTab();
};

/**
 * Rend le contenu de l'onglet actuel
 */
window.renderCurrentTab = function() {
  const tab = appState.currentTab || 'dashboard';
  const container = document.getElementById('tabContentContainer');
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  switch(tab) {
    case 'dashboard': renderDashboard(container); break;
    case 'clients': renderClientsTable(container); break;
    case 'transactions': renderTodoTable(container); break;
    case 'history': renderTransactionsTable(container); break;
    case 'todo': renderNewTodoForm(container); break;
    case 'offers': renderOffersGrid(container); break;
    case 'paiements': renderPaymentsTable(container); break;
    case 'achats': renderUsdPurchasesTable(container); break;
    case 'reminders': renderRemindersTable(container); break;
    case 'ad-accounts': renderAdAccountsTable(container); break;
    case 'requests': renderRequests(container); break;
    case 'settings': renderSettingsAdmin(container); break;
  }
};

/**
 * Rend le Dashboard (Stats, etc.)
 */
window.renderDashboard = function(container) {
  recalculateFinanceBalances();
  const b = appState.balances || { liquide: 0, baridimob: 0, usdt: 0 };
  const role = getUserRole();
  const isAdmin = role === 'admin';
  
  container.innerHTML = `
    ${isAdmin ? `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-l-8 border-green-500 fade-in dark:border-gray-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
            <i class="fas fa-money-bill-wave text-2xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Liquide</h3>
            <p class="text-3xl font-black text-gray-800 dark:text-white">${formatCurrency(b.liquide)}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-l-8 border-blue-500 fade-in dark:border-gray-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <i class="fas fa-university text-2xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">BaridiMob</h3>
            <p class="text-3xl font-black text-gray-800 dark:text-white">${formatCurrency(b.baridimob)}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border-l-8 border-purple-500 fade-in dark:border-gray-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
            <i class="fas fa-coins text-2xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock USDT</h3>
            <p class="text-3xl font-black text-gray-800 dark:text-white">${safeToFixed(b.usdt)} <span class="text-sm font-bold text-purple-400">USDT</span></p>
          </div>
        </div>
      </div>
    </div>
    ` : `
    <div class="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl mb-8 text-center border dark:border-blue-800">
       <h2 class="text-2xl font-black text-blue-800 dark:text-blue-300">Bienvenue, Session Employé</h2>
       <p class="text-blue-600 dark:text-blue-400 font-bold">Consultez la To-Do List pour commencer votre travail.</p>
    </div>
    `}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <i class="fas fa-tasks text-indigo-500"></i> To-Do List Aperçu
          </h3>
          <div id="todoPreviewList" class="space-y-3">
             <!-- Rempli par renderTodoPreview -->
          </div>
          <button onclick="showTab('transactions')" class="w-full mt-4 py-2 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition">
            Voir tout
          </button>
       </div>
       <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <i class="fas fa-users text-blue-500"></i> Clients Récents
          </h3>
          <div id="topClientsPreview" class="space-y-3">
             <!-- Rempli par renderTopClients -->
          </div>
          <button onclick="showTab('clients')" class="w-full mt-4 py-2 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition">
            Gérer les clients
          </button>
       </div>
    </div>

    ${isAdmin ? `
    <!-- Analytics Section -->
    <div class="mt-8 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
       <h3 class="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
         <i class="fas fa-chart-line text-green-500"></i> Performance Mensuelle
       </h3>
       <div class="h-64">
          <canvas id="monthlyStatsChart"></canvas>
       </div>
    </div>
    ` : ''}
  `;
  
  renderTodoPreview();
  renderTopClients();
  if (isAdmin) renderMonthlyStatsChart();
};

/**
 * Rend le tableau des clients
 */
window.renderClientsTable = function(container) {
  const clients = appState.clients || [];
  
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border dark:border-gray-700 fade-in">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Base de Données Clients</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm">${clients.length} clients enregistrés</p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <input type="text" id="clientSearch" oninput="filterClients()" placeholder="Rechercher un client..." class="flex-grow md:w-64 p-3 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-900 dark:text-white">
          <button onclick="openModal('clientModal')" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
            <i class="fas fa-plus"></i> Nouveau
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b dark:border-gray-700">
              <th class="p-4">Client</th>
              <th class="p-4">Contact / WhatsApp</th>
              <th class="p-4">Dépensé</th>
              <th class="p-4">Dette (Impayé)</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody id="clientsTableBody" class="divide-y dark:divide-gray-700 text-sm">
            ${clients.map(c => `
              <tr class="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-gray-800 dark:text-gray-200">${c.name}</div>
                  <div class="text-[10px] text-gray-400 font-mono">${c.id}</div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-600 dark:text-gray-400">${c.phone || c.contact || '-'}</span>
                    ${c.phone ? `<a href="${buildClientWhatsAppLink(c)}" target="_blank" class="text-green-500 hover:text-green-600"><i class="fab fa-whatsapp"></i></a>` : ''}
                  </div>
                </td>
                <td class="p-4 font-bold text-gray-700 dark:text-gray-300">${formatCurrency(c.totalSpent || 0)}</td>
                <td class="p-4">
                  <span class="font-black ${Number(c.unpaid || 0) > 0 ? 'text-red-600' : 'text-green-600'}">
                    ${formatCurrency(c.unpaid || 0)}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button onclick="editClient('${c.id}')" class="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg" title="Modifier">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteClient('${c.id}')" class="p-2 text-gray-400 hover:text-red-600 rounded-lg" title="Supprimer">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/**
 * Rend l'historique complet des transactions
 */
window.renderTransactionsTable = function(container) {
  const txs = [...(appState.transactions || [])].sort((a, b) => b.createdAt - a.createdAt);
  
  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-6 border fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Historique des Transactions</h2>
        <button onclick="exportTransactions()" class="text-blue-600 font-bold flex items-center gap-2">
           <i class="fas fa-file-csv"></i> Export CSV
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs font-black uppercase border-b">
              <th class="p-4">Date</th>
              <th class="p-4">Client</th>
              <th class="p-4">Offre</th>
              <th class="p-4 text-right">Montant ($)</th>
              <th class="p-4 text-right">Prix (DZD)</th>
              <th class="p-4 text-center">Statut</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${txs.map(t => `
              <tr class="hover:bg-gray-50">
                <td class="p-4 text-gray-500">${formatDate(t.date)}</td>
                <td class="p-4 font-bold">${t.clientName}</td>
                <td class="p-4 text-gray-600">${t.offerName}</td>
                <td class="p-4 text-right font-mono">${t.amount} $</td>
                <td class="p-4 text-right font-black text-indigo-600">${formatCurrency(t.priceDzd)}</td>
                <td class="p-4 text-center">
                  <span class="px-2 py-1 rounded-full text-[10px] font-black ${t.status === 'problem' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                    ${t.status === 'problem' ? 'PROBLÈME' : 'VALIDÉ'}
                  </span>
                </td>
                <td class="p-4 text-center">
                   <div class="flex justify-center gap-2">
                      <button onclick="editTransaction('${t.id}')" class="text-blue-600"><i class="fas fa-edit"></i></button>
                      <button onclick="deleteTransaction('${t.id}')" class="text-red-400"><i class="fas fa-trash-alt"></i></button>
                   </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/**
 * Rend le tableau des paiements
 */
window.renderPaymentsTable = function(container) {
  const payments = [...(appState.payments || [])].sort((a, b) => b.createdAt - a.createdAt);
  
  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-6 border fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Historique des Paiements</h2>
        <button onclick="openModal('paymentModal')" class="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
          <i class="fas fa-plus mr-2"></i> Nouveau Paiement
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs font-black uppercase border-b">
              <th class="p-4">Date</th>
              <th class="p-4">Client</th>
              <th class="p-4">Montant</th>
              <th class="p-4">Méthode</th>
              <th class="p-4">Note</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${payments.map(p => `
              <tr class="hover:bg-gray-50">
                <td class="p-4 text-gray-500">${formatDate(p.date)}</td>
                <td class="p-4 font-bold">${p.clientName}</td>
                <td class="p-4 font-black text-green-600">${formatCurrency(p.amount)}</td>
                <td class="p-4 text-gray-600">${p.method}</td>
                <td class="p-4 text-gray-400 italic text-xs max-w-xs truncate">${p.note || '-'}</td>
                <td class="p-4 text-center">
                   <button onclick="deletePayment('${p.id}')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/**
 * Rend le tableau des achats USD
 */
window.renderUsdPurchasesTable = function(container) {
  const purchases = [...(appState.usdPurchases || [])].sort((a, b) => b.createdAt - a.createdAt);
  
  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-6 border fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Stock USD / Achats</h2>
        <button onclick="openModal('usdPurchaseModal')" class="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
          <i class="fas fa-plus mr-2"></i> Nouvel Achat
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs font-black uppercase border-b">
              <th class="p-4">Date</th>
              <th class="p-4">Montant USD</th>
              <th class="p-4">Taux (DZD)</th>
              <th class="p-4">Total DZD</th>
              <th class="p-4">Source</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${purchases.map(p => `
              <tr class="hover:bg-gray-50">
                <td class="p-4 text-gray-500">${formatDate(p.date)}</td>
                <td class="p-4 font-black text-teal-600">${safeToFixed(p.amount, 2)} $</td>
                <td class="p-4 text-gray-600">${p.rate}</td>
                <td class="p-4 font-bold text-gray-700">${formatCurrency(p.totalDzd)}</td>
                <td class="p-4 text-gray-500 text-xs">${p.source || '-'}</td>
                <td class="p-4 text-center">
                   <button onclick="deleteUsdPurchase('${p.id}')" class="text-red-400"><i class="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/**
 * Rend les demandes clients
 */
window.renderRequests = function(container) {
  const reqs = [...(appState.clientRequests || [])].sort((a, b) => b.createdAt - a.createdAt);
  
  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-6 border fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Demandes Clients (${reqs.length})</h2>
      <div class="grid grid-cols-1 gap-4">
        ${reqs.map(r => `
          <div class="p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 ${r.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}">
            <div class="flex items-center gap-4 w-full">
              <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <i class="fas ${r.platform === 'meta' ? 'fa-facebook text-blue-600' : 'fa-tiktok text-black'}"></i>
              </div>
              <div>
                <div class="font-bold text-gray-800">${r.instagram || r.pageFacebook || 'Client'}</div>
                <div class="text-[10px] text-gray-500">${formatDate(r.date)}</div>
                <div class="text-xs font-bold text-indigo-600">${r.offer || 'Offre Perso'}</div>
              </div>
            </div>
            <div class="flex gap-2 w-full md:w-auto justify-end">
               <button onclick="openRequestModal('${r.id}')" class="px-4 py-2 bg-white border rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50">Détails</button>
               <button onclick="deleteRequest('${r.id}')" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100">Supprimer</button>
            </div>
          </div>
        `).join('')}
        ${reqs.length === 0 ? '<p class="text-center text-gray-400 py-8 italic">Aucune demande pour le moment.</p>' : ''}
      </div>
    </div>
  `;
};

/**
 * Rend les paramètres admin
 */
window.renderSettingsAdmin = function(container) {
  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-8 border fade-in max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
        <i class="fas fa-cog text-gray-600"></i> Paramètres Système
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Configuration Financière -->
        <div class="space-y-6">
          <h3 class="font-bold text-lg text-gray-700 border-b pb-2">Configuration Financière</h3>
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-2">Taux Achat USD (Défaut)</label>
            <input type="number" value="${getBuyRate()}" class="w-full p-3 border rounded-xl bg-gray-50">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-2">Taux Vente USD (Défaut)</label>
            <input type="number" value="${getSellRate()}" class="w-full p-3 border rounded-xl bg-gray-50">
          </div>
        </div>
        
        <!-- Synchronisation -->
        <div class="space-y-6">
          <h3 class="font-bold text-lg text-gray-700 border-b pb-2">Cloud & Synchro</h3>
          <div class="p-4 bg-blue-50 rounded-2xl border border-blue-100">
             <div class="flex items-center justify-between mb-4">
               <span class="text-sm font-bold text-blue-800">Statut Firebase</span>
               <span class="px-2 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase">Connecté</span>
             </div>
             <button onclick="forceCloudSave()" class="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition">
               <i class="fas fa-sync-alt mr-2"></i> Forcer la Synchro
             </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Rend la grille des offres (Admin)
 */
window.renderOffersGrid = function(container) {
  const offers = appState.offers || [];
  
  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-6 border fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestion des Offres</h2>
        <button onclick="openModal('offerModal')" class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
          <i class="fas fa-plus mr-2"></i> Nouvelle Offre
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${offers.map(o => `
          <div class="p-6 border rounded-3xl bg-gray-50 hover:shadow-lg transition-all relative group">
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onclick="editOffer('${o.id}')" class="text-blue-600"><i class="fas fa-edit"></i></button>
               <button onclick="deleteOffer('${o.id}')" class="text-red-400"><i class="fas fa-trash-alt"></i></button>
            </div>
            <h3 class="text-lg font-black text-gray-800 mb-2">${o.name}</h3>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2">${o.description || '-'}</p>
            <div class="flex justify-between items-end">
              <div>
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Prix Vente</div>
                <div class="text-xl font-black text-purple-600">${formatCurrency(o.priceDzd)}</div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coût</div>
                <div class="text-sm font-bold text-gray-600">${o.costPerUnit} $</div>
              </div>
            </div>
          </div>
        `).join('')}
        ${offers.length === 0 ? '<p class="col-span-full text-center text-gray-400 py-12 italic">Aucune offre définie.</p>' : ''}
      </div>
    </div>
  `;
};

/**
 * To-Do List Aperçu (Dashboard)
 */
window.renderTodoPreview = function() {
  const preview = document.getElementById('todoPreviewList');
  if (!preview) return;
  
  const normalTodos = (appState.todoTransactions || []).filter(t => t.status === 'pending');
  const problems = (appState.transactions || []).filter(t => t.status === 'problem');
  
  const allPreview = [
      ...problems.map(t => ({ ...t, isProblem: true })),
      ...normalTodos.map(t => ({ ...t, isProblem: false }))
  ].slice(0, 5);

  if (allPreview.length === 0) {
    preview.innerHTML = '<p class="text-gray-400 italic text-center py-4">Tout est à jour !</p>';
    return;
  }
  
  preview.innerHTML = allPreview.map(t => `
    <div onclick="showTab('transactions')" class="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full flex items-center justify-center ${t.isProblem ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}">
          <i class="fas ${t.isProblem ? 'fa-exclamation-triangle' : 'fa-clock'} text-xs"></i>
        </div>
        <div>
          <div class="font-bold text-gray-800 text-xs">${t.clientName}</div>
          <div class="text-[10px] text-gray-500">${t.offerName}</div>
        </div>
      </div>
      <div class="text-right font-black text-indigo-600 text-xs">
        ${formatCurrency(t.priceDzd)}
      </div>
    </div>
  `).join('');
};

/**
 * Aperçu Clients (Dashboard)
 */
window.renderTopClients = function() {
  const preview = document.getElementById('topClientsPreview');
  if (!preview) return;
  
  const sortedClients = [...(appState.clients || [])]
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    .slice(0, 5);

  if (sortedClients.length === 0) {
    preview.innerHTML = '<p class="text-gray-400 italic text-center py-4">Aucun client enregistré.</p>';
    return;
  }
  
  preview.innerHTML = sortedClients.map(c => `
    <div onclick="showTab('clients')" class="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
          ${c.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div class="font-bold text-gray-800 text-xs">${c.name}</div>
          <div class="text-[10px] text-red-500 font-bold">${c.unpaid > 0 ? 'Dette: ' + formatCurrency(c.unpaid) : 'À jour'}</div>
        </div>
      </div>
      <div class="text-right font-black text-gray-700 text-xs">
        ${formatCurrency(c.totalSpent || 0)}
      </div>
    </div>
  `).join('');
};

/**
 * Rend le formulaire de nouvelle To-Do
 */
window.renderNewTodoForm = function(container) {
  const clients = appState.clients || [];
  const offers = appState.offers || [];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-xl p-8 border fade-in max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <i class="fas fa-plus-circle text-indigo-600"></i> Nouvelle Tâche (To-Do)
      </h2>
      <form id="newTodoForm" onsubmit="handleNewTodoSubmit(event)" class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Client</label>
          <select id="todoClientId" required class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
            <option value="">-- Sélectionner un client --</option>
            ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Offre</label>
          <input type="text" id="todoOfferSearch" oninput="filterTodoOffers()" placeholder="Rechercher une offre..." class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 mb-3">
          <select id="todoOfferId" required onchange="updateTodoPrice()" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
            <option value="">-- Sélectionner une offre --</option>
            <option value="__custom__">Offre personnalisée (manuel)</option>
            ${offers.map(o => `<option value="${o.id}">${o.name} (${formatCurrency(o.priceDzd ?? o.price)})</option>`).join('')}
          </select>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span id="todoOfferMatchCount"></span>
            <button type="button" onclick="clearTodoOfferSearch()" class="text-indigo-600 font-bold">Effacer</button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Prix (DZD)</label>
            <input type="number" id="todoPrice" required class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
            <div class="text-xs text-gray-500 mt-2">Prix DZD = le prix facturé au client (en dinar).</div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Statut Paiement</label>
            <div class="flex items-center gap-4 p-4 border rounded-2xl bg-gray-50">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="todoPaid" class="w-5 h-5 text-indigo-600">
                <span class="font-bold text-gray-700">Payé</span>
              </label>
            </div>
          </div>
        </div>
        <div id="todoCustomOfferFields" class="hidden p-5 border rounded-2xl bg-gray-50 space-y-4">
          <div class="text-sm font-black text-gray-800">Offre personnalisée</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Nom</label>
              <input type="text" id="todoCustomName" placeholder="Ex: Pack personnalisé" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Montant (USD)</label>
              <input type="number" step="0.01" id="todoCustomUsd" placeholder="Ex: 20" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Durée (jours)</label>
              <input type="number" step="1" id="todoCustomDuration" placeholder="Ex: 7" class="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
            </div>
          </div>
        </div>
        <button type="submit" class="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3">
          <i class="fas fa-save"></i> ENREGISTRER DANS LA TO-DO
        </button>
      </form>
    </div>
  `;
  if (typeof filterTodoOffers === 'function') filterTodoOffers();
};

/**
 * Affiche le graphique des statistiques mensuelles
 */
/**
 * Rend le tableau des relances (dettes)
 */
window.renderRemindersTable = function(container) {
  const clientsWithDebt = (appState.clients || []).filter(c => (c.unpaid || 0) > 0);
  
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border dark:border-gray-700 fade-in">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Dettes & Relances</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm">${clientsWithDebt.length} clients ont des impayés</p>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        ${clientsWithDebt.map(c => `
          <div class="p-5 border dark:border-gray-700 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 bg-red-50/30 dark:bg-red-900/10">
            <div class="flex items-center gap-4 w-full">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                <i class="fas fa-exclamation-circle text-xl"></i>
              </div>
              <div>
                <div class="font-bold text-gray-800 dark:text-white text-lg">${c.name}</div>
                <div class="text-sm text-red-600 dark:text-red-400 font-black">Dette: ${formatCurrency(c.unpaid)}</div>
              </div>
            </div>
            <div class="flex gap-2 w-full md:w-auto">
               <button onclick="sendWhatsAppReminder('${c.id}')" class="flex-grow md:flex-none px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                 <i class="fab fa-whatsapp"></i> Relancer
               </button>
               <button onclick="showTab('paiements')" class="px-6 py-3 bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600">
                 Régler
               </button>
            </div>
          </div>
        `).join('')}
        ${clientsWithDebt.length === 0 ? '<p class="text-center text-gray-400 py-12 italic">Aucune dette en cours. Félicitations !</p>' : ''}
      </div>
    </div>
  `;
};

/**
 * Rend le tableau des comptes publicitaires
 */
window.renderAdAccountsTable = function(container) {
  const accounts = appState.adAccounts || [];
  
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border dark:border-gray-700 fade-in">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Comptes Publicitaires</h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Suivi des soldes et plateformes</p>
        </div>
        <button onclick="openModal('adAccountModal')" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
          <i class="fas fa-plus"></i> Nouveau Compte
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${accounts.map(acc => `
          <div class="p-6 border dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:shadow-lg transition-all relative group">
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onclick="editAdAccount('${acc.id}')" class="text-blue-600"><i class="fas fa-edit"></i></button>
               <button onclick="deleteAdAccount('${acc.id}')" class="text-red-400"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center ${acc.platform === 'meta' ? 'bg-blue-100 text-blue-600' : 'bg-black text-white'}">
                <i class="fab ${acc.platform === 'meta' ? 'fa-facebook' : 'fa-tiktok'} text-xl"></i>
              </div>
              <h3 class="text-lg font-black text-gray-800 dark:text-white">${acc.name}</h3>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Solde Actuel</div>
                <div class="text-xl font-black ${acc.balance < 10 ? 'text-red-500' : 'text-green-600'}">${safeToFixed(acc.balance, 2)} $</div>
              </div>
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${acc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                ${acc.status}
              </span>
            </div>
            <button onclick="rechargeAdAccount('${acc.id}')" class="w-full mt-4 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
              Recharger
            </button>
          </div>
        `).join('')}
        ${accounts.length === 0 ? '<p class="col-span-full text-center text-gray-400 py-12 italic">Aucun compte configuré.</p>' : ''}
      </div>
    </div>
  `;
};

window.renderMonthlyStatsChart = function() {
  const ctx = document.getElementById('monthlyStatsChart');
  if (!ctx) return;

  // Calculer les données par mois
  const transactions = appState.transactions || [];
  const monthlyData = {};
  
  // Initialiser les 6 derniers mois
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleString('fr-FR', { month: 'short' });
    monthlyData[monthKey] = { income: 0, profit: 0 };
  }

  transactions.forEach(t => {
    const d = new Date(t.date);
    const monthKey = d.toLocaleString('fr-FR', { month: 'short' });
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].income += (t.priceDzd || 0);
      // Estimation simple du profit (Prix Vente - Coût USD * Taux)
      const costDzd = (t.amount || 0) * (appState.settings?.buyRate || 245);
      monthlyData[monthKey].profit += ((t.priceDzd || 0) - costDzd);
    }
  });

  const labels = Object.keys(monthlyData);
  const incomeData = labels.map(l => monthlyData[l].income);
  const profitData = labels.map(l => monthlyData[l].profit);

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const gridColor = isDark ? '#374151' : '#f3f4f6';

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenus (DZD)',
          data: incomeData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Profit Est. (DZD)',
          data: profitData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor }
        }
      }
    }
  });
};

window.renderTables = function() {
  renderCurrentTab();
};
