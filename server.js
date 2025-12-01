const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Serve Swagger UI at root
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AW3 Platform API Documentation"
}));

// Serve raw swagger.yaml
app.get('/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Helper to wrap responses
const apiResponse = (data) => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

const apiError = (code, message) => ({
  success: false,
  error: { code, message },
  timestamp: new Date().toISOString()
});

// ============ MOCK DATA ============
const mockUsers = {
  creator1: {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    role: "CREATOR",
    displayName: "CryptoInfluencer",
    profileComplete: true,
    subscriptionTier: "PRO"
  },
  project1: {
    userId: "550e8400-e29b-41d4-a716-446655440002",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    role: "PROJECT",
    displayName: "DeFi Protocol",
    profileComplete: true,
    subscriptionTier: "ENTERPRISE"
  }
};

const mockCampaigns = [
  {
    campaignId: "660e8400-e29b-41d4-a716-446655440001",
    projectId: "550e8400-e29b-41d4-a716-446655440002",
    title: "DeFi Protocol Launch Campaign",
    description: "Promote our new DeFi protocol launch across social media platforms. Looking for crypto-native creators with strong engagement.",
    category: "DeFi",
    status: "ACTIVE",
    budgetAmount: 5000,
    budgetToken: "USDC",
    kpiTargets: { views: 100000, engagement: 5000, clicks: 1000 },
    requiredReputation: 50,
    numberOfCreators: 5,
    complexity: "MEDIUM",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contractAddress: "0xabc123...",
    chainId: "1",
    escrowBalance: 5500,
    serviceFee: 250,
    oracleFee: 50,
    totalFee: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    campaignId: "660e8400-e29b-41d4-a716-446655440002",
    projectId: "550e8400-e29b-41d4-a716-446655440002",
    title: "NFT Collection Awareness",
    description: "Create buzz for our upcoming NFT collection. Need creative video content and Twitter threads.",
    category: "NFT",
    status: "ACTIVE",
    budgetAmount: 10000,
    budgetToken: "ETH",
    kpiTargets: { views: 250000, engagement: 15000, mints: 500 },
    requiredReputation: 70,
    numberOfCreators: 3,
    complexity: "HIGH",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    contractAddress: "0xdef456...",
    chainId: "1",
    escrowBalance: 11000,
    serviceFee: 500,
    oracleFee: 100,
    totalFee: 600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    campaignId: "660e8400-e29b-41d4-a716-446655440003",
    projectId: "550e8400-e29b-41d4-a716-446655440002",
    title: "GameFi Beta Launch",
    description: "Announce and promote our play-to-earn game beta. Need gaming content creators.",
    category: "GameFi",
    status: "ACTIVE",
    budgetAmount: 8000,
    budgetToken: "USDT",
    kpiTargets: { views: 200000, signups: 5000, retention: 0.3 },
    requiredReputation: 40,
    numberOfCreators: 10,
    complexity: "LOW",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    contractAddress: "0x789ghi...",
    chainId: "137",
    escrowBalance: 8800,
    serviceFee: 400,
    oracleFee: 80,
    totalFee: 480,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockCreatorProfile = {
  userId: "550e8400-e29b-41d4-a716-446655440001",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  displayName: "CryptoInfluencer",
  avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=crypto",
  bio: "Web3 content creator specializing in DeFi and NFT education. 5+ years in crypto space.",
  categories: ["DeFi", "NFT", "Education"],
  socialLinks: {
    twitter: "https://twitter.com/cryptoinfluencer",
    youtube: "https://youtube.com/@cryptoinfluencer",
    instagram: null,
    tiktok: "https://tiktok.com/@cryptoinfluencer",
    discord: "CryptoInfluencer#1234"
  },
  verifiedAccounts: [
    { platform: "TWITTER", handle: "@cryptoinfluencer", followers: 125000, verified: true, verifiedAt: "2024-01-15T10:00:00Z" },
    { platform: "YOUTUBE", handle: "CryptoInfluencer", followers: 85000, verified: true, verifiedAt: "2024-01-20T10:00:00Z" }
  ],
  reputation: {
    score: 87.5,
    tier: "GOLD",
    totalReviews: 42,
    averageRating: 4.7
  },
  cvpiScore: 82.3,
  subscriptionTier: "PRO",
  profileComplete: true,
  createdAt: "2023-06-15T08:30:00Z"
};

const mockApplications = [
  {
    applicationId: "770e8400-e29b-41d4-a716-446655440001",
    campaignId: "660e8400-e29b-41d4-a716-446655440001",
    campaignTitle: "DeFi Protocol Launch Campaign",
    creatorId: "550e8400-e29b-41d4-a716-446655440001",
    proposedRate: 800,
    proposal: "I will create a comprehensive Twitter thread series explaining your protocol's unique features, followed by educational YouTube video content.",
    status: "ACCEPTED",
    portfolioLinks: ["https://twitter.com/cryptoinfluencer/thread1", "https://youtube.com/watch?v=abc123"],
    relevantExperience: "Previously promoted 10+ DeFi protocols with average 50K+ views",
    estimatedCompletionDays: 14,
    matchScore: 92.5,
    appliedAt: "2024-11-15T10:00:00Z",
    reviewedAt: "2024-11-16T14:30:00Z"
  },
  {
    applicationId: "770e8400-e29b-41d4-a716-446655440002",
    campaignId: "660e8400-e29b-41d4-a716-446655440002",
    campaignTitle: "NFT Collection Awareness",
    creatorId: "550e8400-e29b-41d4-a716-446655440001",
    proposedRate: 2000,
    proposal: "I propose creating viral TikTok content showcasing your NFT artwork with trending sounds and effects.",
    status: "PENDING",
    portfolioLinks: ["https://tiktok.com/@cryptoinfluencer/video1"],
    relevantExperience: "NFT collection promotions with 100K+ combined views",
    estimatedCompletionDays: 21,
    matchScore: 85.0,
    appliedAt: "2024-11-20T09:00:00Z",
    reviewedAt: null
  }
];

const mockDeliverables = [
  {
    deliverableId: "880e8400-e29b-41d4-a716-446655440001",
    campaignId: "660e8400-e29b-41d4-a716-446655440001",
    creatorId: "550e8400-e29b-41d4-a716-446655440001",
    contentUrl: "https://twitter.com/cryptoinfluencer/status/1234567890",
    contentType: "TWEET",
    platform: "TWITTER",
    status: "VERIFIED",
    metrics: {
      views: 45000,
      likes: 2300,
      comments: 180,
      shares: 450,
      clicks: 890,
      conversions: 45,
      engagementRate: 6.5
    },
    cvpiScore: 88.2,
    paymentAmount: 400,
    submittedAt: "2024-11-18T15:00:00Z",
    verifiedAt: "2024-11-19T10:00:00Z"
  },
  {
    deliverableId: "880e8400-e29b-41d4-a716-446655440002",
    campaignId: "660e8400-e29b-41d4-a716-446655440001",
    creatorId: "550e8400-e29b-41d4-a716-446655440001",
    contentUrl: "https://youtube.com/watch?v=xyz789",
    contentType: "VIDEO",
    platform: "YOUTUBE",
    status: "PENDING_VERIFICATION",
    metrics: null,
    cvpiScore: null,
    paymentAmount: null,
    submittedAt: "2024-11-25T12:00:00Z",
    verifiedAt: null
  }
];

const mockCategories = [
  { id: "defi", name: "DeFi", description: "Decentralized Finance protocols", icon: "💰", campaignCount: 45, creatorCount: 230 },
  { id: "nft", name: "NFT", description: "Non-Fungible Tokens & Digital Art", icon: "🎨", campaignCount: 68, creatorCount: 420 },
  { id: "gamefi", name: "GameFi", description: "Play-to-Earn & Web3 Gaming", icon: "🎮", campaignCount: 32, creatorCount: 180 },
  { id: "dao", name: "DAO", description: "Decentralized Autonomous Organizations", icon: "🏛️", campaignCount: 15, creatorCount: 85 },
  { id: "infrastructure", name: "Infrastructure", description: "Layer 1/2 & Web3 Tools", icon: "⚙️", campaignCount: 28, creatorCount: 110 },
  { id: "metaverse", name: "Metaverse", description: "Virtual Worlds & Digital Real Estate", icon: "🌐", campaignCount: 22, creatorCount: 95 }
];

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/wallet-connect', (req, res) => {
  const { walletAddress, chainId, walletType } = req.body;
  const nonce = uuidv4().replace(/-/g, '').substring(0, 32);
  res.json(apiResponse({
    walletAddress,
    nonce,
    message: `Sign this message to authenticate with AW3 Platform:\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`,
    expiresAt: Date.now() + 300000 // 5 minutes
  }));
});

app.post('/api/auth/verify-signature', (req, res) => {
  const { walletAddress } = req.body;
  res.json(apiResponse({
    accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_access_token_${Date.now()}`,
    refreshToken: `refresh_${uuidv4()}`,
    tokenType: "Bearer",
    expiresIn: 3600,
    user: mockUsers.creator1
  }));
});

app.post('/api/auth/register', (req, res) => {
  const { walletAddress, role, displayName } = req.body;
  const userId = uuidv4();
  res.json(apiResponse({
    userId,
    walletAddress,
    role,
    accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_access_token_${Date.now()}`,
    refreshToken: `refresh_${uuidv4()}`,
    expiresIn: 3600,
    profileComplete: false,
    nextSteps: ["Complete profile", "Verify social accounts", "Browse campaigns"]
  }));
});

app.post('/api/auth/refresh', (req, res) => {
  res.json(apiResponse({
    accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_access_token_${Date.now()}`,
    refreshToken: `refresh_${uuidv4()}`,
    expiresIn: 3600
  }));
});

app.post('/api/auth/logout', (req, res) => {
  res.json(apiResponse({ success: true, message: "Logged out successfully" }));
});

app.get('/api/auth/nonce/:walletAddress', (req, res) => {
  const nonce = uuidv4().replace(/-/g, '').substring(0, 32);
  res.json(apiResponse({
    walletAddress: req.params.walletAddress,
    nonce,
    message: `Sign this message to authenticate:\n\nNonce: ${nonce}`,
    expiresAt: Date.now() + 300000
  }));
});

// ============ CREATOR PROFILE ENDPOINTS ============
app.get('/api/creator/profile/me', (req, res) => {
  res.json(apiResponse(mockCreatorProfile));
});

app.put('/api/creator/profile/me', (req, res) => {
  const updated = { ...mockCreatorProfile, ...req.body, updatedAt: new Date().toISOString() };
  res.json(apiResponse(updated));
});

app.post('/api/creator/profile/social-verification', (req, res) => {
  const { platform, handle } = req.body;
  res.json(apiResponse({
    platform,
    handle,
    status: "PENDING",
    verificationUrl: `https://verification.aw3.com/verify/${platform}/${handle}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }));
});

// ============ CREATOR CAMPAIGNS ENDPOINTS ============
app.get('/api/creator/campaigns', (req, res) => {
  const { category, minBudget, maxBudget, page = 0, size = 20 } = req.query;
  let filtered = mockCampaigns.filter(c => c.status === 'ACTIVE');
  
  if (category) filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
  if (minBudget) filtered = filtered.filter(c => c.budgetAmount >= parseFloat(minBudget));
  if (maxBudget) filtered = filtered.filter(c => c.budgetAmount <= parseFloat(maxBudget));
  
  res.json(apiResponse({
    campaigns: filtered,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filtered.length / parseInt(size)),
      totalElements: filtered.length,
      pageSize: parseInt(size)
    }
  }));
});

app.get('/api/creator/campaigns/:id', (req, res) => {
  const campaign = mockCampaigns.find(c => c.campaignId === req.params.id);
  if (!campaign) return res.status(404).json(apiError("NOT_FOUND", "Campaign not found"));
  res.json(apiResponse(campaign));
});

app.get('/api/creator/campaigns/recommended', (req, res) => {
  res.json(apiResponse({
    campaigns: mockCampaigns.slice(0, 2).map(c => ({ ...c, matchScore: Math.random() * 20 + 80 })),
    pagination: { currentPage: 0, totalPages: 1, totalElements: 2, pageSize: 10 }
  }));
});

// ============ CREATOR APPLICATIONS ENDPOINTS ============
app.get('/api/creator/applications', (req, res) => {
  res.json(apiResponse(mockApplications));
});

app.post('/api/creator/applications', (req, res) => {
  const application = {
    applicationId: uuidv4(),
    ...req.body,
    creatorId: "550e8400-e29b-41d4-a716-446655440001",
    status: "PENDING",
    matchScore: Math.random() * 20 + 75,
    appliedAt: new Date().toISOString(),
    reviewedAt: null
  };
  res.json(apiResponse(application));
});

app.get('/api/creator/applications/:id', (req, res) => {
  const application = mockApplications.find(a => a.applicationId === req.params.id);
  if (!application) return res.status(404).json(apiError("NOT_FOUND", "Application not found"));
  res.json(apiResponse(application));
});

app.put('/api/creator/applications/:id', (req, res) => {
  const application = mockApplications.find(a => a.applicationId === req.params.id);
  if (!application) return res.status(404).json(apiError("NOT_FOUND", "Application not found"));
  const updated = { ...application, ...req.body, updatedAt: new Date().toISOString() };
  res.json(apiResponse(updated));
});

// ============ CREATOR DELIVERABLES ENDPOINTS ============
app.get('/api/creator/deliverables', (req, res) => {
  res.json(apiResponse({
    deliverables: mockDeliverables,
    pagination: { total: mockDeliverables.length, limit: 20, offset: 0, hasMore: false }
  }));
});

app.post('/api/creator/deliverables', (req, res) => {
  const deliverable = {
    deliverableId: uuidv4(),
    ...req.body,
    creatorId: "550e8400-e29b-41d4-a716-446655440001",
    status: "SUBMITTED",
    metrics: null,
    cvpiScore: null,
    paymentAmount: null,
    submittedAt: new Date().toISOString(),
    verifiedAt: null
  };
  res.json(apiResponse(deliverable));
});

app.get('/api/creator/deliverables/:id', (req, res) => {
  const deliverable = mockDeliverables.find(d => d.deliverableId === req.params.id);
  if (!deliverable) return res.status(404).json(apiError("NOT_FOUND", "Deliverable not found"));
  res.json(apiResponse(deliverable));
});

// ============ CREATOR CVPI ENDPOINTS ============
app.get('/api/creator/cvpi/score', (req, res) => {
  res.json(apiResponse({
    userId: "550e8400-e29b-41d4-a716-446655440001",
    overallScore: 82.3,
    components: {
      engagement: 85.2,
      reach: 78.5,
      conversion: 81.0,
      consistency: 88.1,
      quality: 79.7
    },
    trend: "UP",
    percentile: 87,
    lastUpdated: new Date().toISOString()
  }));
});

app.get('/api/creator/cvpi/history', (req, res) => {
  const history = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    history.push({
      date: date.toISOString().split('T')[0],
      score: 75 + Math.random() * 15
    });
  }
  res.json(apiResponse({ history }));
});

// ============ CREATOR EARNINGS ENDPOINTS ============
app.get('/api/creator/earnings', (req, res) => {
  res.json(apiResponse({
    totalEarned: 12500.00,
    pendingPayments: 2400.00,
    availableBalance: 3200.00,
    currency: "USDC"
  }));
});

app.get('/api/creator/earnings/history', (req, res) => {
  res.json(apiResponse({
    transactions: [
      { id: uuidv4(), campaignId: mockCampaigns[0].campaignId, amount: 400, type: "PAYMENT", status: "COMPLETED", timestamp: "2024-11-20T10:00:00Z" },
      { id: uuidv4(), campaignId: mockCampaigns[0].campaignId, amount: 350, type: "PAYMENT", status: "COMPLETED", timestamp: "2024-11-18T14:30:00Z" },
      { id: uuidv4(), campaignId: mockCampaigns[1].campaignId, amount: 800, type: "PAYMENT", status: "PENDING", timestamp: "2024-11-25T09:00:00Z" }
    ]
  }));
});

// ============ PROJECT PROFILE ENDPOINTS ============
app.get('/api/project/profile/me', (req, res) => {
  res.json(apiResponse({
    userId: "550e8400-e29b-41d4-a716-446655440002",
    projectName: "DeFi Protocol",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=defi",
    website: "https://defiprotocol.io",
    bio: "Next-generation DeFi protocol with innovative yield strategies",
    category: "DeFi",
    verified: true,
    socialLinks: {
      twitter: "https://twitter.com/defiprotocol",
      discord: "https://discord.gg/defiprotocol"
    }
  }));
});

app.put('/api/project/profile/me', (req, res) => {
  res.json(apiResponse({ ...req.body, updatedAt: new Date().toISOString() }));
});

// ============ PROJECT CAMPAIGNS ENDPOINTS ============
app.get('/api/project/campaigns', (req, res) => {
  res.json(apiResponse(mockCampaigns));
});

app.post('/api/project/campaigns', (req, res) => {
  const campaign = {
    campaignId: uuidv4(),
    projectId: "550e8400-e29b-41d4-a716-446655440002",
    ...req.body,
    status: "DRAFT",
    escrowBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  res.json(apiResponse(campaign));
});

app.get('/api/project/campaigns/:id', (req, res) => {
  const campaign = mockCampaigns.find(c => c.campaignId === req.params.id);
  if (!campaign) return res.status(404).json(apiError("NOT_FOUND", "Campaign not found"));
  res.json(apiResponse({
    ...campaign,
    statistics: {
      totalApplications: 12,
      acceptedApplications: 3,
      pendingApplications: 5,
      totalDeliverables: 8,
      completedDeliverables: 4
    }
  }));
});

app.put('/api/project/campaigns/:id', (req, res) => {
  const campaign = mockCampaigns.find(c => c.campaignId === req.params.id);
  if (!campaign) return res.status(404).json(apiError("NOT_FOUND", "Campaign not found"));
  res.json(apiResponse({ ...campaign, ...req.body, updatedAt: new Date().toISOString() }));
});

app.delete('/api/project/campaigns/:id', (req, res) => {
  res.json(apiResponse({ campaignId: req.params.id, status: "CANCELLED" }));
});

// ============ PROJECT FINANCE ENDPOINTS ============
app.post('/api/project/finance/estimate-fees', (req, res) => {
  const { campaignBudget, paymentToken, complexity, numberOfCreators, useAW3Token } = req.body;
  const serviceFeeRate = useAW3Token ? 0.04 : 0.05; // 4% with AW3, 5% without
  const oracleFeeRate = 0.01;
  
  const serviceFee = campaignBudget * serviceFeeRate;
  const oracleFee = campaignBudget * oracleFeeRate;
  const totalFee = serviceFee + oracleFee;
  const discount = useAW3Token ? 20 : 0;
  
  res.json(apiResponse({
    estimateId: uuidv4(),
    campaignBudget,
    serviceFee,
    oracleFee,
    totalFee,
    discount,
    totalRequired: campaignBudget + totalFee,
    validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }));
});

// ============ PROJECT APPLICATIONS ENDPOINTS ============
app.get('/api/project/applications', (req, res) => {
  res.json(apiResponse(mockApplications.map(a => ({
    ...a,
    creatorName: "CryptoInfluencer",
    creatorAvatar: "https://api.dicebear.com/7.x/identicon/svg?seed=crypto",
    creatorReputation: 87.5
  }))));
});

app.put('/api/project/applications/:id/accept', (req, res) => {
  res.json(apiResponse({
    applicationId: req.params.id,
    status: "ACCEPTED",
    acceptedAt: new Date().toISOString()
  }));
});

app.put('/api/project/applications/:id/reject', (req, res) => {
  res.json(apiResponse({
    applicationId: req.params.id,
    status: "REJECTED",
    rejectedAt: new Date().toISOString(),
    reason: req.body.reason
  }));
});

// ============ PUBLIC MARKETPLACE ENDPOINTS ============
app.get('/api/public/marketplace/campaigns', (req, res) => {
  const { category, status, minBudget, maxBudget, page = 0, size = 20 } = req.query;
  let filtered = mockCampaigns.filter(c => c.status === 'ACTIVE');
  
  if (category) filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
  if (minBudget) filtered = filtered.filter(c => c.budgetAmount >= parseFloat(minBudget));
  if (maxBudget) filtered = filtered.filter(c => c.budgetAmount <= parseFloat(maxBudget));
  
  res.json(apiResponse({
    campaigns: filtered.map(c => ({
      ...c,
      project: { projectId: c.projectId, name: "DeFi Protocol", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=defi", verified: true }
    })),
    total: filtered.length,
    page: parseInt(page),
    size: parseInt(size),
    totalPages: Math.ceil(filtered.length / parseInt(size))
  }));
});

app.get('/api/public/marketplace/campaigns/:id', (req, res) => {
  const campaign = mockCampaigns.find(c => c.campaignId === req.params.id);
  if (!campaign) return res.status(404).json(apiError("NOT_FOUND", "Campaign not found"));
  res.json(apiResponse({
    ...campaign,
    project: {
      projectId: campaign.projectId,
      name: "DeFi Protocol",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=defi",
      website: "https://defiprotocol.io",
      verified: true,
      rating: 4.8,
      completedCampaigns: 15
    }
  }));
});

app.get('/api/public/marketplace/creators', (req, res) => {
  res.json(apiResponse({
    creators: [
      { ...mockCreatorProfile, completedCampaigns: 24, tier: "GOLD" },
      { ...mockCreatorProfile, userId: uuidv4(), displayName: "NFTArtist", categories: ["NFT", "Art"], cvpiScore: 78.5, tier: "SILVER" },
      { ...mockCreatorProfile, userId: uuidv4(), displayName: "GameStreamer", categories: ["GameFi", "Streaming"], cvpiScore: 91.2, tier: "PLATINUM" }
    ],
    total: 3,
    page: 0,
    size: 20,
    totalPages: 1
  }));
});

app.get('/api/public/marketplace/creators/:id', (req, res) => {
  res.json(apiResponse({
    ...mockCreatorProfile,
    performance: {
      completedCampaigns: 24,
      cvpiScore: 82.3,
      successRate: 95.8,
      onTimeDeliveryRate: 98.2
    },
    portfolio: [
      { title: "DeFi Protocol Explainer", type: "VIDEO", url: "https://youtube.com/watch?v=abc", thumbnail: "https://img.youtube.com/vi/abc/0.jpg" },
      { title: "NFT Market Analysis Thread", type: "TWEET", url: "https://twitter.com/cryptoinfluencer/status/123", thumbnail: null }
    ]
  }));
});

app.get('/api/public/marketplace/stats', (req, res) => {
  res.json(apiResponse({
    totalCreators: 15420,
    totalProjects: 892,
    totalCampaigns: 3456,
    activeCampaigns: 234,
    totalValueProcessed: 12500000,
    averageCVPI: 76.4,
    topCategories: [
      { category: "DeFi", campaigns: 892, creators: 4521 },
      { category: "NFT", campaigns: 1245, creators: 6230 },
      { category: "GameFi", campaigns: 567, creators: 2890 }
    ],
    lastUpdated: new Date().toISOString()
  }));
});

app.get('/api/public/marketplace/categories', (req, res) => {
  res.json(apiResponse({ categories: mockCategories }));
});

app.get('/api/public/marketplace/projects', (req, res) => {
  res.json(apiResponse({
    projects: [
      { projectId: "550e8400-e29b-41d4-a716-446655440002", name: "DeFi Protocol", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=defi", category: "DeFi", verified: true, rating: 4.8, totalCampaigns: 15, activeCampaigns: 3 },
      { projectId: uuidv4(), name: "NFT Marketplace", logo: "https://api.dicebear.com/7.x/shapes/svg?seed=nft", category: "NFT", verified: true, rating: 4.6, totalCampaigns: 22, activeCampaigns: 5 }
    ],
    total: 2,
    page: 0,
    size: 20,
    totalPages: 1
  }));
});

app.get('/api/public/marketplace/projects/:id', (req, res) => {
  res.json(apiResponse({
    projectId: req.params.id,
    name: "DeFi Protocol",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=defi",
    bio: "Next-generation DeFi protocol with innovative yield strategies",
    website: "https://defiprotocol.io",
    category: "DeFi",
    verified: true,
    socialLinks: { twitter: "https://twitter.com/defiprotocol", discord: "https://discord.gg/defiprotocol" },
    stats: { totalCampaigns: 15, completedCampaigns: 12, averageRating: 4.8, totalCreatorsWorkedWith: 45, averageCVPI: 81.2 },
    recentCampaigns: mockCampaigns.slice(0, 2)
  }));
});

// ============ ADMIN ENDPOINTS ============
app.get('/api/admin/campaigns', (req, res) => {
  res.json(apiResponse({
    campaigns: mockCampaigns.map(c => ({ ...c, projectName: "DeFi Protocol", flagged: false })),
    stats: { total: mockCampaigns.length, active: 3, completed: 0, suspended: 0, flagged: 0, totalBudgetLocked: 23000 },
    pagination: { total: mockCampaigns.length, page: 0, size: 20, totalPages: 1 }
  }));
});

app.get('/api/admin/campaigns/:id', (req, res) => {
  const campaign = mockCampaigns.find(c => c.campaignId === req.params.id);
  if (!campaign) return res.status(404).json(apiError("NOT_FOUND", "Campaign not found"));
  res.json(apiResponse({
    ...campaign,
    project: { projectId: campaign.projectId, projectName: "DeFi Protocol", walletAddress: "0x1234...5678", reputationScore: 92.5 },
    creators: [{ creatorId: "550e8400-e29b-41d4-a716-446655440001", creatorName: "CryptoInfluencer", status: "ACTIVE", payment: 800, deliverablesCompleted: 2 }],
    deliverables: mockDeliverables,
    flagged: false
  }));
});

app.put('/api/admin/campaigns/:id/suspend', (req, res) => {
  res.json(apiResponse({
    campaignId: req.params.id,
    previousStatus: "ACTIVE",
    newStatus: "SUSPENDED",
    action: "SUSPEND",
    adminId: "admin-001",
    timestamp: new Date().toISOString(),
    notes: req.body.reason
  }));
});

app.put('/api/admin/campaigns/:id/resume', (req, res) => {
  res.json(apiResponse({
    campaignId: req.params.id,
    previousStatus: "SUSPENDED",
    newStatus: "ACTIVE",
    action: "RESUME",
    adminId: "admin-001",
    timestamp: new Date().toISOString()
  }));
});

app.put('/api/admin/campaigns/:id/cancel', (req, res) => {
  res.json(apiResponse({
    campaignId: req.params.id,
    previousStatus: "ACTIVE",
    newStatus: "CANCELLED",
    action: "FORCE_CANCEL",
    adminId: "admin-001",
    timestamp: new Date().toISOString(),
    notes: req.body.reason
  }));
});

app.get('/api/admin/users', (req, res) => {
  res.json(apiResponse({
    users: [mockUsers.creator1, mockUsers.project1],
    pagination: { total: 2, page: 0, size: 20, totalPages: 1 }
  }));
});

app.get('/api/admin/users/:id', (req, res) => {
  res.json(apiResponse(mockUsers.creator1));
});

app.put('/api/admin/users/:id/suspend', (req, res) => {
  res.json(apiResponse({
    userId: req.params.id,
    status: "SUSPENDED",
    reason: req.body.reason,
    suspendedAt: new Date().toISOString()
  }));
});

app.get('/api/admin/analytics/overview', (req, res) => {
  res.json(apiResponse({
    totalUsers: 16312,
    newUsers: 234,
    activeCampaigns: 234,
    completedCampaigns: 3222,
    totalVolume: 12500000,
    averageCVPI: 76.4
  }));
});

// ============ HEALTH & ROOT ============
app.get('/', (req, res) => {
  res.json({
    name: "AW3 Platform Mock API",
    version: "1.0.0",
    description: "Mock API for AW3 Platform with Swagger documentation",
    documentation: "/docs",
    swagger: {
      yaml: "/swagger.yaml",
      json: "/swagger.json"
    },
    endpoints: {
      auth: "/api/auth/*",
      creator: "/api/creator/*",
      project: "/api/project/*",
      admin: "/api/admin/*",
      public: "/api/public/*"
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(apiError("NOT_FOUND", `Endpoint ${req.method} ${req.path} not found`));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json(apiError("INTERNAL_ERROR", "An internal server error occurred"));
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AW3 Platform Mock API Server                        ║
║                                                           ║
║   Server running on: http://localhost:${PORT}               ║
║                                                           ║
║   📚 Swagger UI:     http://localhost:${PORT}/docs          ║
║   📄 OpenAPI YAML:   http://localhost:${PORT}/swagger.yaml  ║
║   📄 OpenAPI JSON:   http://localhost:${PORT}/swagger.json  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

