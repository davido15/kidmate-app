import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AppButton from '../components/AppButton';
import AppText from '../components/AppText';
import Screen from '../components/Screen';
import bugsnagLog, { testBugsnag } from '../utility/bugsnag';

const BugsnagTestScreen = () => {
  const testErrorReporting = () => {
    try {
      // Simulate an error
      throw new Error('This is a test error from KidMate app');
    } catch (error) {
      bugsnagLog.error(error, { 
        screen: 'BugsnagTestScreen',
        action: 'test_error_reporting'
      });
      Alert.alert('Test Error', 'Error has been reported to Bugsnag');
    }
  };

  const testApiError = () => {
    bugsnagLog.apiError('/test-endpoint', new Error('API connection failed'), {
      status: 500,
      data: { message: 'Internal server error' }
    });
    Alert.alert('API Error Test', 'API error has been reported to Bugsnag');
  };

  const testAuthError = () => {
    bugsnagLog.authError('login', new Error('Invalid credentials'));
    Alert.alert('Auth Error Test', 'Authentication error has been reported to Bugsnag');
  };

  const testFileError = () => {
    bugsnagLog.fileError('upload_image', new Error('File upload failed'), {
      fileName: 'test.jpg',
      fileSize: '2MB'
    });
    Alert.alert('File Error Test', 'File error has been reported to Bugsnag');
  };

  const testLocationError = () => {
    bugsnagLog.locationError('get_current_position', new Error('Location permission denied'));
    Alert.alert('Location Error Test', 'Location error has been reported to Bugsnag');
  };

  const testPaymentError = () => {
    bugsnagLog.paymentError('process_payment', new Error('Payment gateway error'), {
      paymentId: 'test_payment_123',
      amount: 100
    });
    Alert.alert('Payment Error Test', 'Payment error has been reported to Bugsnag');
  };

  const testLogging = () => {
    bugsnagLog.log('User performed test action', { 
      action: 'test_logging',
      timestamp: new Date().toISOString()
    });
    bugsnagLog.info('This is an info message', { 
      category: 'test',
      priority: 'low'
    });
    bugsnagLog.warn('This is a warning message', { 
      category: 'test',
      priority: 'medium'
    });
    Alert.alert('Logging Test', 'Log messages have been sent to Bugsnag');
  };

  const runFullTest = () => {
    testBugsnag();
    Alert.alert('Full Test', 'Complete Bugsnag test has been executed');
  };

  return (
    <Screen style={styles.container}>
      <AppText style={styles.title}>🐛 Bugsnag Test Screen</AppText>
      <AppText style={styles.subtitle}>
        Test different types of error reporting and logging
      </AppText>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Test Error Reporting"
          onPress={testErrorReporting}
          color="primary"
          style={styles.button}
        />

        <AppButton
          title="Test API Error"
          onPress={testApiError}
          color="secondary"
          style={styles.button}
        />

        <AppButton
          title="Test Auth Error"
          onPress={testAuthError}
          color="warning"
          style={styles.button}
        />

        <AppButton
          title="Test File Error"
          onPress={testFileError}
          color="danger"
          style={styles.button}
        />

        <AppButton
          title="Test Location Error"
          onPress={testLocationError}
          color="info"
          style={styles.button}
        />

        <AppButton
          title="Test Payment Error"
          onPress={testPaymentError}
          color="success"
          style={styles.button}
        />

        <AppButton
          title="Test Logging"
          onPress={testLogging}
          color="primary"
          style={styles.button}
        />

        <AppButton
          title="Run Full Test"
          onPress={runFullTest}
          color="warning"
          style={styles.button}
        />
      </View>

      <View style={styles.infoContainer}>
        <AppText style={styles.infoTitle}>What gets reported:</AppText>
        <AppText style={styles.infoText}>
          • Errors with full stack traces{'\n'}
          • Context information (screen, action, etc.){'\n'}
          • API responses and status codes{'\n'}
          • User actions and navigation{'\n'}
          • File operations and uploads{'\n'}
          • Location services errors{'\n'}
          • Payment processing issues
        </AppText>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2F3B52',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    marginBottom: 10,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2F3B52',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default BugsnagTestScreen; 