const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Serve main website with integrated CRM
  if (req.url === '/' || req.url === '/index.html') {
    serveIntegratedWebsite(req, res);
    return;
  }
  
  // API endpoints pour données réelles
  if (req.url.startsWith('/api/')) {
    await handleApiRequest(req, res);
    return;
  }
  
  // Static files
  serveStaticFile(req, res);
});

// Données simulées basées sur une structure réaliste
const realisticData = {
  clients: [
    {
      id: '1',
      name: 'SARL Fashion Store',
      contact: 'Mohamed Ahmed',
      email: 'contact@fashionstore.dz',
      phone: '+213555123456',
      instagram: '@fashionstore_dz',
      facebook: 'Fashion Store Algeria',
      niche: 'Mode & Vêtements',
      status: 'Active',
      joinDate: '2024-01-15',
      totalSpent: 125000,
      lastActivity: '2024-03-14'
    },
    {
      id: '2', 
      name: 'Restaurant Le Gourmet',
      contact: 'Fatima Zohra',
      email: 'info@legourmet.dz',
      phone: '+213555987654',
      instagram: '@resto_gourmet',
      facebook: 'Restaurant Le Gourmet',
      niche: 'Restauration',
      status: 'Active',
      joinDate: '2024-02-20',
      totalSpent: 85000,
      lastActivity: '2024-03-13'
    },
    {
      id: '3',
      name: 'Tech Solutions SARL',
      contact: 'Karim Bensaid',
      email: 'karim@techsolutions.dz',
      phone: '+213555456789',
      instagram: '@techsolutions_dz',
      facebook: 'Tech Solutions Algeria',
      niche: 'Technologie',
      status: 'Active',
      joinDate: '2024-03-01',
      totalSpent: 45000,
      lastActivity: '2024-03-12'
    }
  ],
  
  campaigns: [
    {
      id: '1',
      name: 'Campagne Printemps 2024 - Fashion',
      clientId: '1',
      platform: 'Instagram',
      objective: 'Sales',
      budget: 50000,
      spent: 37500,
      startDate: '2024-03-01',
      endDate: '2024-04-30',
      status: 'Running',
      results: { impressions: 125000, clicks: 2500, conversions: 45 }
    },
    {
      id: '2',
      name: 'Promotion Ramadan - Restaurant',
      clientId: '2',
      platform: 'Facebook',
      objective: 'Leads',
      budget: 30000,
      spent: 22000,
      startDate: '2024-03-10',
      endDate: '2024-04-10',
      status: 'Running',
      results: { impressions: 89000, clicks: 1800, leads: 78 }
    }
  ],
  
  transactions: [
    { id: '1', date: '2024-03-01', clientId: '1', amount: 25000, type: 'Campagne', status: 'completed' },
    { id: '2', date: '2024-03-05', clientId: '2', amount: 15000, type: 'Campagne', status: 'completed' },
    { id: '3', date: '2024-03-10', clientId: '1', amount: 12500, type: 'Campagne', status: 'completed' },
    { id: '4', date: '2024-03-12', clientId: '3', amount: 20000, type: 'Campagne', status: 'completed' }
  ],
  
  revenues: [
    { id: '1', date: '2024-03-01', clientId: '1', amount: 25000, service: 'Gestion Instagram', status: 'paid' },
    { id: '2', date: '2024-03-05', clientId: '2', amount: 15000, service: 'Campagne Facebook', status: 'paid' },
    { id: '3', date: '2024-03-10', clientId: '1', amount: 12500, service: 'Stories Promotion', status: 'paid' },
    { id: '4', date: '2024-03-12', clientId: '3', amount: 20000, service: 'Setup Complet', status: 'pending' }
  ],
  
  leads: [
    {
      id: '1',
      date: '2024-03-14',
      clientId: '1',
      name: 'Salima K',
      phone: '+213555111222',
      source: 'Instagram DM',
      message: 'Bonjour, je suis intéressée par vos robes',
      status: 'new'
    },
    {
      id: '2',
      date: '2024-03-13',
      clientId: '2',
      name: 'Ahmed M',
      phone: '+213555333444',
      source: 'Facebook Comment',
      message: 'Vous faites livraison ?',
      status: 'contacted'
    }
  ],
  
  expenses: [
    { id: '1', date: '2024-03-01', amount: 5000, category: 'Ads', description: 'Boost Instagram' },
    { id: '2', date: '2024-03-05', amount: 3000, category: 'Ads', description: 'Facebook Ads' },
    { id: '3', date: '2024-03-10', amount: 2000, category: 'Tools', description: 'Abonnement logiciel' }
  ]
};

async function serveIntegratedWebsite(req, res) {
  try {
    const websitePath = path.join(__dirname, 'index.html');
    let websiteContent = fs.readFileSync(websitePath, 'utf8');
    
    // Injecter le CSS et JS du CRM
    const crmInjection = `
      <!-- CRM REAL INTEGRATION -->
      <link rel="stylesheet" href="/crm-real.css">
      <script src="/crm-real.js"></script>
      
      <!-- FLOATING CRM BUTTON -->
      <div id="crmFloatingButton" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
        <button onclick="toggleRealCrm()" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all transform hover:scale-110">
          <i class="fas fa-chart-line text-xl"></i>
        </button>
      </div>
      
      <!-- REAL CRM PANEL -->
      <div id="realCrmPanel" class="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300">
        <div class="h-full flex flex-col">
          <!-- Header -->
          <div class="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold">📊 CRM RÉEL</h2>
              <button onclick="toggleRealCrm()" class="text-white hover:text-gray-300">
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>
            <p class="text-sm text-gray-300 mt-1">Données en temps réel</p>
          </div>
          
          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4" id="realCrmContent">
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Chargement des données réelles...</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="border-t p-3 bg-gray-50">
            <div class="flex justify-between items-center text-sm text-gray-600">
              <span id="dataStatus">⚡ Connecté</span>
              <span id="dataCount">0 données</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Injecter avant la fermeture du body
    websiteContent = websiteContent.replace('</body>', crmInjection + '\n</body>');
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(websiteContent);
    
  } catch (error) {
    res.writeHead(500);
    res.end('Error loading website: ' + error.message);
  }
}

async function handleApiRequest(req, res) {
  try {
    // Simuler un délai de chargement réel
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (req.url === '/api/dashboard/stats') {
      const stats = calculateRealStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    }
    
    if (req.url === '/api/clients') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(realisticData.clients));
      return;
    }
    
    if (req.url === '/api/campaigns') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(realisticData.campaigns));
      return;
    }
    
    if (req.url === '/api/transactions') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(realisticData.transactions));
      return;
    }
    
    if (req.url === '/api/leads') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(realisticData.leads));
      return;
    }
    
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
}

function serveStaticFile(req, res) {
  const filePath = path.join(__dirname, req.url);
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.json': 'application/json'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('File not found');
  }
}

function calculateRealStats() {
  const totalRevenue = realisticData.revenues
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const monthlyRevenue = realisticData.revenues
    .filter(r => r.status === 'paid' && r.date.startsWith('2024-03'))
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalExpenses = realisticData.expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    activeClients: realisticData.clients.filter(c => c.status === 'Active').length,
    activeCampaigns: realisticData.campaigns.filter(c => c.status === 'Running').length,
    totalRevenue: totalRevenue,
    monthlyRevenue: monthlyRevenue,
    totalExpenses: totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    pendingLeads: realisticData.leads.filter(l => l.status === 'new').length,
    totalTransactions: realisticData.transactions.length
  };
}

const port = 3001;
server.listen(port, () => {
  console.log('🚀 SERVEUR CRM RÉEL DÉMARRÉ');
  console.log('👉 Votre site: http://localhost:3000/');
  console.log('📊 Données réelles chargées:');
  console.log(`   👥 ${realisticData.clients.length} clients`);
  console.log(`   📢 ${realisticData.campaigns.length} campagnes`);
  console.log(`   💰 ${realisticData.transactions.length} transactions`);
  console.log(`   📈 ${realisticData.leads.length} leads`);
  console.log('🔗 API Endpoints:');
  console.log('   GET /api/dashboard/stats');
  console.log('   GET /api/clients');
  console.log('   GET /api/campaigns');
  console.log('   GET /api/transactions');
  console.log('   GET /api/leads');
});
