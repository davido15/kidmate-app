import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AppText from './AppText';
import colors from '../config/colors';
import bugsnagLog from '../utility/bugsnag';

const PaymentWebView = ({ paymentUrl, onClose, onPaymentComplete }) => {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    
    // Check if we're on a success or error page
    const currentUrl = navState.url;
    bugsnagLog.log('WebView URL changed', { url: currentUrl });
    
    if (currentUrl.includes('paycallback.php') && currentUrl.includes('success')) {
      Alert.alert(
        'Payment Successful',
        'Your payment has been completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              onPaymentComplete && onPaymentComplete('success');
              onClose && onClose();
            }
          }
        ]
      );
    } else if (currentUrl.includes('paycallback.php') && (currentUrl.includes('failed') || currentUrl.includes('error'))) {
      Alert.alert(
        'Payment Failed',
        'There was an issue with your payment. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              onPaymentComplete && onPaymentComplete('failed');
              onClose && onClose();
            }
          }
        ]
      );
    } else if (currentUrl.includes('paycallback.php')) {
      // Payment callback received, check for success indicators
      if (currentUrl.includes('trxref=') || currentUrl.includes('reference=')) {
        Alert.alert(
          'Payment Processed',
          'Your payment has been processed. Please check the payment status.',
          [
            {
              text: 'OK',
              onPress: () => {
                onPaymentComplete && onPaymentComplete('processed');
                onClose && onClose();
              }
            }
          ]
        );
      }
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    bugsnagLog.error(new Error('WebView error'), { 
      nativeEvent,
      paymentUrl,
      operation: 'payment_webview'
    });
    Alert.alert(
      'Error',
      'Failed to load payment page. Please check your internet connection.',
      [
        {
          text: 'OK',
          onPress: () => onClose && onClose()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onClose && onClose()}
        >
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Payment</AppText>
        <View style={styles.headerRight}>
          {canGoBack && (
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
          {canGoForward && (
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.loadingText}>Loading payment page...</AppText>
          </View>
        )}
        
        <WebView
          source={{ uri: paymentUrl }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingTop: Constants.statusBarHeight + 10,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 5,
    marginLeft: 10,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: colors.medium,
  },
});

export default PaymentWebView; 