# Bugsnag Migration Guide

This guide shows you how to replace console logs with Bugsnag error reporting in your KidMate mobile app.

## What's Already Done

✅ **Bugsnag is installed and configured** in `App.js`
✅ **Bugsnag utility created** at `app/utility/bugsnag.js`
✅ **Test screen created** at `app/screens/BugsnagTestScreen.js`

## How to Replace Console Logs

### 1. Import the Bugsnag utility

```javascript
import bugsnagLog from "../utility/bugsnag";
```

### 2. Replace different types of console logs

#### Replace `console.log()` with `bugsnagLog.log()`
```javascript
// Before
console.log("User logged in", { userId: 123 });

// After
bugsnagLog.log("User logged in", { userId: 123 });
```

#### Replace `console.error()` with `bugsnagLog.error()`
```javascript
// Before
console.error("API Error:", error);

// After
bugsnagLog.error(error, { 
  context: "API call",
  endpoint: "/login" 
});
```

#### Replace `console.warn()` with `bugsnagLog.warn()`
```javascript
// Before
console.warn("Payment pending");

// After
bugsnagLog.warn("Payment pending", { 
  paymentId: "pay_123",
  amount: 100 
});
```

### 3. Use specialized error reporting functions

#### API Errors
```javascript
// Before
console.error("API Error:", error);

// After
bugsnagLog.apiError("/payments", error, response);
```

#### Authentication Errors
```javascript
// Before
console.error("Login failed:", error);

// After
bugsnagLog.authError("login", error);
```

#### File/Image Errors
```javascript
// Before
console.log("Error reading image", error);

// After
bugsnagLog.fileError("reading_image", error, { 
  fileName: "profile.jpg" 
});
```

#### Location Errors
```javascript
// Before
console.log("Location error:", error);

// After
bugsnagLog.locationError("get_current_position", error);
```

#### Payment Errors
```javascript
// Before
console.error("Payment failed:", error);

// After
bugsnagLog.paymentError("process_payment", error, { 
  paymentId: "pay_123",
  amount: 100 
});
```

## Files Already Updated

The following files have been updated to use Bugsnag:

1. **`app/components/ImageInput.js`** - File/image error handling
2. **`app/screens/LoginScreen.js`** - Authentication logging
3. **`app/hooks/useLocation.js`** - Location error handling
4. **`app/utility/cache.js`** - Cache operation errors
5. **`app/screens/PaymentScreen.js`** - Payment error handling

## Testing Bugsnag

Use the `BugsnagTestScreen` to test different types of error reporting:

1. Navigate to the test screen
2. Press different test buttons
3. Check your Bugsnag dashboard for the reported errors

## Benefits of Using Bugsnag

### Instead of Console Logs:
- ❌ Only visible in development
- ❌ No error grouping
- ❌ No user context
- ❌ No stack traces
- ❌ No performance impact tracking

### With Bugsnag:
- ✅ Errors visible in production
- ✅ Automatic error grouping
- ✅ User context and metadata
- ✅ Full stack traces
- ✅ Performance monitoring
- ✅ Release tracking
- ✅ Error trends and analytics

## Best Practices

### 1. Don't log sensitive information
```javascript
// ❌ Bad
bugsnagLog.log("User login", { 
  email: "user@example.com",
  password: "secret123" 
});

// ✅ Good
bugsnagLog.log("User login", { 
  email: "user@example.com".substring(0, 3) + "***",
  userId: 123 
});
```

### 2. Provide meaningful context
```javascript
// ❌ Bad
bugsnagLog.error(error);

// ✅ Good
bugsnagLog.error(error, {
  screen: "PaymentScreen",
  action: "process_payment",
  paymentId: "pay_123",
  userId: 456
});
```

### 3. Use appropriate error types
```javascript
// For API errors
bugsnagLog.apiError("/payments", error, response);

// For authentication errors
bugsnagLog.authError("login", error);

// For file operations
bugsnagLog.fileError("upload_image", error, fileInfo);

// For location services
bugsnagLog.locationError("get_current_position", error);

// For payment processing
bugsnagLog.paymentError("process_payment", error, paymentInfo);
```

### 4. Add breadcrumbs for debugging
```javascript
// Add breadcrumbs to track user flow
bugsnagLog.log("User started payment process");
bugsnagLog.log("Payment amount entered", { amount: 100 });
bugsnagLog.log("Payment method selected", { method: "card" });
```

## Quick Test

To test if Bugsnag is working, you can call:

```javascript
import { testBugsnag } from "../utility/bugsnag";

// This will send a test error to Bugsnag
testBugsnag();
```

## Next Steps

1. **Continue replacing console logs** in remaining files
2. **Add error boundaries** to catch React errors
3. **Set up release tracking** in your CI/CD pipeline
4. **Configure error filtering** in Bugsnag dashboard
5. **Set up alerts** for critical errors

## Files Still Need Updates

These files still have console logs that should be replaced:

- `app/screens/ListingScreen.js`
- `app/screens/GradesListScreen.js`
- `app/screens/ComplaintsListScreen.js`
- `app/screens/PickupHistoryScreen.js`
- `app/components/PaymentWebView.js`
- `app/components/GooglePlacesInput.js`
- `app/components/GooglePlacesTest.js`
- `app/api/listings.js`

Would you like me to continue updating these files? 