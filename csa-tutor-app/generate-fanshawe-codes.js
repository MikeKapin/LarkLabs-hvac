// Generate 80 special access codes for Fanshawe students/faculty
// Format: FANSH#### (FANSH0001 - FANSH0080)

const fs = require('fs');

function generateFanshaweCodes() {
    const codes = [];

    for (let i = 1; i <= 80; i++) {
        const codeNumber = i.toString().padStart(4, '0');
        const code = `FANSH${codeNumber}`;
        codes.push(code);
    }

    return codes;
}

function generateMarkdownDoc(codes) {
    let markdown = `# Gas Technician AI Tutor - Fanshawe Student/Faculty Access Codes

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

`;

    // Group codes in sets of 10
    for (let i = 0; i < codes.length; i += 10) {
        const startNum = i + 1;
        const endNum = Math.min(i + 10, codes.length);
        markdown += `### Codes ${startNum}-${endNum}\n`;

        for (let j = i; j < Math.min(i + 10, codes.length); j++) {
            markdown += `${j + 1}. ${codes[j]}\n`;
        }
        markdown += '\n';
    }

    markdown += `---

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
1. **Backend:** \`netlify/functions/activation-manager.js\`
   - Added FANSH code validation (regex: \`/^FANSH\\d{4}$/\`)
   - Validates code number is between 1-80
   - Returns 12-month expiration date
   - Marks code as fanshawe_12month type

2. **Frontend:** \`src/components/ActivationModal.jsx\`
   - Added offline validation for FANSH codes
   - Displays special success message
   - Stores fanshaweCode flag in localStorage
   - Sets 12-month expiration tracking

3. **Frontend:** \`src/App.jsx\`
   - Added premium status checking
   - Gates AI chat mode behind activation
   - Added "Unlock AI Tutor" button for non-premium users
   - Auto-shows activation modal when ?activate=true in URL

### Code Format:
- Pattern: \`FANSH\` + 4 digits
- Example: FANSH0001, FANSH0042, FANSH0080
- Case-insensitive (FANSH0001 = fansh0001)

### Storage:
When activated, the following data is stored in localStorage:
\`\`\`javascript
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
\`\`\`

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

**Generated:** ${new Date().toLocaleDateString()}
**Total Codes:** 80
**Validity:** 12 months from activation
**Website:** https://gas-technician-ai-tutor-free.vercel.app/
**For:** Fanshawe College Students & Faculty
`;

    return markdown;
}

function generateSimpleList(codes) {
    let content = `GAS TECHNICIAN AI TUTOR - FANSHAWE ACCESS CODES
==============================================

Total Codes: 80
Duration: 12 months from activation
Usage: One-time use per code (one device only)
Website: https://gas-technician-ai-tutor-free.vercel.app/

==============================================

`;

    codes.forEach(code => {
        content += code + '\n';
    });

    content += `
==============================================

INSTRUCTIONS:
1. Go to https://gas-technician-ai-tutor-free.vercel.app/
2. Click the "Unlock AI Tutor" button
3. Enter your code (9 characters: FANSH####)
4. Enjoy 12 months of full AI tutor access!

After 12 months, the app will automatically revert to the free version.
`;

    return content;
}

// Generate codes
const codes = generateFanshaweCodes();

// Write markdown documentation
const markdownDoc = generateMarkdownDoc(codes);
fs.writeFileSync('FANSHAWE-ACCESS-CODES.md', markdownDoc);

// Write simple text list
const simpleList = generateSimpleList(codes);
fs.writeFileSync('fanshawe-codes-list.txt', simpleList);

console.log('✅ Generated 80 Fanshawe access codes!');
console.log('📄 Documentation: FANSHAWE-ACCESS-CODES.md');
console.log('📝 Simple list: fanshawe-codes-list.txt');
console.log('');
console.log('First 5 codes:');
codes.slice(0, 5).forEach((code, i) => {
    console.log(`  ${i + 1}. ${code}`);
});
console.log('  ...');
console.log(`  80. ${codes[79]}`);
