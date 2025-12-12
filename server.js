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

// Serve Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "AW3 Platform API Documentation"
}));

// Serve raw swagger files
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

// Enum mappings
const ENUMS = {
  UserRole: {
    1: 'Creator',
    2: 'Projector',
    3: 'Admin',
    4: 'Validator'
  },
  WalletType: {
    1: 'MetaMask',
    2: 'WalletConnect',
    3: 'Coinbase',
    4: 'Rainbow'
  },
  SocialPlatform: {
    1: 'Twitter',
    2: 'YouTube',
    3: 'Instagram',
    4: 'TikTok',
    5: 'Discord'
  },
  FocusArea: {
    1: 'DeFi',
    2: 'NFT',
    3: 'Gaming',
    4: 'Infrastructure',
    5: 'L2',
    6: 'DAO',
    7: 'Metaverse',
    8: 'Trading',
    9: 'Other'
  },
  CampaignStatus: {
    1: 'DRAFT',
    2: 'PENDING_ESCROW',
    3: 'ACTIVE',
    4: 'IN_PROGRESS',
    5: 'COMPLETED',
    6: 'CANCELLED',
    7: 'SUSPENDED'
  },
  ApplicationStatus: {
    1: 'PENDING',
    2: 'ACCEPTED',
    3: 'REJECTED',
    4: 'WITHDRAWN'
  },
  DeliverableStatus: {
    1: 'SUBMITTED',
    2: 'PENDING_VERIFICATION',
    3: 'VERIFIED',
    4: 'REJECTED',
    5: 'PAID'
  },
  DeliverableType: {
    1: 'Twitter Posts',
    2: 'Videos',
    3: 'Articles',
    4: 'AMAs',
    5: 'Discord Management',
    6: 'Community Growth',
    7: 'Instagram Post',
    8: 'TikTok'
  },
  CampaignDuration: {
    1: 'Less Than 1 Week',
    2: '1-2 Weeks',
    3: '2-4 Weeks',
    4: '1-3 Months',
    5: '3+ Months'
  },
  Complexity: {
    1: 'LOW',
    2: 'MEDIUM',
    3: 'HIGH'
  },
  PaymentToken: {
    1: 'USDC',
    2: 'USDT',
    3: 'ETH',
    4: 'AW3'
  },
  TimePeriod: {
    1: '7d',
    2: '30d',
    3: '90d',
    4: '1y'
  },
  EarningsRange: {
    1: 'Hourly',
    2: 'Daily',
    3: 'Monthly'
  }
};

// Match rate calculation helper
const calculateMatchRate = (creator, campaign) => {
  if (!creator || !campaign || !campaign.requiredReputation || !campaign.kpiTargets) {
    return null;
  }
  
  const reputationMatch = creator.reputation >= campaign.requiredReputation ? 1 : 0.5;
  const focusAreaMatch = creator.focusArea?.some(fa => campaign.focusArea === fa) ? 1 : 0.6;
  
  const matchRate = (reputationMatch * 0.6 + focusAreaMatch * 0.4) * 100;
  return Math.round(matchRate * 10) / 10;
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AW3 Platform Mock API',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      swagger: {
        yaml: '/swagger.yaml',
        json: '/swagger.json',
        ui: '/docs'
      },
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/wallet-connect', (req, res) => {
  const { walletAddress, chainId, walletType } = req.body;
  res.json(apiResponse({
    walletAddress,
    nonce: uuidv4(),
    message: `Welcome to AW3 Platform!\n\nSign this message to authenticate.\n\nWallet: ${walletAddress}\nChain ID: ${chainId || '1'}\nNonce: ${uuidv4()}`,
    expiresAt: Date.now() + 300000
  }));
});

app.post('/api/auth/verify-signature', (req, res) => {
  const { walletAddress, signature, nonce } = req.body;
  res.json(apiResponse({
    accessToken: 'mock_access_token_' + uuidv4(),
    refreshToken: 'mock_refresh_token_' + uuidv4(),
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: uuidv4(),
      walletAddress,
      role: 1,
      displayName: 'Demo Creator',
      profileComplete: false
    }
  }));
});

app.post('/api/auth/register', (req, res) => {
  const { walletAddress, role, termsAccepted } = req.body;
  res.json(apiResponse({
    userId: uuidv4(),
    walletAddress,
    role,
    accessToken: 'mock_access_token_' + uuidv4(),
    refreshToken: 'mock_refresh_token_' + uuidv4(),
    expiresIn: 3600,
    profileComplete: false,
    nextSteps: ['Complete profile', 'Verify social accounts', 'Browse campaigns']
  }));
});

app.post('/api/auth/refresh', (req, res) => {
  res.json(apiResponse({
    accessToken: 'mock_access_token_' + uuidv4(),
    expiresIn: 3600
  }));
});

app.post('/api/auth/logout', (req, res) => {
  res.json(apiResponse({ message: 'Logged out successfully' }));
});

app.get('/api/auth/nonce/:walletAddress', (req, res) => {
  res.json(apiResponse({
    walletAddress: req.params.walletAddress,
    nonce: uuidv4()
  }));
});

// ============ CREATOR PROFILE ENDPOINTS ============
app.get('/api/creator/profile/me', (req, res) => {
  res.json(apiResponse({
    userId: uuidv4(),
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    displayName: 'CryptoCreator',
    avatar: 'https://i.pravatar.cc/150?u=creator1',
    bio: 'Web3 content creator specializing in DeFi and NFT projects',
    focusArea: [1, 2, 6],
    socialAccounts: [
      {
        platform: 1,
        handle: '@cryptoinfluencer',
        link: 'https://twitter.com/cryptoinfluencer',
        followers: 125000,
        verified: true,
        verifiedAt: '2024-01-15T10:00:00Z'
      },
      {
        platform: 2,
        handle: '@cryptovideos',
        link: 'https://youtube.com/@cryptovideos',
        followers: 85000,
        verified: true,
        verifiedAt: '2024-01-20T10:00:00Z'
      }
    ],
    profileComplete: true,
    createdAt: '2024-01-10T10:00:00Z'
  }));
});

app.put('/api/creator/profile/me', (req, res) => {
  const { displayName, avatar, bio, focusArea } = req.body;
  res.json(apiResponse({
    userId: uuidv4(),
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    displayName: displayName || 'CryptoCreator',
    avatar: avatar || 'https://i.pravatar.cc/150?u=creator1',
    bio: bio || 'Web3 content creator',
    focusArea: focusArea || [1, 2],
    socialAccounts: [],
    profileComplete: true,
    createdAt: '2024-01-10T10:00:00Z'
  }));
});

app.post('/api/creator/profile/social-verification', (req, res) => {
  const { platform, handle } = req.body;
  res.json(apiResponse({
    platform,
    handle,
    verificationStatus: 'PENDING',
    message: 'Verification initiated. Please check your social media for instructions.'
  }));
});

// ============ CREATOR CAMPAIGNS ENDPOINTS ============
app.get('/api/creator/campaigns', (req, res) => {
  const mockCreatorProfile = {
    focusArea: [1, 2],
    reputation: 87.5
  };

  const campaigns = [
    {
      campaignId: uuidv4(),
      projectId: uuidv4(),
      title: 'DeFi Protocol Launch Campaign',
      focusArea: 1,
      status: 3,
      budgetAmount: 5000,
      budgetToken: 1,
      numberOfApplicants: 24,
      numberOfDeliveries: 5,
      deadline: '2025-01-15T23:59:59Z',
      kpiTargets: { views: 50000, engagement: 5 },
      requiredReputation: 75,
      matchRate: calculateMatchRate({ ...mockCreatorProfile, reputation: 87.5 }, { 
        focusArea: 1, 
        requiredReputation: 75, 
        kpiTargets: {} 
      }),
      projectAvatar: 'https://i.pravatar.cc/150?u=project1',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-10T10:00:00Z'
    },
    {
      campaignId: uuidv4(),
      projectId: uuidv4(),
      title: 'NFT Collection Promotion',
      focusArea: 2,
      status: 3,
      budgetAmount: 3500,
      budgetToken: 1,
      numberOfApplicants: 18,
      numberOfDeliveries: 8,
      deadline: '2025-01-20T23:59:59Z',
      kpiTargets: { views: 30000, engagement: 4 },
      requiredReputation: 70,
      matchRate: calculateMatchRate({ ...mockCreatorProfile, reputation: 87.5 }, { 
        focusArea: 2, 
        requiredReputation: 70, 
        kpiTargets: {} 
      }),
      projectAvatar: 'https://i.pravatar.cc/150?u=project2',
      createdAt: '2024-12-02T10:00:00Z',
      updatedAt: '2024-12-09T10:00:00Z'
    },
    {
      campaignId: uuidv4(),
      projectId: uuidv4(),
      title: 'Gaming Platform Beta Test',
      focusArea: 3,
      status: 3,
      budgetAmount: 8000,
      budgetToken: 1,
      numberOfApplicants: 42,
      numberOfDeliveries: 10,
      deadline: '2025-02-01T23:59:59Z',
      kpiTargets: { signups: 1000, engagement: 6 },
      requiredReputation: 80,
      matchRate: calculateMatchRate({ ...mockCreatorProfile, reputation: 87.5 }, { 
        focusArea: 3, 
        requiredReputation: 80, 
        kpiTargets: {} 
      }),
      projectAvatar: 'https://i.pravatar.cc/150?u=project3',
      createdAt: '2024-12-03T10:00:00Z',
      updatedAt: '2024-12-08T10:00:00Z'
    }
  ];

  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;

  res.json(apiResponse({
    campaigns,
    pagination: {
      currentPage: page,
      totalPages: 3,
      totalElements: 48,
      pageSize: size
    }
  }));
});

app.get('/api/creator/campaigns/:id', (req, res) => {
  res.json(apiResponse({
    campaignId: req.params.id,
    projectId: uuidv4(),
    title: 'DeFi Protocol Launch Campaign',
    description: 'Help us launch our revolutionary DeFi protocol with engaging content that educates and attracts users.',
    objective: 'Increase platform awareness and drive user signups through authentic creator content showcasing our unique features and benefits.',
    focusArea: 1,
    status: 3,
    budgetAmount: 5000,
    budgetToken: 1,
    numberOfCreators: 10,
    numberOfApplicants: 24,
    numberOfDeliveries: 5,
    deadline: '2025-01-15T23:59:59Z',
    complexity: 2,
    kpiTargets: {
      views: 50000,
      engagement: 5,
      conversions: 500
    },
    requiredReputation: 75,
    matchRate: 92.5,
    projectInfo: {
      projectId: uuidv4(),
      projectName: 'DefiMax Protocol',
      projectAvatar: 'https://i.pravatar.cc/150?u=project1',
      website: 'https://defimax.io',
      socialChannels: [
        {
          platform: 1,
          handle: '@DefiMax',
          link: 'https://twitter.com/defimax',
          followers: 45000,
          verified: true,
          verifiedAt: '2024-01-01T00:00:00Z'
        },
        {
          platform: 5,
          handle: 'DefiMax Community',
          link: 'https://discord.gg/defimax',
          followers: 12000,
          verified: true,
          verifiedAt: '2024-01-01T00:00:00Z'
        }
      ]
    },
    paymentTerms: {
      paymentMethod: 'USDC on Ethereum mainnet via smart contract escrow',
      paymentSchedule: 'Milestone-based: 50% upon content approval, 50% after 7 days performance verification',
      paymentConditions: 'Content must meet quality standards and achieve minimum 70% of target KPIs'
    },
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z'
  }));
});

// ============ CREATOR APPLICATIONS ENDPOINTS ============
app.get('/api/creator/applications', (req, res) => {
  res.json(apiResponse([
    {
      applicationId: uuidv4(),
      campaignId: uuidv4(),
      campaignTitle: 'DeFi Protocol Launch Campaign',
      creatorId: uuidv4(),
      proposedRate: 500,
      proposal: 'I have extensive experience promoting DeFi projects with proven track record...',
      status: 1,
      portfolioLinks: ['https://youtube.com/video1', 'https://twitter.com/post1'],
      relevantExperience: '3 years in Web3 content creation',
      estimatedCompletionDays: 7,
      matchScore: 92.5,
      appliedAt: '2024-12-08T10:00:00Z',
      reviewedAt: null
    },
    {
      applicationId: uuidv4(),
      campaignId: uuidv4(),
      campaignTitle: 'NFT Collection Promotion',
      creatorId: uuidv4(),
      proposedRate: 400,
      proposal: 'My audience loves NFT content...',
      status: 2,
      portfolioLinks: ['https://youtube.com/video2'],
      relevantExperience: '2 years NFT content',
      estimatedCompletionDays: 5,
      matchScore: 88.0,
      appliedAt: '2024-12-05T10:00:00Z',
      reviewedAt: '2024-12-07T10:00:00Z'
    }
  ]));
});

app.post('/api/creator/applications', (req, res) => {
  const { campaignId, proposedRate, proposal, portfolioLinks, relevantExperience, estimatedCompletionDays } = req.body;
  res.json(apiResponse({
    applicationId: uuidv4(),
    campaignId,
    creatorId: uuidv4(),
    proposedRate,
    proposal,
    status: 1,
    portfolioLinks,
    relevantExperience,
    estimatedCompletionDays,
    matchScore: 85.0,
    appliedAt: new Date().toISOString(),
    reviewedAt: null
  }));
});

app.get('/api/creator/applications/:id', (req, res) => {
  res.json(apiResponse({
    applicationId: req.params.id,
    campaignId: uuidv4(),
    campaignTitle: 'DeFi Protocol Launch Campaign',
    creatorId: uuidv4(),
    proposedRate: 500,
    proposal: 'I have extensive experience promoting DeFi projects...',
    status: 1,
    portfolioLinks: ['https://youtube.com/video1'],
    relevantExperience: '3 years in Web3',
    estimatedCompletionDays: 7,
    matchScore: 92.5,
    appliedAt: '2024-12-08T10:00:00Z',
    reviewedAt: null
  }));
});

// ============ CREATOR DELIVERABLES ENDPOINTS ============
app.get('/api/creator/deliverables', (req, res) => {
  res.json(apiResponse([
    {
      deliverableId: uuidv4(),
      campaignId: uuidv4(),
      creatorId: uuidv4(),
      contentUrl: 'https://youtube.com/watch?v=abc123',
      deliverableType: 2,
      platform: 2,
      status: 3,
      metrics: {
        views: 52000,
        likes: 3200,
        comments: 450,
        shares: 280,
        engagementRate: 7.5
      },
      cvpiScore: 88.5,
      paymentAmount: 500,
      submittedAt: '2024-12-05T10:00:00Z',
      verifiedAt: '2024-12-07T10:00:00Z'
    }
  ]));
});

app.post('/api/creator/deliverables', (req, res) => {
  const { campaignId, contentUrl, deliverableType, platform, description } = req.body;
  res.json(apiResponse({
    deliverableId: uuidv4(),
    campaignId,
    creatorId: uuidv4(),
    contentUrl,
    deliverableType,
    platform,
    status: 1,
    submittedAt: new Date().toISOString(),
    verifiedAt: null
  }));
});

app.get('/api/creator/deliverables/:id', (req, res) => {
  res.json(apiResponse({
    deliverableId: req.params.id,
    campaignId: uuidv4(),
    creatorId: uuidv4(),
    contentUrl: 'https://youtube.com/watch?v=abc123',
    deliverableType: 2,
    platform: 2,
    status: 3,
    metrics: {
      views: 52000,
      likes: 3200,
      comments: 450,
      shares: 280,
      engagementRate: 7.5
    },
    cvpiScore: 88.5,
    paymentAmount: 500,
    submittedAt: '2024-12-05T10:00:00Z',
    verifiedAt: '2024-12-07T10:00:00Z'
  }));
});

// ============ CREATOR EARNINGS ENDPOINTS ============
app.get('/api/creator/earnings', (req, res) => {
  res.json(apiResponse({
    totalEarned: 12450.50,
    pendingPayments: 1500.00,
    availableBalance: 10950.50,
    currency: 'USDC',
    averageROI: 45.8,
    growthRate: 12.5
  }));
});

app.get('/api/creator/earnings/history', (req, res) => {
  const range = parseInt(req.query.range) || 3;
  
  const generateData = (rangeType) => {
    const data = [];
    const now = new Date();
    let points = 30;
    
    if (rangeType === 1) points = 24; // Hourly
    if (rangeType === 2) points = 30; // Daily
    if (rangeType === 3) points = 12; // Monthly
    
    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now);
      if (rangeType === 1) timestamp.setHours(now.getHours() - i);
      if (rangeType === 2) timestamp.setDate(now.getDate() - i);
      if (rangeType === 3) timestamp.setMonth(now.getMonth() - i);
      
      data.push({
        timestamp: timestamp.toISOString(),
        amount: Math.random() * 500 + 100,
        transactionCount: Math.floor(Math.random() * 5) + 1
      });
    }
    return data;
  };

  res.json(apiResponse({
    data: generateData(range),
    range,
    totalAmount: 12450.50,
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date().toISOString()
  }));
});

// ============ CREATOR CVPI ENDPOINTS ============
app.get('/api/creator/cvpi/score', (req, res) => {
  res.json(apiResponse({
    userId: uuidv4(),
    overallScore: 82.3,
    components: {
      engagement: 85.0,
      reach: 78.5,
      conversion: 88.2,
      consistency: 80.0,
      quality: 79.8
    },
    reputation: {
      score: 87.5,
      tier: 'GOLD',
      totalReviews: 42,
      averageRating: 4.7
    },
    trend: 'UP',
    percentile: 87,
    lastUpdated: new Date().toISOString()
  }));
});

app.get('/api/creator/cvpi/history', (req, res) => {
  const period = parseInt(req.query.period) || 2;
  const limit = parseInt(req.query.limit) || 30;
  
  const generateHistory = (periodType, limitCount) => {
    const history = [];
    const now = new Date();
    
    let days = 7;
    if (periodType === 2) days = 30;
    if (periodType === 3) days = 90;
    if (periodType === 4) days = 365;
    
    const interval = Math.floor(days / Math.min(limitCount, days));
    
    for (let i = days; i >= 0; i -= interval) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        score: 70 + Math.random() * 20,
        reputation: 75 + Math.random() * 15
      });
    }
    return history.slice(0, limitCount);
  };

  res.json(apiResponse({
    history: generateHistory(period, limit),
    period,
    limit
  }));
});

// ============ CREATOR CERTIFICATES ENDPOINTS ============
app.get('/api/creator/certificates', (req, res) => {
  res.json(apiResponse({
    certificates: [
      {
        certificateId: uuidv4(),
        certificateType: 'Top Performer',
        title: 'DeFi Campaign Excellence',
        issueDate: '2024-11-15',
        imageUrl: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Top+Performer+Certificate',
        relatedCampaign: {
          campaignId: uuidv4(),
          campaignTitle: 'DeFi Protocol Launch Campaign',
          projectName: 'DefiMax Protocol'
        },
        metadata: {
          achievement: 'Exceeded KPIs by 150%',
          rank: '1/24'
        }
      },
      {
        certificateId: uuidv4(),
        certificateType: 'Quality Content',
        title: 'NFT Content Creation Award',
        issueDate: '2024-10-20',
        imageUrl: 'https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=Quality+Content+Award',
        relatedCampaign: {
          campaignId: uuidv4(),
          campaignTitle: 'NFT Collection Promotion',
          projectName: 'ArtBlock NFTs'
        },
        metadata: {
          achievement: 'Outstanding content quality',
          rating: '4.9/5.0'
        }
      },
      {
        certificateId: uuidv4(),
        certificateType: 'High Engagement',
        title: 'Community Builder Recognition',
        issueDate: '2024-09-10',
        imageUrl: 'https://via.placeholder.com/800x600/059669/FFFFFF?text=High+Engagement+Award',
        relatedCampaign: {
          campaignId: uuidv4(),
          campaignTitle: 'Gaming Platform Beta Test',
          projectName: 'MetaGame Arena'
        },
        metadata: {
          achievement: '12% engagement rate',
          followers: '+5000'
        }
      }
    ]
  }));
});

// ============ CREATOR SETTINGS ENDPOINTS ============
app.get('/api/creator/settings/language', (req, res) => {
  res.json(apiResponse({
    language: 'en',
    timezone: 'UTC'
  }));
});

app.post('/api/creator/settings/language', (req, res) => {
  res.json(apiResponse({
    language: req.body.language || 'en',
    timezone: req.body.timezone || 'UTC'
  }));
});

app.get('/api/creator/settings/rate', (req, res) => {
  res.json(apiResponse({
    hourlyRate: 100,
    dailyRate: 800,
    projectRate: 5000,
    currency: 'USDC',
    minimumBudget: 500
  }));
});

app.post('/api/creator/settings/rate', (req, res) => {
  res.json(apiResponse({
    hourlyRate: req.body.hourlyRate || 100,
    dailyRate: req.body.dailyRate || 800,
    projectRate: req.body.projectRate || 5000,
    currency: req.body.currency || 'USDC',
    minimumBudget: req.body.minimumBudget || 500
  }));
});

app.get('/api/creator/settings/notification', (req, res) => {
  res.json(apiResponse({
    emailNotifications: true,
    pushNotifications: true,
    campaignUpdates: true,
    applicationUpdates: true,
    paymentNotifications: true,
    marketingEmails: false
  }));
});

app.post('/api/creator/settings/notification', (req, res) => {
  res.json(apiResponse({
    emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : true,
    pushNotifications: req.body.pushNotifications !== undefined ? req.body.pushNotifications : true,
    campaignUpdates: req.body.campaignUpdates !== undefined ? req.body.campaignUpdates : true,
    applicationUpdates: req.body.applicationUpdates !== undefined ? req.body.applicationUpdates : true,
    paymentNotifications: req.body.paymentNotifications !== undefined ? req.body.paymentNotifications : true,
    marketingEmails: req.body.marketingEmails !== undefined ? req.body.marketingEmails : false
  }));
});

app.get('/api/creator/settings/privacy', (req, res) => {
  res.json(apiResponse({
    profileVisibility: 'PUBLIC',
    showEarnings: false,
    showCompletedCampaigns: true,
    showSocialAccounts: true
  }));
});

app.post('/api/creator/settings/privacy', (req, res) => {
  res.json(apiResponse({
    profileVisibility: req.body.profileVisibility || 'PUBLIC',
    showEarnings: req.body.showEarnings !== undefined ? req.body.showEarnings : false,
    showCompletedCampaigns: req.body.showCompletedCampaigns !== undefined ? req.body.showCompletedCampaigns : true,
    showSocialAccounts: req.body.showSocialAccounts !== undefined ? req.body.showSocialAccounts : true
  }));
});

app.get('/api/creator/settings/security', (req, res) => {
  res.json(apiResponse({
    twoFactorEnabled: false,
    loginAlerts: true,
    trustedDevices: [
      {
        deviceId: uuidv4(),
        deviceName: 'Chrome on Windows',
        lastUsed: '2024-12-10T09:30:00Z'
      }
    ]
  }));
});

app.post('/api/creator/settings/security', (req, res) => {
  res.json(apiResponse({
    twoFactorEnabled: req.body.twoFactorEnabled !== undefined ? req.body.twoFactorEnabled : false,
    loginAlerts: req.body.loginAlerts !== undefined ? req.body.loginAlerts : true,
    trustedDevices: req.body.trustedDevices || []
  }));
});

// ============ DASHBOARD ENDPOINTS ============
app.get('/api/dashboard/trending', (req, res) => {
  res.json(apiResponse({
    campaigns: [
      {
        campaignId: uuidv4(),
        projectId: uuidv4(),
        title: 'Viral DeFi Launch',
        focusArea: 1,
        status: 3,
        budgetAmount: 10000,
        budgetToken: 1,
        numberOfApplicants: 67,
        numberOfDeliveries: 15,
        deadline: '2025-01-25T23:59:59Z',
        kpiTargets: {},
        requiredReputation: 85,
        matchRate: 95.0,
        projectAvatar: 'https://i.pravatar.cc/150?u=trending1',
        createdAt: '2024-12-08T10:00:00Z',
        updatedAt: '2024-12-10T10:00:00Z'
      },
      {
        campaignId: uuidv4(),
        projectId: uuidv4(),
        title: 'Trending NFT Drop',
        focusArea: 2,
        status: 3,
        budgetAmount: 7500,
        budgetToken: 1,
        numberOfApplicants: 52,
        numberOfDeliveries: 12,
        deadline: '2025-01-18T23:59:59Z',
        kpiTargets: {},
        requiredReputation: 80,
        matchRate: 88.5,
        projectAvatar: 'https://i.pravatar.cc/150?u=trending2',
        createdAt: '2024-12-09T10:00:00Z',
        updatedAt: '2024-12-10T10:00:00Z'
      }
    ],
    period: '24h'
  }));
});

app.get('/api/dashboard/live', (req, res) => {
  res.json(apiResponse({
    campaigns: [
      {
        campaignId: uuidv4(),
        projectId: uuidv4(),
        title: 'Live Gaming Tournament',
        focusArea: 3,
        status: 4,
        budgetAmount: 6000,
        budgetToken: 1,
        numberOfApplicants: 35,
        numberOfDeliveries: 20,
        deadline: '2025-01-30T23:59:59Z',
        kpiTargets: {},
        requiredReputation: 75,
        matchRate: 82.0,
        projectAvatar: 'https://i.pravatar.cc/150?u=live1',
        createdAt: '2024-12-05T10:00:00Z',
        updatedAt: '2024-12-10T10:00:00Z'
      }
    ],
    activeCount: 28
  }));
});

app.get('/api/dashboard/action-items', (req, res) => {
  res.json(apiResponse({
    items: [
      {
        id: uuidv4(),
        type: 'DELIVERABLE_SUBMIT',
        title: 'Submit deliverable for DeFi Campaign',
        description: 'Content deadline approaching in 2 days',
        priority: 'HIGH',
        deadline: '2024-12-12T23:59:59Z',
        relatedEntityId: uuidv4()
      },
      {
        id: uuidv4(),
        type: 'APPLICATION_REVIEW',
        title: 'Check application status',
        description: 'Your application has been reviewed',
        priority: 'MEDIUM',
        deadline: null,
        relatedEntityId: uuidv4()
      },
      {
        id: uuidv4(),
        type: 'PAYMENT_PENDING',
        title: 'Payment verification in progress',
        description: 'Your deliverable is being verified for payment',
        priority: 'LOW',
        deadline: null,
        relatedEntityId: uuidv4()
      }
    ]
  }));
});

app.get('/api/dashboard/analytics', (req, res) => {
  res.json(apiResponse({
    totalCampaigns: 1247,
    activeCampaigns: 186,
    totalCreators: 8954,
    totalValueProcessed: 12450000
  }));
});

// ============ FILTER ENDPOINTS ============
app.get('/api/filters/campaign-options', (req, res) => {
  res.json(apiResponse({
    focusAreas: [
      { id: 1, name: 'DeFi', count: 45 },
      { id: 2, name: 'NFT', count: 38 },
      { id: 3, name: 'Gaming', count: 32 },
      { id: 4, name: 'Infrastructure', count: 28 },
      { id: 5, name: 'L2', count: 22 },
      { id: 6, name: 'DAO', count: 18 },
      { id: 7, name: 'Metaverse', count: 15 },
      { id: 8, name: 'Trading', count: 12 },
      { id: 9, name: 'Other', count: 8 }
    ],
    deliverableTypes: [
      { id: 1, name: 'Twitter Posts', count: 62 },
      { id: 2, name: 'Videos', count: 48 },
      { id: 3, name: 'Articles', count: 35 },
      { id: 4, name: 'AMAs', count: 25 },
      { id: 5, name: 'Discord Management', count: 18 },
      { id: 6, name: 'Community Growth', count: 15 },
      { id: 7, name: 'Instagram Post', count: 12 },
      { id: 8, name: 'TikTok', count: 10 }
    ],
    durations: [
      { id: 1, name: 'Less Than 1 Week', count: 28 },
      { id: 2, name: '1-2 Weeks', count: 42 },
      { id: 3, name: '2-4 Weeks', count: 58 },
      { id: 4, name: '1-3 Months', count: 35 },
      { id: 5, name: '3+ Months', count: 18 }
    ],
    stages: [
      { id: 1, name: 'Language' },
      { id: 2, name: 'Rate Configuration' },
      { id: 3, name: 'Notification Preferences' },
      { id: 4, name: 'Privacy Controls' },
      { id: 5, name: 'Wallet & Payout' },
      { id: 6, name: 'Security' }
    ],
    budgetRanges: [
      { min: 0, max: 1000, label: '$0 - $1,000', count: 45 },
      { min: 1000, max: 5000, label: '$1,000 - $5,000', count: 78 },
      { min: 5000, max: 10000, label: '$5,000 - $10,000', count: 52 },
      { min: 10000, max: 50000, label: '$10,000 - $50,000', count: 28 },
      { min: 50000, max: null, label: '$50,000+', count: 15 }
    ]
  }));
});

// ============ PUBLIC MARKETPLACE ENDPOINTS ============
app.get('/api/public/marketplace/campaigns', (req, res) => {
  res.json(apiResponse({
    campaigns: [
      {
        campaignId: uuidv4(),
        title: 'Public DeFi Campaign',
        focusArea: 1,
        budgetAmount: 5000,
        budgetToken: 1,
        deadline: '2025-01-15T23:59:59Z'
      }
    ]
  }));
});

app.get('/api/public/marketplace/stats', (req, res) => {
  res.json(apiResponse({
    totalCampaigns: 1247,
    activeCampaigns: 186,
    totalCreators: 8954,
    totalProjects: 542,
    totalValueProcessed: 12450000,
    averageCampaignBudget: 4520
  }));
});

// ============ PROJECT DASHBOARD ENDPOINTS ============
app.get('/api/project/dashboard/stats', (req, res) => {
  res.json(apiResponse({
    activeCampaigns: 3,
    pendingApplications: 12,
    budgetAvailable: 25000,
    deliverablesSubmitted: 3,
    totalCampaigns: 28,
    totalSpent: 245000,
    reputationScore: 780,
    reputationTier: 'B',
    avgCampaignCVPI: 95.3
  }));
});

// ============ PROJECT CAMPAIGNS ENDPOINTS ============
app.get('/api/project/campaigns', (req, res) => {
  const campaigns = [
    {
      campaignId: uuidv4(),
      name: 'DeFi Protocol Launch',
      focusArea: 1,
      status: 3,
      budgetTotal: 10000,
      budgetRemaining: 8000,
      applicationCount: 45,
      approvedCount: 3,
      deliverableCount: 2,
      daysRemaining: 12,
      cvpiScore: 85.3,
      cvpiClassification: 'Good',
      progressStage: 'InProgress',
      createdAt: '2024-12-01T10:00:00Z',
      endDate: '2025-01-15T23:59:59Z'
    },
    {
      campaignId: uuidv4(),
      name: 'NFT Collection Drop',
      focusArea: 2,
      status: 3,
      budgetTotal: 7000,
      budgetRemaining: 5500,
      applicationCount: 32,
      approvedCount: 2,
      deliverableCount: 1,
      daysRemaining: 18,
      cvpiScore: 78.6,
      cvpiClassification: 'Good',
      progressStage: 'Verification',
      createdAt: '2024-11-20T10:00:00Z',
      endDate: '2025-01-20T23:59:59Z'
    },
    {
      campaignId: uuidv4(),
      name: 'Gaming Partnership',
      focusArea: 3,
      status: 5,
      budgetTotal: 8500,
      budgetRemaining: 0,
      applicationCount: 28,
      approvedCount: 2,
      deliverableCount: 2,
      daysRemaining: null,
      cvpiScore: 92.1,
      cvpiClassification: 'Good',
      progressStage: 'Completed',
      createdAt: '2024-10-15T10:00:00Z',
      endDate: '2024-11-30T23:59:59Z'
    }
  ];

  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;

  res.json(apiResponse({
    campaigns,
    pagination: {
      currentPage: page,
      totalPages: 2,
      totalElements: 28,
      pageSize: size
    }
  }));
});

app.post('/api/project/campaigns', (req, res) => {
  const campaignId = uuidv4();
  res.json(apiResponse({
    campaignId,
    transactionHash: '0x8a2f' + Math.random().toString(36).substring(2, 15),
    status: 'PENDING',
    estimatedConfirmationTime: 30,
    totalLocked: req.body.creatorBudget * 1.12
  }));
});

app.get('/api/project/campaigns/:id', (req, res) => {
  res.json(apiResponse({
    campaignId: req.params.id,
    projectId: uuidv4(),
    name: 'DeFi Protocol Launch',
    description: 'Help us launch our revolutionary DeFi protocol with engaging content that educates and attracts users.',
    objective: 'Increase platform awareness and drive user signups through authentic creator content showcasing our unique features and benefits.',
    focusArea: 1,
    status: 3,
    budgetAmount: 10000,
    budgetToken: 1,
    numberOfCreators: 3,
    numberOfApplicants: 45,
    numberOfDeliveries: 5,
    deadline: '2025-01-15T23:59:59Z',
    complexity: 2,
    kpiTargets: {
      views: 50000,
      engagement: 5,
      conversions: 500
    },
    requiredReputation: 75,
    matchRate: 92.5,
    projectInfo: {
      projectId: uuidv4(),
      projectName: 'DefiMax Protocol',
      projectAvatar: 'https://i.pravatar.cc/150?u=project1',
      website: 'https://defimax.io',
      socialChannels: [
        {
          platform: 1,
          handle: '@DefiMax',
          link: 'https://twitter.com/defimax',
          followers: 45000,
          verified: true,
          verifiedAt: '2024-01-01T00:00:00Z'
        }
      ]
    },
    paymentTerms: {
      paymentMethod: 'USDC on Ethereum mainnet via smart contract escrow',
      paymentSchedule: 'Milestone-based: 50% upon content approval, 50% after 7 days performance verification',
      paymentConditions: 'Content must meet quality standards and achieve minimum 70% of target KPIs'
    },
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z'
  }));
});

app.put('/api/project/campaigns/:id', (req, res) => {
  res.json(apiResponse({
    message: 'Campaign updated successfully'
  }));
});

app.delete('/api/project/campaigns/:id', (req, res) => {
  res.json(apiResponse({
    message: 'Campaign deleted successfully'
  }));
});

app.post('/api/project/campaigns/:id/pause', (req, res) => {
  res.json(apiResponse({
    message: 'Campaign paused',
    status: 'PAUSED'
  }));
});

app.post('/api/project/campaigns/:id/resume', (req, res) => {
  res.json(apiResponse({
    message: 'Campaign resumed',
    status: 'ACTIVE'
  }));
});

app.post('/api/project/campaigns/:id/extend', (req, res) => {
  res.json(apiResponse({
    message: 'Campaign extended',
    newEndDate: req.body.newEndDate
  }));
});

app.post('/api/project/campaigns/:id/invite', (req, res) => {
  res.json(apiResponse({
    message: `${req.body.creatorIds.length} invitations sent`,
    invited: req.body.creatorIds
  }));
});

app.get('/api/project/campaigns/:id/export', (req, res) => {
  res.json(apiResponse({
    message: 'Report generation initiated',
    format: req.query.format,
    downloadUrl: `/downloads/campaign-${req.params.id}.${req.query.format.toLowerCase()}`
  }));
});

app.get('/api/project/campaigns/:id/metrics', (req, res) => {
  res.json(apiResponse({
    budgetStatus: {
      total: 10000,
      remaining: 8000,
      spent: 2000,
      percentageUsed: 20
    },
    applications: {
      received: 45,
      approved: 3,
      pendingReview: 12,
      rejected: 30
    },
    progress: {
      status: 3,
      daysElapsed: 18,
      daysTotal: 30,
      percentageComplete: 60,
      endDate: '2025-01-15T23:59:59Z'
    },
    cvpiScore: {
      current: 85.3,
      classification: 'Good',
      trend: 3.2
    }
  }));
});

app.get('/api/project/campaigns/:id/overview', (req, res) => {
  res.json(apiResponse({
    campaignId: req.params.id,
    details: {
      name: 'DeFi Protocol Launch',
      description: 'Help us launch our revolutionary DeFi protocol',
      deliverableRequirements: ['Twitter Thread', 'YouTube Video', 'Blog Article'],
      contentGuidelines: 'Focus on education, positive tone, include #DeFi hashtags'
    },
    kpiTargets: [
      {
        kpiName: 'Engagement Rate',
        target: 7.5,
        weight: 40,
        currentAverage: 8.2,
        status: 'Exceeding'
      },
      {
        kpiName: 'Reach',
        target: 200000,
        weight: 30,
        currentAverage: 245000,
        status: 'Exceeding'
      },
      {
        kpiName: 'Conversions',
        target: 350,
        weight: 30,
        currentAverage: 280,
        status: 'BelowTarget'
      }
    ],
    approvedCreators: [
      {
        creatorId: uuidv4(),
        name: 'CryptoCreator',
        avatar: 'https://i.pravatar.cc/150?u=creator1',
        reputation: 850,
        payment: 3333,
        deliverableStatus: 3,
        cvpiContribution: 78.5
      }
    ]
  }));
});

app.get('/api/project/campaigns/:id/analytics', (req, res) => {
  res.json(apiResponse({
    summary: {
      totalSpend: 10762,
      avgCVPI: 85.3,
      kpiSuccessRate: 87,
      avgCreatorReputation: 828
    },
    cvpiBreakdown: [
      {
        creatorName: 'Creator A',
        cvpiScore: 78.5,
        classification: 'Good'
      },
      {
        creatorName: 'Creator B',
        cvpiScore: 92.1,
        classification: 'Good'
      }
    ],
    kpiAchievement: [
      {
        date: '2024-12-01',
        kpiName: 'Engagement Rate',
        achievementPercentage: 109
      },
      {
        date: '2024-12-08',
        kpiName: 'Reach',
        achievementPercentage: 123
      }
    ],
    audienceReach: {
      totalImpressions: 735000,
      uniqueReach: 612000,
      totalEngagements: 58300,
      avgEngagementRate: 7.9
    },
    costEfficiency: {
      costPer1KImpressions: 14.65,
      costPerEngagement: 0.18,
      costPerConversion: 26.25
    }
  }));
});

app.get('/api/project/campaigns/:id/financials', (req, res) => {
  res.json(apiResponse({
    escrowOverview: {
      smartContractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      chain: 'BASE Mainnet',
      totalLocked: 11922,
      totalReleased: 3505,
      remainingBalance: 8417,
      expectedRefund: 1084
    },
    budgetAllocation: {
      creatorPayments: 10000,
      serviceFees: 768,
      oracleFees: 70,
      escrowBuffer: 1084,
      unused: 500
    },
    paymentHistory: [
      {
        date: '2024-11-23T10:30:00Z',
        type: 'CreatorPayment',
        recipient: 'Creator A',
        amount: 3333,
        status: 'Completed',
        transactionHash: '0x3f7a9e2b...'
      },
      {
        date: '2024-11-23T10:31:00Z',
        type: 'ServiceFee',
        recipient: 'AW3 Platform',
        amount: 256,
        status: 'Completed',
        transactionHash: '0x9c1d4f8a...'
      }
    ],
    feeBreakdown: {
      baseRate: 8,
      complexityMultiplier: 1.5,
      reputationDiscount: -20,
      tokenPaymentDiscount: -20,
      effectiveRate: 7.68,
      totalSaved: 432
    }
  }));
});

// ============ PROJECT APPLICATIONS ENDPOINTS ============
app.get('/api/project/applications', (req, res) => {
  const applications = [
    {
      applicationId: uuidv4(),
      campaignId: uuidv4(),
      campaignName: 'DeFi Protocol Launch',
      creatorId: uuidv4(),
      creatorName: 'CryptoInfluencer',
      creatorAvatar: 'https://i.pravatar.cc/150?u=creator1',
      reputation: 850,
      reputationTier: 'A',
      avgCVPI: 68.5,
      cvpiClassification: 'Excellent',
      socialStats: [
        { platform: 1, followers: 125000 },
        { platform: 5, followers: 2300 }
      ],
      campaignsCompleted: 42,
      successRate: 95,
      applicationMessage: 'I have extensive experience promoting DeFi projects with proven track record...',
      portfolioLinks: [
        {
          url: 'https://youtube.com/video1',
          title: 'DeFi Explained',
          description: 'Educational video about DeFi protocols'
        }
      ],
      appliedAt: '2024-12-08T10:00:00Z',
      status: 1,
      matchScore: 92.5
    },
    {
      applicationId: uuidv4(),
      campaignId: uuidv4(),
      campaignName: 'DeFi Protocol Launch',
      creatorId: uuidv4(),
      creatorName: 'BlockchainExpert',
      creatorAvatar: 'https://i.pravatar.cc/150?u=creator2',
      reputation: 780,
      reputationTier: 'B',
      avgCVPI: 75.2,
      cvpiClassification: 'Good',
      socialStats: [
        { platform: 1, followers: 85000 }
      ],
      campaignsCompleted: 28,
      successRate: 89,
      applicationMessage: 'My audience is highly engaged with DeFi content...',
      portfolioLinks: [],
      appliedAt: '2024-12-07T15:30:00Z',
      status: 1,
      matchScore: 85.0
    }
  ];

  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;

  res.json(apiResponse({
    applications,
    pagination: {
      currentPage: page,
      totalPages: 3,
      totalElements: 45,
      pageSize: size
    }
  }));
});

app.get('/api/project/applications/:id', (req, res) => {
  res.json(apiResponse({
    applicationId: req.params.id,
    campaignId: uuidv4(),
    campaignName: 'DeFi Protocol Launch',
    creatorId: uuidv4(),
    creatorName: 'CryptoInfluencer',
    creatorAvatar: 'https://i.pravatar.cc/150?u=creator1',
    reputation: 850,
    reputationTier: 'A',
    avgCVPI: 68.5,
    cvpiClassification: 'Excellent',
    socialStats: [
      { platform: 1, followers: 125000 },
      { platform: 5, followers: 2300 }
    ],
    campaignsCompleted: 42,
    successRate: 95,
    applicationMessage: 'I have extensive experience promoting DeFi projects with proven track record of delivering high engagement rates and conversions.',
    portfolioLinks: [
      {
        url: 'https://youtube.com/video1',
        title: 'DeFi Explained',
        description: 'Educational video about DeFi protocols'
      }
    ],
    appliedAt: '2024-12-08T10:00:00Z',
    status: 1,
    matchScore: 92.5
  }));
});

app.post('/api/project/applications/approve', (req, res) => {
  const successCount = req.body.applicationIds.length;
  res.json(apiResponse({
    successCount,
    failedIds: [],
    errors: []
  }));
});

app.post('/api/project/applications/reject', (req, res) => {
  const successCount = req.body.applicationIds.length;
  res.json(apiResponse({
    successCount,
    failedIds: [],
    errors: []
  }));
});

app.get('/api/project/applications/:id/deliverables', (req, res) => {
  res.json(apiResponse({
    deliverables: [
      {
        deliverableId: uuidv4(),
        contentUrl: 'https://twitter.com/user/status/123',
        deliverableType: 1,
        platform: 1,
        status: 3,
        submittedAt: '2024-12-10T10:00:00Z'
      }
    ]
  }));
});

// ============ PROJECT DELIVERABLES ENDPOINTS ============
app.get('/api/project/deliverables', (req, res) => {
  res.json(apiResponse({
    deliverables: [
      {
        deliverableId: uuidv4(),
        campaignId: uuidv4(),
        creatorId: uuidv4(),
        contentUrl: 'https://youtube.com/watch?v=abc123',
        deliverableType: 2,
        platform: 2,
        status: 2,
        metrics: {
          views: 52000,
          likes: 3200,
          comments: 450,
          shares: 280,
          engagementRate: 7.5
        },
        cvpiScore: 88.5,
        paymentAmount: 3333,
        submittedAt: '2024-12-05T10:00:00Z',
        verifiedAt: null
      }
    ]
  }));
});

app.get('/api/project/deliverables/:id', (req, res) => {
  res.json(apiResponse({
    deliverableId: req.params.id,
    campaignId: uuidv4(),
    creatorId: uuidv4(),
    creatorName: 'CryptoInfluencer',
    contentUrl: 'https://youtube.com/watch?v=abc123',
    deliverableType: 2,
    platform: 2,
    status: 2,
    metrics: {
      views: 52000,
      likes: 3200,
      comments: 450,
      shares: 280,
      engagementRate: 7.5
    },
    oracleVerification: {
      status: 'Complete',
      verifiedBy: 'Oracle Node #12',
      verifiedAt: '2024-11-23T10:30:00Z'
    },
    kpiResults: [
      {
        kpi: 'Engagement Rate',
        target: 7.5,
        actual: 8.2,
        achievement: 109,
        status: 'Met'
      },
      {
        kpi: 'Reach',
        target: 200000,
        actual: 245000,
        achievement: 123,
        status: 'Exceeded'
      }
    ],
    cvpiScore: 88.5,
    paymentAmount: 3333,
    submittedAt: '2024-12-05T10:00:00Z',
    verifiedAt: null
  }));
});

app.post('/api/project/deliverables/:id/verify', (req, res) => {
  res.json(apiResponse({
    message: 'Payment release initiated',
    transactionHash: '0x8a2f' + Math.random().toString(36).substring(2, 15),
    amount: 3333
  }));
});

app.post('/api/project/deliverables/:id/request-revision', (req, res) => {
  res.json(apiResponse({
    message: 'Revision requested',
    feedback: req.body.feedback
  }));
});

app.post('/api/project/deliverables/:id/reject', (req, res) => {
  res.json(apiResponse({
    message: 'Deliverable rejected',
    reason: req.body.reason,
    disputeInitiated: true
  }));
});

// ============ PROJECT CREATORS ENDPOINTS ============
app.get('/api/project/creators/discover', (req, res) => {
  const creators = [
    {
      creatorId: uuidv4(),
      displayName: 'CryptoInfluencer',
      avatar: 'https://i.pravatar.cc/150?u=creator1',
      reputation: 850,
      reputationTier: 'A',
      avgCVPI: 68.5,
      cvpiClassification: 'Excellent',
      socialStats: [
        { platform: 1, followers: 125000 },
        { platform: 2, followers: 85000 }
      ],
      campaignsCompleted: 42,
      successRate: 95,
      verticalExperience: [1, 2],
      estimatedCVPI: 72.3,
      available: true
    },
    {
      creatorId: uuidv4(),
      displayName: 'BlockchainGuru',
      avatar: 'https://i.pravatar.cc/150?u=creator2',
      reputation: 920,
      reputationTier: 'S',
      avgCVPI: 55.8,
      cvpiClassification: 'Excellent',
      socialStats: [
        { platform: 1, followers: 250000 },
        { platform: 2, followers: 150000 }
      ],
      campaignsCompleted: 78,
      successRate: 97,
      verticalExperience: [1, 4],
      estimatedCVPI: 58.2,
      available: true
    }
  ];

  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;

  res.json(apiResponse({
    creators,
    pagination: {
      currentPage: page,
      totalPages: 8,
      totalElements: 142,
      pageSize: size
    }
  }));
});

app.get('/api/project/creators/recommended', (req, res) => {
  res.json(apiResponse({
    creators: [
      {
        creatorId: uuidv4(),
        displayName: 'RecommendedCreator',
        avgCVPI: 62.5,
        reputation: 880,
        reason: 'Excellent performance in similar DeFi campaigns'
      }
    ]
  }));
});

app.get('/api/project/creators/:id', (req, res) => {
  res.json(apiResponse({
    creatorId: req.params.id,
    displayName: 'CryptoInfluencer',
    avatar: 'https://i.pravatar.cc/150?u=creator1',
    bio: 'Web3 content creator specializing in DeFi and NFT projects',
    reputation: 850,
    reputationTier: 'A',
    avgCVPI: 68.5,
    cvpiClassification: 'Excellent',
    socialStats: [
      { platform: 1, followers: 125000 },
      { platform: 2, followers: 85000 }
    ],
    campaignsCompleted: 42,
    successRate: 95,
    verticalExperience: [1, 2],
    available: true
  }));
});

// ============ PROJECT ANALYTICS ENDPOINTS ============
app.get('/api/project/analytics/overview', (req, res) => {
  res.json(apiResponse({
    totalSpend: 245000,
    avgCVPI: 95.3,
    campaignSuccessRate: 92,
    totalReach: 2800000,
    periodComparison: {
      previousPeriod: 18,
      platformAverage: 12,
      verticalAverage: 8
    }
  }));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(apiError('NOT_FOUND', `Endpoint ${req.path} not found`));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(apiError('INTERNAL_ERROR', 'Internal server error'));
});

app.listen(PORT, () => {
  console.log(`AW3 Platform Mock API running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
