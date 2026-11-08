const axios = require('axios');

class PayPalClient {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  updateCredentials(clientId, clientSecret, isSandbox = true) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.isConfigured()) {
      return null;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('[PayPalClient] Failed to acquire OAuth token:', error.response?.data || error.message);
      throw new Error(`PayPal OAuth failure: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async verifyConnection() {
    if (!this.isConfigured()) {
      return {
        connected: false,
        mode: 'SIMULATION',
        message: 'No credentials configured. AegisPay is running in high-fidelity Sandbox Simulation mode.',
      };
    }

    try {
      const token = await this.getAccessToken();
      return {
        connected: Boolean(token),
        mode: 'LIVE_SANDBOX',
        message: 'Successfully authenticated with PayPal Sandbox REST APIs.',
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'ERROR',
        message: error.message,
      };
    }
  }

  async getDisputes(params = {}) {
    const token = await this.getAccessToken();
    if (!token) return null; // Fallback to simulated data

    try {
      const response = await axios.get(`${this.baseUrl}/v1/customer/disputes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params,
        timeout: 12000,
      });
      return response.data;
    } catch (error) {
      console.warn('[PayPalClient] getDisputes error, falling back to simulation:', error.response?.data || error.message);
      return null;
    }
  }

  async getDisputeDetails(disputeId) {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/v1/customer/disputes/${disputeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 12000,
      });
      return response.data;
    } catch (error) {
      console.warn(`[PayPalClient] getDisputeDetails error for ${disputeId}:`, error.message);
      return null;
    }
  }

  async provideEvidence(disputeId, evidencePayload) {
    const token = await this.getAccessToken();
    if (!token) {
      return {
        simulation: true,
        success: true,
        dispute_id: disputeId,
        acknowledgement_id: `ACK-SIM-${Date.now()}`,
        status: 'UNDER_REVIEW',
        message: 'Evidence successfully submitted to PayPal Disputes API (Simulation Verified).',
        payload_transmitted: evidencePayload,
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/customer/disputes/${disputeId}/provide-evidence`,
        evidencePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      return {
        simulation: false,
        success: true,
        dispute_id: disputeId,
        status: 'UNDER_REVIEW',
        paypal_response: response.data,
      };
    } catch (error) {
      console.error(`[PayPalClient] provideEvidence failed for ${disputeId}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'PayPal provideEvidence API failed');
    }
  }

  async acceptClaim(disputeId, note = 'Merchant accepted claim') {
    const token = await this.getAccessToken();
    if (!token) {
      return {
        simulation: true,
        success: true,
        dispute_id: disputeId,
        status: 'RESOLVED_ACCEPTED',
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/customer/disputes/${disputeId}/accept-claim`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      return {
        simulation: false,
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'PayPal acceptClaim API failed');
    }
  }
}

module.exports = new PayPalClient();
