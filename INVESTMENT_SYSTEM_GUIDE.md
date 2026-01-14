# Investment Management System - Implementation Guide

## Overview
This document describes the investment management system implemented for YuJoFintech, which allows tracking of money that temporarily leaves the cash register with the expectation of returning with profit.

## Business Logic

### The Two-Moment Flow

#### Moment A: Investment (Money Leaving)
When an investment is created:
1. **Inversion Record** is created with status `ACTIVA`
   - Tracks: amount, description, responsible party, dates, notes
2. **Movement Record** is created with type `INVERSION` and status `EN_CURSO`
   - This represents money leaving the cash register
3. **Cash Balance** is automatically reduced by the investment amount
4. Both records are persisted to Firebase Firestore

#### Moment B: Return (Money Coming Back)
When the investment is returned:
1. **Original Investment Movement** is marked as `ARCHIVADO`
2. **Return Movement** is created for the capital (original amount)
   - Type: `INGRESO`, Category: "Inversión Retornada"
3. **Profit Movement** is created if there's profit (optional)
   - Type: `INGRESO`, Category: "Utilidad Inversión"
4. **Inversion Record** is updated to status `COMPLETADA`
   - Stores: `montoRetornado`, `ganancia`, `fechaRetornoReal`
5. **Cash Balance** increases by the total returned amount

## Key Components

### 1. InvestmentManager Component (`components/InvestmentManager.tsx`)
The main UI for managing investments:
- **Nueva Inversión Form**: Create new investments
- **Active Investments List**: View and manage ongoing investments
- **"Registrar Devolución" Button**: Record investment returns
- **Historical View**: See completed investments with profit/loss

### 2. Enhanced Types (`types.ts`)
Extended the `Inversion` interface with:
- `montoRetornado`: Total amount received (capital + profit)
- `ganancia`: Calculated profit/loss (can be negative)
- `fechaRetornoReal`: Actual date when money was returned

### 3. App Integration (`App.tsx`)
Two main handlers:
- `handleCreateInvestment`: Creates investment and cash outflow
- `handleReturnInvestmentNew`: Records return and calculates profit

### 4. Dashboard Updates (`components/Dashboard.tsx`)
- Shows total amount in active investments
- Shows count of active investment projects
- Balance calculation properly excludes invested money

## Data Flow Example

### Creating an Investment
```
User inputs: $10,000 for "Compra-venta con hermano"
↓
System creates:
  - Inversion { id: INV-ABC123, monto: 10000, status: ACTIVA, ... }
  - Movement { id: SAL-INV-ABC123, type: INVERSION, amount: 10000, status: EN_CURSO }
↓
Cash balance: $50,000 → $40,000 (reduced by $10,000)
```

### Recording Return
```
User inputs: $12,500 total returned
↓
System calculates: Profit = $12,500 - $10,000 = $2,500
↓
System creates:
  - Movement { id: RET-INV-ABC123, type: INGRESO, amount: 10000 } (capital)
  - Movement { id: GAN-INV-ABC123, type: INGRESO, amount: 2500 } (profit)
↓
System updates:
  - Inversion { status: COMPLETADA, montoRetornado: 12500, ganancia: 2500 }
  - Original movement { status: ARCHIVADO }
↓
Cash balance: $40,000 → $52,500 (increased by $12,500)
```

## Important Characteristics

### Cash Balance Impact
- **During Investment**: Money is NOT available (subtracted from balance)
- **After Return**: Money becomes available again (added back to balance)
- This ensures accurate tracking of liquidity vs. illiquid assets

### Error Handling
- Optimistic updates for better UX
- Complete rollback on Firebase errors
- Restores all state changes if persistence fails

### Validation
- Warns if returned amount is less than invested (potential loss)
- Allows user to confirm before proceeding with loss

### Firebase Integration
- Inversiones stored in `inversiones` collection
- Movements stored in `yujofintech` collection
- Real-time sync with optimistic updates

## Navigation
Users can access the investment system via:
1. Sidebar → "Inversiones" menu item
2. Dashboard shows investment summary

## Future Enhancements (Not Implemented)
- Modal dialog instead of window.prompt for better UX
- Investment categories for reporting
- Expected vs. actual return comparison
- ROI calculations and analytics
- Notification system for estimated return dates

## Security
- No vulnerabilities detected by CodeQL
- Input validation for amounts
- Proper error handling and rollback
- Secure ID generation using crypto.randomUUID when available

## Testing Recommendations
1. Create an investment and verify cash balance decreases
2. Return the investment and verify:
   - Cash balance increases correctly
   - Profit is calculated and recorded separately
   - Investment status changes to COMPLETADA
3. Test error scenarios (network failures)
4. Verify data persistence in Firebase Firestore
5. Test with loss scenario (return less than invested)
