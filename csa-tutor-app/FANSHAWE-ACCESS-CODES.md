# Gas Technician AI Tutor - Fanshawe Student/Faculty Access Codes

## Overview
80 special one-time use codes have been generated for Fanshawe College students and faculty to access the full AI Tutor features.

### Code Details:
- **Format:** FANSH0001 through FANSH0080
- **Duration:** 12 months from activation date
- **Usage:** Each code can be used ONCE on ONE device only
- **Expiration Behavior:** After 12 months, the app automatically reverts to free version
- **No Renewal:** These codes do not auto-renew

---

## Complete List of Access Codes

### Codes 1-10
1. FANSH0001
2. FANSH0002
3. FANSH0003
4. FANSH0004
5. FANSH0005
6. FANSH0006
7. FANSH0007
8. FANSH0008
9. FANSH0009
10. FANSH0010

### Codes 11-20
11. FANSH0011
12. FANSH0012
13. FANSH0013
14. FANSH0014
15. FANSH0015
16. FANSH0016
17. FANSH0017
18. FANSH0018
19. FANSH0019
20. FANSH0020

### Codes 21-30
21. FANSH0021
22. FANSH0022
23. FANSH0023
24. FANSH0024
25. FANSH0025
26. FANSH0026
27. FANSH0027
28. FANSH0028
29. FANSH0029
30. FANSH0030

### Codes 31-40
31. FANSH0031
32. FANSH0032
33. FANSH0033
34. FANSH0034
35. FANSH0035
36. FANSH0036
37. FANSH0037
38. FANSH0038
39. FANSH0039
40. FANSH0040

### Codes 41-50
41. FANSH0041
42. FANSH0042
43. FANSH0043
44. FANSH0044
45. FANSH0045
46. FANSH0046
47. FANSH0047
48. FANSH0048
49. FANSH0049
50. FANSH0050

### Codes 51-60
51. FANSH0051
52. FANSH0052
53. FANSH0053
54. FANSH0054
55. FANSH0055
56. FANSH0056
57. FANSH0057
58. FANSH0058
59. FANSH0059
60. FANSH0060

### Codes 61-70
61. FANSH0061
62. FANSH0062
63. FANSH0063
64. FANSH0064
65. FANSH0065
66. FANSH0066
67. FANSH0067
68. FANSH0068
69. FANSH0069
70. FANSH0070

### Codes 71-80
71. FANSH0071
72. FANSH0072
73. FANSH0073
74. FANSH0074
75. FANSH0075
76. FANSH0076
77. FANSH0077
78. FANSH0078
79. FANSH0079
80. FANSH0080

---

## How to Use

### For Students/Faculty:
1. Visit: https://gas-technician-ai-tutor-free.vercel.app/
2. Click on "Unlock AI Tutor" button or visit via the landing page
3. Enter your 9-character code (e.g., FANSH0001)
4. Click "Activate AI Tutor Pro"
5. Full AI tutor access will be granted for 12 months

### Important Notes:
- Each code works only ONCE
- After 12 months, AI features will be disabled
- The app will revert to free (search-only) version automatically
- No subscription management needed
- No credit card required

---

## Technical Implementation

### Files Modified:
1. **Backend:** `netlify/functions/activation-manager.js`
   - Added FANSH code validation (regex: `/^FANSH\d{4}$/`)
   - Validates code number is between 1-80
   - Returns 12-month expiration date
   - Marks code as fanshawe_12month type

2. **Frontend:** `src/components/ActivationModal.jsx`
   - Added offline validation for FANSH codes
   - Displays special success message
   - Stores fanshaweCode flag in localStorage
   - Sets 12-month expiration tracking

3. **Frontend:** `src/App.jsx`
   - Added premium status checking
   - Gates AI chat mode behind activation
   - Added "Unlock AI Tutor" button for non-premium users
   - Auto-shows activation modal when ?activate=true in URL

### Code Format:
- Pattern: `FANSH` + 4 digits
- Example: FANSH0001, FANSH0042, FANSH0080
- Case-insensitive (FANSH0001 = fansh0001)

### Storage:
When activated, the following data is stored in localStorage:
```javascript
{
  isActive: true,
  activatedAt: "2025-10-16T...",
  expiresAt: "2026-10-16T...",
  activationCode: "FANSH0001",
  deviceId: "device_xxx",
  remainingActivations: 0,
  isSpecialActivation: true,
  specialCode: true,
  fanshaweCode: true
}
```

---

## Distribution Recommendations

### Use Cases:
- Fanshawe College gas technician students
- Fanshawe faculty teaching gas technology courses
- College-sponsored training programs
- Educational partnership programs

### Tracking Usage:
Monitor code usage by checking activation logs in Netlify Functions.
Each activation logs the code number and timestamp.

---

## Support

For issues with codes or activation:
- Check: https://gas-technician-ai-tutor-free.vercel.app/
- Verify code is typed correctly (9 characters: FANSH + 4 digits)
- Ensure code hasn't been used previously
- Try online activation first (offline fallback available)

---

**Generated:** 2025-10-16
**Total Codes:** 80
**Validity:** 12 months from activation
**Website:** https://gas-technician-ai-tutor-free.vercel.app/
**For:** Fanshawe College Students & Faculty
