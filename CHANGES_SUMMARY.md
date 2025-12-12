# API Changes Summary

## Overview
This document outlines all modifications made to the AW3 Platform Mock API to align with frontend UI design requirements. All changes have been tested locally and deployed to production.

## Production URL
https://aw3-platform-mock-api.onrender.com/docs

---

## I. User Registration & Authentication

### 1. Role Field Type Adjustment
**Change**: Converted role field from string to ENUM type (integer)

**Implementation**:
- Created UserRole enum with values: 1 = Creator, 2 = Projector, 3 = Admin, 4 = Validator
- Updated all registration and authentication endpoints to use integer enum
- Modified response schemas to return integer enum values

**Affected Endpoints**:
- POST /auth/register
- POST /auth/verify-signature
- GET /creator/profile/me

### 2. Simplified Registration Flow
**Change**: Reduced required fields in registration to essential only

**Implementation**:
- Modified POST /auth/register to require only: walletAddress, signature, nonce, role, termsAccepted
- Removed optional fields from registration (avatar, bio, languages, etc.)
- Added profileComplete flag to indicate completion status
- Added nextSteps array to guide users through profile completion

**Affected Endpoints**:
- POST /auth/register

---

## II. User Profile (Creator Profile)

### 3. Profile API Structure Adjustment
**Change A**: Renamed category to focusArea

**Implementation**:
- Created FocusArea enum with values: 1 = DeFi, 2 = NFT, 3 = Gaming, 4 = Infrastructure, 5 = L2, 6 = DAO, 7 = Metaverse, 8 = Trading, 9 = Other
- Changed field from string category to array of integer focusArea
- Updated all profile endpoints to use focusArea

**Change B**: Consolidated social accounts

**Implementation**:
- Merged socialLinks and verifiedSocialAccounts into unified socialAccounts array
- Created SocialAccount schema with fields: platform (enum), handle, link, followers, verified, verifiedAt
- Created SocialPlatform enum: 1 = Twitter, 2 = YouTube, 3 = Instagram, 4 = TikTok, 5 = Discord

**Affected Endpoints**:
- GET /creator/profile/me
- PUT /creator/profile/me
- POST /creator/profile/social-verification

### 4. Field Removals
**Changes**:
- Removed socialLinks field from PUT /creator/profile/me
- Removed standalone handle field (now platform-specific within socialAccounts)

---

## III. Reputation System Migration

### 5. Migrate Reputation to CVPI System
**Change**: Moved all reputation data to CVPI module

**Implementation**:
- Removed reputation fields from profile endpoints
- Enhanced GET /creator/cvpi/score to include reputation object with: score, tier, totalReviews, averageRating
- Modified GET /creator/cvpi/history to return historical reputation data alongside CVPI scores

**Affected Endpoints**:
- GET /creator/cvpi/score
- GET /creator/cvpi/history

---

## IV. Creator Earnings

### 6. Improvements to /creator/earnings
**Change**: Added required averageROI and growthRate fields

**Implementation**:
- Added averageROI field (decimal, represents percentage)
- Added growthRate field (decimal, represents month-over-month growth percentage)
- Updated EarningsSummary schema with these required fields

**Affected Endpoints**:
- GET /creator/earnings

### 7. New Earnings History Chart API
**Change**: Added endpoint for chart visualization

**Implementation**:
- Created GET /creator/earnings/history endpoint
- Added range parameter as ENUM: 1 = Hourly, 2 = Daily, 3 = Monthly
- Returns time-series data array with timestamp, amount, transactionCount
- Includes periodStart and periodEnd for chart rendering

**New Endpoint**:
- GET /creator/earnings/history

---

## V. CVPI API Enhancements

### 8. CVPI Score Endpoint
**Change**: Ensured response includes reputation data

**Implementation**:
- Added reputation object to CVPIScore schema
- Reputation includes: score, tier, totalReviews, averageRating

**Affected Endpoints**:
- GET /creator/cvpi/score

### 9. CVPI History Endpoint
**Change**: Converted period to enum and added limit parameter

**Implementation**:
- Created TimePeriod enum: 1 = 7d, 2 = 30d, 3 = 90d, 4 = 1y
- Changed period from string query parameter to integer enum
- Added required limit parameter (integer, min: 1, max: 100)
- History response includes both CVPI score and reputation score for each date

**Affected Endpoints**:
- GET /creator/cvpi/history

---

## VI. Campaign-Related APIs

### 10. Campaign List Endpoint
**Change**: Simplified response fields to essential overview only

**Implementation**:
- Reduced CampaignListItem schema to include only: campaignId, projectId, title, focusArea, status, budgetAmount, budgetToken, numberOfApplicants, numberOfDeliveries, deadline, kpiTargets, requiredReputation, matchRate, projectAvatar, createdAt, updatedAt
- Added comprehensive filter parameters: focusArea, minBudget, maxBudget, deliverableType, duration, complexity
- All filter parameters use ENUM types for consistency

**Affected Endpoints**:
- GET /creator/campaigns

### 11. Campaign Detail Endpoint Enhancements
**Change**: Added missing project information, objective, and payment terms

**Implementation**:
- Added projectInfo object containing:
  - projectId, projectName, projectAvatar, website
  - socialChannels array with full social account details
- Added objective field for explicit campaign objective description
- Added paymentTerms object containing:
  - paymentMethod (string description)
  - paymentSchedule (string description)
  - paymentConditions (string description)

**Affected Endpoints**:
- GET /creator/campaigns/{id}

### 12. Match Rate Status Correction
**Change**: Backend now computes actual match rate or returns null

**Implementation**:
- Created calculateMatchRate function that computes percentage based on:
  - Creator reputation vs required reputation (60% weight)
  - Creator focusArea match with campaign (40% weight)
- Returns null if insufficient data to compute
- Removed "pending" status, now returns actual decimal or null

**Affected Endpoints**:
- GET /creator/campaigns
- GET /creator/campaigns/{id}

### 13. Campaign Sidebar Data
**Change**: Added projectAvatar to campaign responses

**Implementation**:
- Added projectAvatar field (string, URI) to CampaignListItem
- Added projectAvatar field to CampaignDetail via projectInfo object

**Affected Endpoints**:
- GET /creator/campaigns
- GET /creator/campaigns/{id}

---

## VII. Application Module

### 14. Application List
**Change**: Aligned field structure across application form and list response

**Implementation**:
- Ensured ApplicationRequest and Application schemas have consistent field structures
- All fields that appear in form also appear in response
- Added matchScore field to indicate calculated match rate for application

**Affected Endpoints**:
- GET /creator/applications
- POST /creator/applications
- GET /creator/applications/{id}

---

## VIII. Deliverables Module

### 15. Campaign List Search Filter
**Change**: Created filter options endpoint with predefined values

**Implementation**:
- Created GET /filters/campaign-options endpoint
- Returns all available filter options:
  - focusAreas (array with id, name, count)
  - deliverableTypes (array with id, name, count)
  - durations (array with id, name, count)
  - stages (array with id, name)
  - budgetRanges (array with min, max, label, count)
- All values use integer enums matching the main schema definitions

**New Endpoint**:
- GET /filters/campaign-options

---

## IX. Certificate Gallery

### 16. New Certificate Endpoints
**Change**: Added certificate display functionality

**Implementation**:
- Created GET /creator/certificates endpoint
- Certificate schema includes:
  - certificateId, certificateType, title, issueDate
  - imageUrl for certificate image
  - relatedCampaign object with campaign and project details
  - metadata object for additional achievement information
- Returns array of all creator certificates

**New Endpoint**:
- GET /creator/certificates

---

## X. Settings Module

### 17. New Settings Endpoints
**Change**: Created comprehensive settings management

**Implementation**:
- Created 5 new setting categories, each with GET and POST endpoints:

**a) Language Settings**
- GET /creator/settings/language
- POST /creator/settings/language
- Fields: language (string), timezone (string)

**b) Rate Configuration**
- GET /creator/settings/rate
- POST /creator/settings/rate
- Fields: hourlyRate, dailyRate, projectRate, currency, minimumBudget

**c) Notification Settings**
- GET /creator/settings/notification
- POST /creator/settings/notification
- Fields: emailNotifications, pushNotifications, campaignUpdates, applicationUpdates, paymentNotifications, marketingEmails

**d) Privacy Settings**
- GET /creator/settings/privacy
- POST /creator/settings/privacy
- Fields: profileVisibility (enum), showEarnings, showCompletedCampaigns, showSocialAccounts

**e) Security Settings**
- GET /creator/settings/security
- POST /creator/settings/security
- Fields: twoFactorEnabled, loginAlerts, trustedDevices

**New Endpoints** (10 total):
- GET/POST /creator/settings/language
- GET/POST /creator/settings/rate
- GET/POST /creator/settings/notification
- GET/POST /creator/settings/privacy
- GET/POST /creator/settings/security

---

## XI. Dashboard Module

### 18. Dashboard Data Endpoints
**Change**: Created dashboard data endpoints

**Implementation**:
- Created 4 new dashboard endpoints:

**a) Trending**
- GET /dashboard/trending
- Returns popular/trending campaigns with period indicator

**b) Live**
- GET /dashboard/live
- Returns active ongoing campaigns with active count

**c) Action Items**
- GET /dashboard/action-items
- Returns creator tasks requiring attention
- Items include: type (enum), title, description, priority, deadline, relatedEntityId

**d) Footer Analytics**
- GET /dashboard/analytics
- Returns 4 key metrics: totalCampaigns, activeCampaigns, totalCreators, totalValueProcessed

**New Endpoints**:
- GET /dashboard/trending
- GET /dashboard/live
- GET /dashboard/action-items
- GET /dashboard/analytics

---

## XII. Global Specification Requirements

### 19. ENUM Standardization
**Change**: Converted all predefined-choice fields to integer ENUMs

**Implementation**:
- Created comprehensive enum system using integers (not strings)
- Implemented enums for:
  - UserRole, WalletType, SocialPlatform, FocusArea
  - CampaignStatus, ApplicationStatus, DeliverableStatus, DeliverableType
  - CampaignDuration, CampaignStage, Complexity
  - PaymentToken, TimePeriod, EarningsRange
- All enums use integer values (1, 2, 3, etc.) stored in database
- Swagger documentation includes clear mapping of integers to meaning
- Mock API returns integer enum values in all responses

### 20. Swagger Documentation Requirements
**Change**: Enhanced all Swagger specifications

**Implementation**:
- Complete request/response schemas (DTOs) for all endpoints
- All required fields clearly marked with required: true
- All data types specified correctly (prefer ENUM over string)
- Added descriptions and example values for all fields
- Ensured consistency between Swagger spec and actual API behavior
- All enums documented with integer-to-meaning mappings

---

## Summary Statistics

### New Endpoints Created: 19
- 1 filter endpoint
- 1 certificate endpoint
- 10 settings endpoints (5 categories x 2 methods)
- 4 dashboard endpoints
- 1 earnings history endpoint
- 1 CVPI history enhancement
- 1 registration simplification

### Modified Endpoints: 12
- 3 authentication endpoints (registration flow)
- 2 profile endpoints (focusArea, social accounts)
- 4 campaign endpoints (simplified list, enhanced detail, match rate)
- 2 CVPI endpoints (reputation integration)
- 1 earnings endpoint (ROI, growth rate)

### New ENUMs Created: 14
- UserRole, WalletType, SocialPlatform, FocusArea
- CampaignStatus, ApplicationStatus, DeliverableStatus, DeliverableType
- CampaignDuration, CampaignStage, Complexity
- PaymentToken, TimePeriod, EarningsRange

### Schema Changes: 25+
- Major restructuring of profile, campaign, CVPI, and earnings schemas
- Addition of new schemas for certificates, settings, dashboard, filters
- Consolidation of social account structures
- Migration of reputation to CVPI system

---

## Testing Verification

All changes have been:
1. Implemented in both swagger.yaml and server.js
2. Tested locally on http://localhost:3000
3. Committed to GitHub repository
4. Deployed to production at https://aw3-platform-mock-api.onrender.com

Key tested endpoints:
- GET /api/filters/campaign-options - Returns all filter options with enums
- GET /api/creator/certificates - Returns certificate gallery
- GET /api/creator/earnings - Includes averageROI and growthRate
- GET /api/dashboard/analytics - Returns footer analytics
- GET /api/creator/cvpi/score - Includes reputation data
- GET /api/creator/campaigns - Simplified list with match rate calculation

---

## Match Rate Calculation Logic

The match rate is calculated using the following formula:

```
reputationMatch = (creatorReputation >= campaignRequiredReputation) ? 1.0 : 0.5
focusAreaMatch = (creatorFocusArea overlaps with campaignFocusArea) ? 1.0 : 0.6

matchRate = (reputationMatch * 0.6 + focusAreaMatch * 0.4) * 100
```

Weight distribution:
- Reputation matching: 60%
- Focus area matching: 40%

Result: Percentage value (0-100) or null if insufficient data

---

## Deployment Information

**Repository**: https://github.com/aw3product/aw3-platform-mock-api

**Production API**: https://aw3-platform-mock-api.onrender.com/api

**Swagger Documentation**: https://aw3-platform-mock-api.onrender.com/docs

**Latest Commit**: "Major API improvements: ENUMs, simplified registration, CVPI integration, certificates, settings, dashboard endpoints"

**Deployment Platform**: Render.com (auto-deploys from GitHub main branch)

---

## Notes

1. All enum values are stored as integers, not strings
2. The API uses consistent ApiResponse wrapper for all responses
3. All timestamps use ISO 8601 format
4. All UUIDs use v4 format
5. Pagination is consistent across all list endpoints
6. Match rate calculation can return null when data is insufficient
7. The mock API generates realistic sample data for all endpoints
8. Bearer token authentication is required for all protected endpoints (except public marketplace)

---

## Frontend Integration Checklist

Frontend teams should:
1. Update all API calls to use integer enums instead of strings
2. Handle match rate as nullable number (not "pending" string)
3. Use focusArea instead of category throughout the application
4. Utilize unified socialAccounts structure for all social data
5. Implement filter UI using GET /filters/campaign-options endpoint
6. Display certificates using GET /creator/certificates
7. Render earnings charts using GET /creator/earnings/history with range parameter
8. Show reputation data from CVPI endpoint, not profile endpoint
9. Implement settings pages for all 5 setting categories
10. Use dashboard endpoints for dashboard data display
11. Display footer analytics from GET /dashboard/analytics
12. Handle simplified registration flow with profile completion steps

---

End of Changes Summary

