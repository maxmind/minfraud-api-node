# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**minfraud-api-node** is MaxMind's official Node.js/TypeScript client library for the minFraud web services:
- **minFraud Score**: Returns a risk score (0.01-99) indicating fraud likelihood
- **minFraud Insights**: Score + additional data about IP, email, device, and shipping/billing addresses
- **minFraud Factors**: Insights + risk score reasons and subscores (deprecated)
- **Report Transactions API**: Report transaction outcomes to improve fraud detection

The library is server-side only and provides strongly-typed request/response models for fraud detection.

**Key Technologies:**
- TypeScript with strict type checking
- Node.js 18+ (targets active LTS versions)
- Uses Node.js built-in `fetch` for HTTP requests
- Jest for testing
- ESLint + Prettier for code quality
- TypeDoc for API documentation
- Depends on @maxmind/geoip2-node for IP geolocation data

## Code Architecture

### Package Structure

```
src/
├── request/               # Transaction input models (Device, Email, Billing, etc.)
│   ├── transaction.ts     # Main Transaction class that aggregates all inputs
│   └── *.ts               # Individual request component classes
├── response/
│   ├── models/            # Response models (Score, Insights, Factors)
│   ├── records.ts         # TypeScript interfaces for response data records
│   └── web-records.ts     # Raw API response types (snake_case)
├── webServiceClient.ts    # HTTP client for minFraud web services
├── constants.ts           # Enums for API values (EventType, Processor, etc.)
├── utils.ts               # Utility functions (camelCase/snake_case conversion)
├── errors.ts              # Custom error classes
└── types.ts               # Type definitions
```

### Key Design Patterns

#### 1. **Request/Response Transformation**

Requests use camelCase and are converted to snake_case for the API:
```typescript
// User provides: new Device({ ipAddress: '1.2.3.4' })
// Sent to API: { ip_address: '1.2.3.4' }
```

Responses use snake_case and are converted to camelCase in model constructors:
```typescript
// API returns: { risk_score: 50, funds_remaining: 10.50 }
// Model exposes: response.riskScore, response.fundsRemaining
```

The `camelizeResponse()` utility in `utils.ts` handles deep conversion for response data.
The `snakecaseKeys()` utility converts request objects to snake_case.

#### 2. **Model Inheritance Hierarchy**

Response models follow clear inheritance:
- `Score` → base model with risk score, disposition, warnings
- `Insights` extends `Score` → adds billing/shipping addresses, device, email, credit card data
- `Factors` extends `Insights` → adds risk score reasons and subscores (deprecated)

#### 3. **Transaction Builder Pattern**

Transactions are composed of optional components:
```typescript
const transaction = new minFraud.Transaction({
  device: new minFraud.Device({ ipAddress: '1.2.3.4' }),
  email: new minFraud.Email({ address: 'test@example.com' }),
  billing: new minFraud.Billing({ /* ... */ }),
  // ... other components
});
```

Each component validates its inputs in the constructor and throws `ArgumentError` for invalid data.

#### 4. **Web Service Client Pattern**

The `WebServiceClient` provides direct methods for each endpoint:
```typescript
const client = new WebServiceClient(accountID, licenseKey, timeout, host);
const response = await client.score(transaction);
const response = await client.insights(transaction);
const response = await client.factors(transaction);
await client.reportTransaction(report);
```

#### 5. **Type Definitions Pattern**

**IMPORTANT:** When defining enum-like fields with a fixed set of values:

1. **Define union types in `web-records.ts`** for the snake_case API response:
   ```typescript
   export type CreditCardType = 'charge' | 'credit' | 'debit';
   export type EmailDomainClassification = 'business' | 'education' | 'government' | 'isp_email';
   ```

2. **Import and reuse these types in `records.ts`** for the camelCase public API:
   ```typescript
   import {
     CreditCardType,
     DispositionAction,
     DispositionReason,
     EmailDomainClassification,
     EmailDomainVisitStatus,
   } from './web-records';

   export interface CreditCardRecord {
     readonly type: CreditCardType;  // Use the imported type, NOT string
   }
   ```

**Do NOT use plain `string` type when a union type exists in web-records.ts.** This pattern:
- Provides better type safety for library consumers
- Maintains a single source of truth for enum values
- Follows the established pattern for `CreditCardType`, `DispositionAction`, `DispositionReason`, etc.

**Exception:** Use plain `string` only when the API documentation explicitly states "additional values may be added in the future" AND you want to allow any string value (e.g., `phone.numberType`).

#### 6. **GeoIP2 Integration**

The Insights and Factors responses include IP geolocation data from the @maxmind/geoip2-node library:
```typescript
// In Insights constructor:
const insights = new GeoInsights(response.ip_address) as records.IpAddress;
// Augment with minFraud-specific fields
insights.country.isHighRisk = response.ip_address.country.is_high_risk;
insights.risk = response.ip_address.risk;
```

## Testing Conventions

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest src/webServiceClient.spec.ts
```

### Linting and Building

```bash
# Lint code (ESLint + TypeScript)
npm run lint

# Format code (Prettier)
npm run prettier:ts
npm run prettier:json

# Build TypeScript
npm run build

# Build and deploy documentation
npm run build:docs
npm run deploy:docs
```

### Test Structure

Tests use `.spec.ts` files co-located with source:
- `src/webServiceClient.spec.ts` - Web service client tests
- `src/request/*.spec.ts` - Request component tests
- `src/response/models/*.spec.ts` - Response model tests
- `src/utils.spec.ts` - Utility function tests
- `e2e/` - End-to-end integration tests (JS and TS)

### Test Patterns

Tests typically use `nock` to mock HTTP responses:
```typescript
import nock from 'nock';

nock('https://minfraud.maxmind.com')
  .post('/minfraud/v2.0/score')
  .reply(200, { risk_score: 50, id: '...', /* ... */ });

const response = await client.score(transaction);
expect(response.riskScore).toBe(50);
```

When adding new fields to models:
1. Update test fixtures/mocks to include the new field
2. Add assertions to verify the field is properly mapped
3. Test both presence and absence (undefined handling)
4. Verify camelCase conversion from snake_case source

## Working with This Codebase

### Adding New Fields to Request Components

1. **Add the property** to the component class with validation:
   ```typescript
   /**
    * Description of the field.
    */
   public fieldName?: Type;
   ```

2. **Update the constructor** if validation is needed:
   ```typescript
   if (props.fieldName && !isValid(props.fieldName)) {
     throw new ArgumentError('Invalid fieldName');
   }
   this.fieldName = props.fieldName;
   ```

3. **Add to the interface** (e.g., `DeviceProps`, `EmailProps`) for type safety

4. **Add tests** that verify validation and serialization

5. **Update CHANGELOG.md** with the change

### Adding New Fields to Response Models

1. **Add the property** with proper type annotation:
   ```typescript
   /**
    * Description of the field, including availability (which endpoints).
    */
   public readonly fieldName?: Type;
   ```

2. **Update the constructor** to map from the response:
   ```typescript
   // For simple fields:
   this.fieldName = response.field_name;

   // For nested objects that need camelization:
   this.fieldName = this.maybeGet<records.FieldType>(response, 'field_name');
   ```

3. **Update corresponding record interfaces** in `records.ts` or `web-records.ts`

4. **Add tests** that verify the field mapping and type

5. **Update CHANGELOG.md** with the change

### Adding New Constants/Enums

When the API adds new enum values (e.g., new payment processors, event types):

1. **Update `src/constants.ts`** with the new value:
   ```typescript
   export enum Processor {
     Stripe = 'stripe',
     NewProcessor = 'new_processor',
     // ...
   }
   ```

2. **Add tests** if the enum has validation logic

3. **Update CHANGELOG.md** with the change

### CHANGELOG.md Format

Always update `CHANGELOG.md` for user-facing changes.

**Important**: Do not add a date to changelog entries until release time.

- If the next version doesn't exist, create it as `X.Y.Z (unreleased)` or just `X.Y.Z` (the header format varies)
- If it already exists without a date, add your changes there
- The release date will be added when the version is actually released

```markdown
8.2.0
------------------

* Added `NewProcessor` to the `Processor` enum.
* Added the output `/email/first_seen`. This is available as the
  `firstSeen` property on `response.email`.
```

## Common Pitfalls and Solutions

### Problem: Incorrect snake_case to camelCase Mapping

API responses use snake_case but must be exposed as camelCase.

**Solution**: Use `camelizeResponse()` for nested objects:
```typescript
this.email = this.maybeGet<records.Email>(response, 'email');

private maybeGet<T>(response: Response, prop: keyof Response): T | undefined {
  return response[prop] ? (camelizeResponse(response[prop]) as T) : undefined;
}
```

### Problem: Request Validation Not Working

Request components should validate inputs in constructors.

**Solution**: Import validators from the `validator` package:
```typescript
import validator from 'validator';

if (!validator.isEmail(props.address)) {
  throw new ArgumentError('Invalid email address');
}
```

### Problem: Missing Error Handling

The client can throw various error types.

**Solution**: Check for error codes in catch blocks:
```typescript
try {
  const response = await client.score(transaction);
} catch (error) {
  // error has shape: { code: string, error: string, url?: string }
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Handle insufficient funds
  }
}
```

### Problem: GeoIP2 Type Conflicts

The IP address data comes from @maxmind/geoip2-node and needs augmentation.

**Solution**: Cast the GeoInsights object and add minFraud-specific fields:
```typescript
const insights = new GeoInsights(response.ip_address) as records.IpAddress;
insights.risk = response.ip_address.risk;
```

## Code Style Requirements

- **TypeScript strict mode** - All files use strict type checking
- **ESLint** - Configured with TypeScript ESLint rules (see `eslint.config.mjs`)
- **Prettier** - Consistent formatting enforced
- **Readonly response fields** - Response model properties are `readonly`
- **Optional chaining** - Use `?.` for optional nested properties
- **TypeDoc comments** - Document public APIs with JSDoc-style comments

## Development Workflow

### Setup
```bash
npm install
```

### Before Committing
```bash
# Tidy code (auto-fix issues)
precious tidy -g

# Lint code (check for issues)
precious lint -g

# Run tests
npm test

# Build
npm run build
```

Note: Precious is already set up and handles code formatting and linting. Use `precious tidy -g` to automatically fix issues, and `precious lint -g` to check for remaining problems.

### Version Requirements
- **Node.js 18+** required (targets active LTS: 18, 20, 22)
- Uses Node.js built-in `fetch` (no external HTTP libraries)
- TypeScript 5.x

## Cross-Language Consistency

This library is part of MaxMind's multi-language client library ecosystem. When adding features:

- **Field names** should match other client libraries (PHP, Python, etc.) after camelCase conversion
- **Model structure** should parallel other implementations where possible
- **Error handling** patterns should be consistent
- **Documentation style** should follow established patterns

Refer to other minFraud client implementations for guidance on new features.

## Additional Resources

- [API Documentation](https://maxmind.github.io/minfraud-api-node/)
- [minFraud Web Services Docs](https://dev.maxmind.com/minfraud/)
- [minFraud API Documentation](https://dev.maxmind.com/minfraud/api-documentation/)
- GitHub Issues: https://github.com/maxmind/minfraud-api-node/issues
