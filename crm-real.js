// CRM RÉEL - INTÉGRATION DIRECTE AVEC APPSTATE ET FIREBASE

let currentSection = 'dashboard';

// Basculer le CRM réel
function toggleRealCrm() {
    const panel = document.getElementById('realCrmPanel');
    if (!panel) return;
    panel.classList.toggle('translate-x-full');
    
    if (!panel.classList.contains('translate-x-full')) {
        refreshCrmDisplay();
    }
}

// Rafraîchir l'affichage du CRM en utilisant appState
function refreshCrmDisplay() {
    const content = document.getElementById('realCrmContentInner');
    if (!content) return;
    
    // Attendre que window.appState soit prêt et contienne des données
    if (!window.appState || !Array.isArray(window.appState.clients)) {
        console.log("CRM: Waiting for appState...");
        content.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p class="text-gray-600 font-medium">Initialisation du CRM...</p>
                <p class="text-xs text-gray-400 mt-2">Vérification de la base de données...</p>
            </div>
        `;
        setTimeout(refreshCrmDisplay, 500);
        return;
    }
    
    showSection(currentSection);
    updateDataStatus();
}

// Afficher une section spécifique
function showSection(section) {
    currentSection = section;
    const container = document.getElementById('realCrmContentInner');
    if (!container) return;
    
    // Mettre à jour les boutons du menu
    document.querySelectorAll('.crm-nav-btn').forEach(btn => {
        btn.classList.toggle('bg-blue-600', btn.dataset.section === section);
        btn.classList.toggle('text-white', btn.dataset.section === section);
    });

    switch(section) {
        case 'dashboard': showDashboard(container); break;
        case 'clients': showClients(container); break;
        case 'ai_agent': showAiAgent(container); break;
        case 'transactions': showTransactions(container); break;
        default: showDashboard(container);
    }
}

// SECTION: DASHBOARD
function showDashboard(container) {
    const stats = calculateCrmStats();
    const appState = window.appState;
    
    container.innerHTML = `
        <div class="fade-in">
            <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i class="fas fa-chart-pie text-blue-600"></i> Dashboard Intégré
            </h3>
            
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl text-white shadow-lg">
                    <div class="text-xs opacity-80 uppercase font-bold tracking-wider">Clients Totaux</div>
                    <div class="text-3xl font-black mt-1">${appState.clients.length}</div>
                </div>
                <div class="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl text-white shadow-lg">
                    <div class="text-xs opacity-80 uppercase font-bold tracking-wider">Chiffre d'Affaire</div>
                    <div class="text-xl font-black mt-1">${formatCrmMoney(stats.revenue)}</div>
                </div>
                <div class="bg-gradient-to-br from-rose-500 to-pink-600 p-4 rounded-2xl text-white shadow-lg">
                    <div class="text-xs opacity-80 uppercase font-bold tracking-wider">Dépenses Totales</div>
                    <div class="text-xl font-black mt-1">${formatCrmMoney(stats.expenses)}</div>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl text-white shadow-lg">
                    <div class="text-xs opacity-80 uppercase font-bold tracking-wider">Bénéfice Net</div>
                    <div class="text-xl font-black mt-1">${formatCrmMoney(stats.profit)}</div>
                </div>
            </div>

            <div class="bg-white border rounded-2xl p-4 shadow-sm mb-6">
                <h4 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <i class="fas fa-robot text-purple-600"></i> Statut Agent IA
                </h4>
                <div class="flex justify-around">
                    <div class="text-center">
                        <div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center ${(appState.settings.aiConfig && appState.settings.aiConfig.instagram && appState.settings.aiConfig.instagram.enabled) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} mb-2">
                            <i class="fab fa-instagram text-xl"></i>
                        </div>
                        <div class="text-[10px] font-bold uppercase">${(appState.settings.aiConfig && appState.settings.aiConfig.instagram && appState.settings.aiConfig.instagram.enabled) ? 'Connecté' : 'Off'}</div>
                    </div>
                    <div class="text-center">
                        <div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center ${(appState.settings.aiConfig && appState.settings.aiConfig.whatsapp && appState.settings.aiConfig.whatsapp.enabled) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} mb-2">
                            <i class="fab fa-whatsapp text-xl"></i>
                        </div>
                        <div class="text-[10px] font-bold uppercase">${(appState.settings.aiConfig && appState.settings.aiConfig.whatsapp && appState.settings.aiConfig.whatsapp.enabled) ? 'Connecté' : 'Off'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// SECTION: CLIENTS RÉELS
function showClients(container) {
    const appState = window.appState;
    container.innerHTML = `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-gray-800">👥 Vos ${appState.clients.length} Clients</h3>
            </div>
            
            <div class="space-y-4">
                ${appState.clients.slice(0, 50).map(client => `
                    <div class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500">
                        <div class="font-bold text-gray-800 text-lg">${client.name || 'Sans Nom'}</div>
                        <div class="text-sm text-gray-500 mb-2 flex items-center gap-2">
                            <i class="fas fa-phone-alt text-xs"></i> ${client.phone || client.contact || 'N/A'}
                        </div>
                        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                            <div class="text-xs font-bold text-blue-600 uppercase">Total Dépensé</div>
                            <div class="font-black text-gray-800">${formatCrmMoney(client.totalSpent || 0)}</div>
                        </div>
                    </div>
                `).join('')}
                ${appState.clients.length > 50 ? `<p class="text-center text-xs text-gray-400 py-4">Et ${appState.clients.length - 50} autres clients...</p>` : ''}
            </div>
        </div>
    `;
}

// SECTION: AGENT IA CONFIGURATION
function showAiAgent(container) {
    const appState = window.appState;
    if (!appState.settings.aiConfig) {
        appState.settings.aiConfig = {
            instagram: { enabled: false, apiKey: '', welcomeMsg: '' },
            whatsapp: { enabled: false, apiKey: '', welcomeMsg: '' }
        };
    }
    const aiConfig = appState.settings.aiConfig;

    container.innerHTML = `
        <div class="fade-in">
            <h3 class="text-xl font-bold text-gray-800 mb-6">🤖 Configuration Agent IA</h3>
            
            <!-- INSTAGRAM -->
            <div class="bg-white border rounded-3xl p-6 shadow-sm mb-6 border-l-8 border-pink-500">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center text-2xl">
                            <i class="fab fa-instagram"></i>
                        </div>
                        <div>
                            <div class="font-bold text-lg">Instagram Bot</div>
                            <div class="text-xs text-gray-500">Réponses automatiques DM</div>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" ${aiConfig.instagram.enabled ? 'checked' : ''} onchange="updateAiCrmStatus('instagram', this.checked)">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Clé API (Meta Developers)</label>
                        <input type="password" value="${aiConfig.instagram.apiKey || ''}" placeholder="EAA..." class="w-full p-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" onchange="updateAiCrmConfig('instagram', 'apiKey', this.value)">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Message de Bienvenue</label>
                        <textarea placeholder="Bonjour ! Comment puis-je vous aider ?" class="w-full p-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none h-20" onchange="updateAiCrmConfig('instagram', 'welcomeMsg', this.value)">${aiConfig.instagram.welcomeMsg || ''}</textarea>
                    </div>
                </div>
            </div>

            <!-- WHATSAPP -->
            <div class="bg-white border rounded-3xl p-6 shadow-sm mb-6 border-l-8 border-green-500">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <div>
                            <div class="font-bold text-lg">WhatsApp Agent</div>
                            <div class="text-xs text-gray-500">Support Client Automatisé</div>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" ${aiConfig.whatsapp.enabled ? 'checked' : ''} onchange="updateAiCrmStatus('whatsapp', this.checked)">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Instance ID / Token</label>
                        <input type="password" value="${aiConfig.whatsapp.apiKey || ''}" placeholder="Token WhatsApp API..." class="w-full p-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" onchange="updateAiCrmConfig('whatsapp', 'apiKey', this.value)">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Réponse Automatique IA</label>
                        <textarea placeholder="Dites-nous quel service vous intéresse..." class="w-full p-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none h-20" onchange="updateAiCrmConfig('whatsapp', 'welcomeMsg', this.value)">${aiConfig.whatsapp.welcomeMsg || ''}</textarea>
                    </div>
                </div>
            </div>

            <button onclick="saveAiCrmSettings()" class="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-black transition-all">
                <i class="fas fa-save mr-2"></i> Enregistrer la Configuration IA
            </button>
        </div>
    `;
}

// SECTION: COMPTES (Transactions)
function showTransactions(container) {
    const appState = window.appState;
    container.innerHTML = `
        <div class="fade-in">
            <h3 class="text-xl font-bold text-gray-800 mb-6">💳 Transactions Récentes</h3>
            <div class="space-y-4">
                ${appState.transactions.slice(0, 30).map(t => `
                    <div class="bg-white border rounded-2xl p-4 shadow-sm">
                        <div class="flex justify-between items-start mb-2">
                            <div class="font-bold text-gray-800">${t.clientName || 'Client inconnu'}</div>
                            <div class="text-xs text-gray-400">${t.date}</div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="text-sm text-gray-600">${t.offerName || 'Transaction'}</div>
                            <div class="font-black text-blue-600">${formatCrmMoney(t.priceDzd || 0)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// FONCTIONS DE MISE À JOUR IA
function updateAiCrmStatus(platform, enabled) {
    if (!window.appState.settings.aiConfig) window.appState.settings.aiConfig = { instagram: {}, whatsapp: {} };
    window.appState.settings.aiConfig[platform].enabled = enabled;
}

function updateAiCrmConfig(platform, field, value) {
    if (!window.appState.settings.aiConfig) window.appState.settings.aiConfig = { instagram: {}, whatsapp: {} };
    window.appState.settings.aiConfig[platform][field] = value;
}

async function saveAiCrmSettings() {
    try {
        if (typeof window.autoSave === 'function') {
            await window.autoSave();
            alert('✅ Configuration de l\'Agent IA enregistrée et synchronisée !');
        } else {
            alert('✅ Configuration enregistrée localement.');
        }
    } catch (e) {
        alert('❌ Erreur lors de l\'enregistrement : ' + e.message);
    }
}

// UTILITAIRES
function calculateCrmStats() {
    const appState = window.appState;
    const revenue = appState.transactions.reduce((sum, t) => sum + (Number(t.priceDzd) || 0), 0);
    const expenses = appState.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
        revenue: revenue,
        expenses: expenses,
        profit: revenue - expenses
    };
}

function formatCrmMoney(amount) {
    return new Intl.NumberFormat('fr-DZ').format(amount) + ' DZD';
}

function updateDataStatus() {
    const status = document.getElementById('dataStatus');
    if (status && window.appState) status.innerHTML = `<i class="fas fa-check-circle text-green-500"></i> ${window.appState.clients.length} Clients Synchronisés`;
}

// INITIALISATION DU PANNEAU LORS DU CHARGEMENT
window.addEventListener('load', () => {
    const body = document.querySelector('body');
    
    // Injecter le bouton flottant s'il n'existe pas
    if (!document.getElementById('crmFloatingButton')) {
        const btn = document.createElement('div');
        btn.id = 'crmFloatingButton';
        btn.style = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
        btn.innerHTML = `
            <button onclick="toggleRealCrm()" class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold">
                <i class="fas fa-rocket text-xl"></i>
                <span>OPEN CRM</span>
            </button>
        `;
        body.appendChild(btn);
    }

    // Injecter le panneau s'il n'existe pas
    if (!document.getElementById('realCrmPanel')) {
        const panel = document.createElement('div');
        panel.id = 'realCrmPanel';
        panel.className = 'fixed top-0 right-0 w-[400px] h-full bg-gray-50 shadow-2xl z-[10000] transform translate-x-full transition-transform duration-300 overflow-hidden flex flex-col';
        panel.innerHTML = `
            <!-- Header -->
            <div class="bg-gray-900 text-white p-6 shadow-lg">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-black tracking-tighter">SPONSOR CRM PRO</h2>
                        <div id="dataStatus" class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            <i class="fas fa-circle text-red-500 animate-pulse"></i> Initialisation...
                        </div>
                    </div>
                    <button onclick="toggleRealCrm()" class="text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>

            <!-- Navigation Menu -->
            <div class="flex justify-around bg-white border-b p-2">
                <button onclick="showSection('dashboard')" data-section="dashboard" class="crm-nav-btn flex-1 py-2 rounded-xl text-xs font-bold transition-all">
                    <i class="fas fa-th-large block mb-1"></i> DASH
                </button>
                <button onclick="showSection('clients')" data-section="clients" class="crm-nav-btn flex-1 py-2 rounded-xl text-xs font-bold transition-all">
                    <i class="fas fa-users block mb-1"></i> CLIENTS
                </button>
                <button onclick="showSection('ai_agent')" data-section="ai_agent" class="crm-nav-btn flex-1 py-2 rounded-xl text-xs font-bold transition-all">
                    <i class="fas fa-robot block mb-1"></i> IA AGENT
                </button>
                <button onclick="showSection('transactions')" data-section="transactions" class="crm-nav-btn flex-1 py-2 rounded-xl text-xs font-bold transition-all">
                    <i class="fas fa-wallet block mb-1"></i> COMPTES
                </button>
            </div>

            <!-- Content Area -->
            <div id="realCrmContentInner" class="flex-1 overflow-y-auto p-6 bg-gray-50">
                <!-- Les sections seront injectées ici -->
            </div>

            <!-- Footer -->
            <div class="p-4 bg-white border-t text-center">
                <p class="text-[10px] text-gray-400 font-bold uppercase">Sponsor Manager PRO v2.5 • Intégré</p>
            </div>
        `;
        body.appendChild(panel);
    }
    
    // Rafraîchir l'affichage dès que appState est prêt
    setTimeout(refreshCrmDisplay, 1000);
});
