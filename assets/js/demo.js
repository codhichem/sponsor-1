// demo.js - Mode Bac à Sable / Sandbox

window.injectDemoData = function() {
    console.log("🚀 ACTIVATION DU MODE DEMO (SANDBOX) 🚀");
    showToast("Mode Démo Activé - Les données ne sont pas sauvegardées sur le réseau.", "success");
    
    // 1. Couper les ponts avec Firebase pour éviter la pollution de la vraie BDD
    window.saveToCloud = async function() { console.log("Demo: saveToCloud intercepté."); };
    window.syncGranularToCloud = async function() { console.log("Demo: syncGranularToCloud intercepté."); };
    window.loadFromCloud = async function() { console.log("Demo: loadFromCloud intercepté."); };
    
    // 2. Nettoyer l'état de l'application
    appState.clients = [];
    appState.transactions = [];
    appState.payments = [];
    appState.usdPurchases = [];
    appState.expenses = [];
    appState.todoTransactions = [];
    appState.employees = [];
    appState.settings = { autoSaveEnabled: false };
    appState.globalConfig = { cmaUsd: 220 }; // Cost per USD in DZD
    
    // 3. Générer des données factices (50 clients)
    const firstNames = ["Amine", "Yassine", "Karim", "Sarah", "Lyna", "Mehdi", "Walid", "Ryad", "Nour", "Ines"];
    const lastNames = ["Digital", "Store", "Cosmetics", "Boutique", "Motors", "Immo", "Services", "Tech"];
    
    for (let i = 0; i < 50; i++) {
        const name = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + 
                     lastNames[Math.floor(Math.random() * lastNames.length)] + ' ' + i;
        
        const client = {
            id: 'demo_client_' + i,
            name: name,
            phone: '05' + Math.floor(10000000 + Math.random() * 90000000),
            instagram: '@' + name.replace(/ /g, '').toLowerCase(),
            status: Math.random() > 0.3 ? 'Actif' : 'Inactif',
            createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
            updatedAt: Date.now() - Math.floor(Math.random() * 100000000),
            totalSpent: 0,
            unpaid: 0,
            note: "Client généré en mode démo."
        };
        appState.clients.push(client);
    }
    
    // 4. Générer des achats d'USD
    let currentStockUSD = 0;
    for (let i = 0; i < 5; i++) {
        const amount = 500 + Math.floor(Math.random() * 1000); // 500 to 1500
        const rate = 215 + Math.floor(Math.random() * 10);
        appState.usdPurchases.push({
            id: 'demo_usd_' + i,
            amount: amount,
            rate: rate,
            totalDzd: amount * rate,
            date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString()
        });
        currentStockUSD += amount;
    }
    appState.globalConfig.cmaUsd = 222; // Random average
    
    // 5. Générer 150 Transactions
    for (let i = 0; i < 150; i++) {
        const client = appState.clients[Math.floor(Math.random() * appState.clients.length)];
        const budgetUsd = 50 + Math.floor(Math.random() * 500);
        
        // Couts et Ventes
        const costDzd = budgetUsd * appState.globalConfig.cmaUsd;
        const profitMargin = 1.3 + (Math.random() * 0.4); // 30% to 70% margin
        const sellPriceDzd = Math.floor(costDzd * profitMargin);
        
        const isPaid = Math.random() > 0.2; // 80% chance fully paid
        const amountPaid = isPaid ? sellPriceDzd : Math.floor(sellPriceDzd * Math.random());
        
        const txnId = 'demo_txn_' + i;
        const txn = {
            id: txnId,
            clientId: client.id,
            clientName: client.name,
            budgetUsd: budgetUsd,
            cmaUsd: appState.globalConfig.cmaUsd,
            sellPriceDzd: sellPriceDzd,
            amountPaid: amountPaid,
            createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
            employeeName: "Administrateur",
            details: "Campagne Sponsorisée FB Ads"
        };
        appState.transactions.push(txn);
        appState.todoTransactions.push({
            ...txn,
            todoDate: new Date().toISOString().split('T')[0],
            status: Math.random() > 0.5 ? 'Fait' : 'En Cours',
            done: true
        });
        
        client.totalSpent += amountPaid;
        client.unpaid += (sellPriceDzd - amountPaid);
    }
    
    // 6. Insérer l'admin dans la session
    appState.session = { type: 'admin', employeeId: 'admin_demo', name: 'Administrateur Démo', loginAt: Date.now() };
    
    // 7. Rafraîchir l'interface
    if (typeof recalculateFinanceBalances === 'function') recalculateFinanceBalances();
    if (typeof updateAuthUI === 'function') updateAuthUI(true);
    if (typeof renderTables === 'function') renderTables();
    
    // Scroll au Dashboard
    document.getElementById('tabBtn-dashboard').click();
};
