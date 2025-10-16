# LARK Labs - Unified Access Code System

## Overview
**One Code, Multiple Apps!** The same 80 LARK access codes work across ALL LARK Labs educational apps, providing students with unified access to the entire suite of tools.

### Supported Apps:
1. **Code Compass** - CSA code navigation and reference tool
2. **Gas Technician AI Tutor** - Interactive AI-powered training for G3/G2 certification

### Code Details:
- **Format:** LARK0001 through LARK0080 (8 characters)
- **Duration:** 12 months from activation date per app
- **Usage:** Each code can be used ONCE per app, per device
- **Expiration Behavior:** After 12 months, each app automatically reverts to its free version
- **No Renewal:** These codes do not auto-renew

---

## How It Works

### Unified Access Model
Each LARK code provides **independent 12-month access** to each app:

**Example:** Student receives code **LARK0001**

1. **Week 1:** Student activates LARK0001 in Code Compass
   - ✅ Code Compass: 12 months premium (expires Oct 2026)
   - ⏳ Gas Tutor: Not yet activated

2. **Week 5:** Same student activates LARK0001 in Gas Tutor
   - ✅ Code Compass: Still active (expires Oct 2026)
   - ✅ Gas Tutor: 12 months premium (expires Nov 2026)

3. **After 12 months:**
   - Each app independently reverts to free version when its activation expires
   - Student keeps using free features in both apps

### Key Benefits:
- ✅ **One code** for all LARK Labs apps
- ✅ **Independent activations** - activate when you need each app
- ✅ **No coordination required** - apps don't need to "talk" to each other
- ✅ **Simple distribution** - instructors give out one code per student
- ✅ **Future-proof** - same code will work on new LARK Labs apps as they're added

---

## Complete List of Access Codes

All 80 codes are documented in the Code Compass repository:
- Location: `Code Compass/SPECIAL-ACCESS-CODES.md`
- Location: `Code Compass/codes-list.txt`

**Code Range:** LARK0001 - LARK0080

```
LARK0001  LARK0002  LARK0003  LARK0004  LARK0005
LARK0006  LARK0007  LARK0008  LARK0009  LARK0010
...continuing through...
LARK0076  LARK0077  LARK0078  LARK0079  LARK0080
```

---

## How to Use

### For Students:

**Code Compass:**
1. Visit: https://codecompassapp.netlify.app/
2. Click the activation button
3. Enter your 8-character LARK code (e.g., LARK0001)
4. Full premium access for 12 months!

**Gas Technician AI Tutor:**
1. Visit: https://gas-technician-ai-tutor-free.vercel.app/
2. Click "Unlock AI Tutor" button
3. Enter your 8-character LARK code (e.g., LARK0001)
4. Full AI tutor access for 12 months!

### Important Notes:
- ✅ Use the **same code** for all apps
- ✅ Each activation is **independent** (different expiration dates)
- ✅ After 12 months per app, premium features disable automatically
- ✅ Apps revert to free version (not deleted)
- ✅ No credit card required
- ✅ No recurring charges

---

## Technical Implementation

### Frontend Validation (Both Apps)
**Files:**
- Code Compass: `src/components/ActivationModal.jsx`
- Gas Tutor: `src/components/ActivationModal.jsx`

**Validation Logic:**
```javascript
// Validates LARK codes (LARK0001 - LARK0080)
if (/^LARK\d{4}$/.test(upperCode)) {
  const codeNumber = parseInt(upperCode.substring(4));
  if (codeNumber >= 1 && codeNumber <= 80) {
    // Valid code - grant 12-month access
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  }
}
```

### Backend Validation (Both Apps)
**Files:**
- Code Compass: `netlify/functions/activation-manager.js`
- Gas Tutor: `netlify/functions/activation-manager.js`

**API Response:**
```json
{
  "success": true,
  "activated": true,
  "specialCode": true,
  "larkCode": true,
  "expiresAt": "2026-10-16T...",
  "months": 12,
  "codeType": "lark_12month"
}
```

### Storage (localStorage per app)

**Code Compass Storage:**
```javascript
codecompass_subscription_data: {
  isActive: true,
  activatedAt: "2025-10-16T...",
  expiresAt: "2026-10-16T...",
  activationCode: "LARK0001",
  deviceId: "device_xxx",
  specialCode: true,
  larkCode: true
}
```

**Gas Tutor Storage:**
```javascript
gastutor_subscription_data: {
  isActive: true,
  activatedAt: "2025-11-01T...",
  expiresAt: "2026-11-01T...",
  activationCode: "LARK0001",
  deviceId: "device_yyy",
  larkCode: true
}
```

**Note:** Each app stores its own activation independently in localStorage.

---

## Distribution Recommendations

### Use Cases:
- Educational institutions (1 code per student)
- Corporate training programs
- College/university courses
- Trade school programs
- Professional development
- Partner/affiliate programs

### Tracking Usage:
- Monitor Netlify function logs in each app
- Track activation timestamps per app
- No centralized tracking needed (apps are independent)

### Instructor Tips:
1. **Give each student ONE code** (e.g., LARK0001)
2. **Tell them it works on all LARK Labs apps**
3. **They can activate whenever they need each app**
4. **No rush to activate all apps at once**

---

## Future Apps

As new LARK Labs educational apps are released, the **same 80 codes** will work on them too!

Students with active codes can activate new apps as they become available during their 12-month period (from when they received the code, not from activation).

---

## Support

### For issues with codes or activation:

**Code Compass:**
- URL: https://codecompassapp.netlify.app/
- Verify code format: LARK#### (8 characters)
- Ensure code number is 0001-0080

**Gas Technician AI Tutor:**
- URL: https://gas-technician-ai-tutor-free.vercel.app/
- Verify code format: LARK#### (8 characters)
- Ensure code number is 0001-0080

### Common Issues:
- **"Invalid code"** → Check spelling and number range (1-80)
- **"Code already used"** → Each code works once per device per app
- **"Code expired"** → Codes don't expire, but activation grants 12 months

---

## Summary

**One Code → Multiple Apps → Independent Activations → 12 Months Each**

- ✅ Same 80 LARK codes work across all apps
- ✅ Activate each app independently when needed
- ✅ Each app gets its own 12-month period
- ✅ Simple for students and instructors
- ✅ Future-proof for new apps

**Generated:** October 16, 2025
**Total Codes:** 80
**Validity:** 12 months per app from activation
**Apps:** Code Compass, Gas Technician AI Tutor (+ future apps)
