# HVAC Jack 5.0 - Access Codes

## Master Access Key
- **Code:** `HVACJACK2025`
- **Access Level:** Unlimited, no expiration
- **Expiry:** Never (100 years)
- **Purpose:** Administrator/Developer access

## Student Access Codes (80 codes)
- **Code Format:** `LARK####` (LARK0001 through LARK0080)
- **Access Level:** Full access for 12 months
- **Expiry:** 365 days from activation
- **Purpose:** Student testing and learning

### List of Student Codes:
```
LARK0001  LARK0002  LARK0003  LARK0004  LARK0005
LARK0006  LARK0007  LARK0008  LARK0009  LARK0010
LARK0011  LARK0012  LARK0013  LARK0014  LARK0015
LARK0016  LARK0017  LARK0018  LARK0019  LARK0020
LARK0021  LARK0022  LARK0023  LARK0024  LARK0025
LARK0026  LARK0027  LARK0028  LARK0029  LARK0030
LARK0031  LARK0032  LARK0033  LARK0034  LARK0035
LARK0036  LARK0037  LARK0038  LARK0039  LARK0040
LARK0041  LARK0042  LARK0043  LARK0044  LARK0045
LARK0046  LARK0047  LARK0048  LARK0049  LARK0050
LARK0051  LARK0052  LARK0053  LARK0054  LARK0055
LARK0056  LARK0057  LARK0058  LARK0059  LARK0060
LARK0061  LARK0062  LARK0063  LARK0064  LARK0065
LARK0066  LARK0067  LARK0068  LARK0069  LARK0070
LARK0071  LARK0072  LARK0073  LARK0074  LARK0075
LARK0076  LARK0077  LARK0078  LARK0079  LARK0080
```

## Features

### Access Tracking
- **Storage:** Both sessionStorage and localStorage for persistence
- **Tracking:** Records activation date, access type, and expiry date
- **Console Logging:** Shows access type and days remaining on login

### Security
- Codes are case-insensitive (automatically converted to uppercase)
- Invalid attempts are logged to console
- Expired codes automatically cleared from storage
- Session persists across browser sessions via localStorage

### Access Differences

| Feature | Master Key | Student Codes |
|---------|-----------|---------------|
| Duration | Unlimited (100 years) | 12 months |
| Code | HVACJACK2025 | LARK0001-LARK0080 |
| Quantity | 1 | 80 |
| Purpose | Admin/Dev | Students |
| Renewal | Never expires | Expires after 365 days |

## Usage

1. Navigate to HVAC Jack 5.0
2. Enter access code (HVACJACK2025 or any LARK#### code)
3. Access is granted immediately
4. Code is stored in browser (persists across sessions)
5. Check browser console for expiry information

## Technical Implementation

```javascript
// Master key - 100 years expiry
if (accessType === 'master') {
    expiryTime = new Date().getTime() + (100 * 365 * 24 * 60 * 60 * 1000);
}

// Student codes - 12 months expiry
else {
    expiryTime = new Date().getTime() + (365 * 24 * 60 * 60 * 1000);
}
```

## Version History

- **v5.0** - Initial release with dual access system
  - Claude Sonnet 4.5 integration
  - 81 total access codes (1 master + 80 student)
  - Persistent localStorage storage
  - Automatic expiry tracking

---

**Document Updated:** October 16, 2025
**HVAC Jack Version:** 5.0 - Student Edition
**Powered by:** Claude Sonnet 4.5
