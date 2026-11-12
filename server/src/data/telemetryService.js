/**
 * Telemetry and forensic store session intelligence.
 * Contains browser fingerprinting, network telemetry, 3DS authentication tokens,
 * and user checkout verification records.
 */

const telemetryDatabase = {
  'ORD-94821': {
    order_id: 'ORD-94821',
    checkout_ip: '70.112.44.89',
    ip_geolocation: {
      city: 'Austin',
      region: 'Texas',
      country: 'US',
      isp: 'AT&T Internet Services',
      is_vpn: false,
      is_tor: false,
      is_datacenter: false,
      distance_to_shipping_km: 4.2, // Extremely close to shipping address!
    },
    device_fingerprint: {
      hardware_hash: 'fp_a9821f00b392a10',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      screen_resolution: '2560x1440',
      timezone: 'America/Chicago',
      browser_language: 'en-US',
      cookie_enabled: true,
      webgl_vendor: 'Apple Inc.',
      prior_sessions_count: 14,
    },
    authentication_record: {
      auth_type: 'PAYPAL_ONE_TOUCH_BIOMETRIC',
      mfa_verified: true,
      timestamp: '2026-10-31T18:22:10Z',
      terms_and_conditions_agreed: true,
      terms_version: 'v2026.4',
      checkout_duration_seconds: 42,
    },
    account_trust_score: 94, // High trust customer usually
    anomaly_detected: false,
  },

  'ORD-38192': {
    order_id: 'ORD-38192',
    checkout_ip: '198.54.133.9',
    ip_geolocation: {
      city: 'Seattle',
      region: 'Washington',
      country: 'US',
      isp: 'CenturyLink',
      is_vpn: false,
      is_tor: false,
      is_datacenter: false,
      distance_to_shipping_km: 1.1,
    },
    device_fingerprint: {
      hardware_hash: 'fp_88e3c19b441aa2',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15',
      screen_resolution: '393x852',
      timezone: 'America/Los_Angeles',
      browser_language: 'en-US',
      prior_sessions_count: 8,
    },
    authentication_record: {
      auth_type: 'PAYPAL_2FA_SMS',
      mfa_verified: true,
      timestamp: '2026-10-26T20:14:02Z',
      terms_and_conditions_agreed: true,
      terms_version: 'v2026.4',
      checkout_duration_seconds: 78,
    },
    account_trust_score: 88,
    anomaly_detected: false,
  },

  'ORD-19044': {
    order_id: 'ORD-19044',
    checkout_ip: '24.15.89.201',
    ip_geolocation: {
      city: 'Chicago',
      region: 'Illinois',
      country: 'US',
      isp: 'Comcast Cable',
      is_vpn: false,
      is_tor: false,
      distance_to_shipping_km: 2.8,
    },
    device_fingerprint: {
      hardware_hash: 'fp_7718aa0021cbb9',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0',
      screen_resolution: '1920x1080',
      timezone: 'America/Chicago',
      prior_sessions_count: 2,
    },
    authentication_record: {
      auth_type: 'PAYPAL_PASSWORD',
      mfa_verified: true,
      timestamp: '2026-10-28T16:04:19Z',
      terms_and_conditions_agreed: true,
      terms_version: 'v2026.4',
      checkout_duration_seconds: 110,
    },
    account_trust_score: 72,
    anomaly_detected: false,
  },

  'ORD-88210': {
    order_id: 'ORD-88210',
    checkout_ip: '185.220.101.5',
    ip_geolocation: {
      city: 'Frankfurt',
      region: 'Hesse',
      country: 'DE', // High discrepancy: IP in Germany, shipping to Delaware re-shipper!
      isp: 'M247 Ltd Hosting',
      is_vpn: true,
      is_tor: true,
      is_datacenter: true,
      distance_to_shipping_km: 6420.0,
    },
    device_fingerprint: {
      hardware_hash: 'fp_ring_9000x_delaware',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; HeadlessChrome)',
      screen_resolution: '800x600',
      timezone: 'UTC',
      prior_sessions_count: 1,
    },
    authentication_record: {
      auth_type: 'GUEST_CHECKOUT',
      mfa_verified: false,
      timestamp: '2026-10-23T03:11:50Z',
      terms_and_conditions_agreed: true,
      terms_version: 'v2026.4',
      checkout_duration_seconds: 4, // 4-second bot checkout!
    },
    account_trust_score: 8,
    anomaly_detected: true,
  },
};

function getOrderTelemetry(orderId) {
  return telemetryDatabase[orderId] || {
    order_id: orderId,
    checkout_ip: '172.56.21.90',
    ip_geolocation: {
      city: 'Dallas',
      region: 'Texas',
      country: 'US',
      isp: 'T-Mobile USA',
      is_vpn: false,
      is_tor: false,
      is_datacenter: false,
      distance_to_shipping_km: 5.5,
    },
    device_fingerprint: {
      hardware_hash: `fp_gen_${orderId}`,
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)',
      prior_sessions_count: 3,
    },
    authentication_record: {
      auth_type: 'PAYPAL_CHECKOUT_VERIFIED',
      mfa_verified: true,
      timestamp: new Date().toISOString(),
      terms_and_conditions_agreed: true,
      checkout_duration_seconds: 55,
    },
    account_trust_score: 85,
    anomaly_detected: false,
  };
}

module.exports = { getOrderTelemetry, telemetryDatabase };
