/**
 * API Service - Flask Backend Integration
 * 
 * Centralized service for interacting with Flask API backend.
 * Handles data fetching, saving, and connection testing.
 */

// Base Flask API URL configuration
let FLASK_API_URL = 'http://localhost:5000';

/**
 * Type definitions for API responses and data structures
 */
export interface GlobalVariables {
  personOneInput: string;
  personTwoInput: string;
  truthVerification: boolean | null;
  chatExplanation: string;
}

export interface FlaskAPIResponse {
  success: boolean;
  data?: GlobalVariables;
  message?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  error?: string;
  latency?: number;
}

/**
 * Set the Flask API base URL
 */
export const setFlaskURL = (url: string) => {
  FLASK_API_URL = url.replace(/\/$/, ''); // Remove trailing slash
};

/**
 * Get current Flask API URL
 */
export const getFlaskURL = () => FLASK_API_URL;

/**
 * Fetch global variables from Flask API
 */
export const fetchGlobalVariables = async (): Promise<GlobalVariables | null> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/globals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch global variables:', response.status, response.statusText);
      return null;
    }

    const data: GlobalVariables = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching global variables:', error);
    return null;
  }
};

/**
 * Save global variables to Flask API
 */
export const saveGlobalVariables = async (variables: GlobalVariables): Promise<boolean> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/globals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      console.error('Failed to save global variables:', response.status, response.statusText);
      return false;
    }

    await response.json();
    return true;
  } catch (error) {
    console.error('Error saving global variables:', error);
    return false;
  }
};

/**
 * Fetch AI verification status from Flask API
 */
export const fetchAiVerificationStatus = async (): Promise<{ verified: boolean; status: string } | null> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/ai-verification`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch AI verification status:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching AI verification status:', error);
    return null;
  }
};

/**
 * Send last user message to Flask for CAP CHECK processing
 */
export const sendLastMessageToFlask = async (message: string, sender: 'left' | 'right'): Promise<boolean> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/cap-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sender }),
    });

    if (!response.ok) {
      console.error('Failed to send message for CAP CHECK:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('Error sending message for CAP CHECK:', error);
    return false;
  }
};

/**
 * Test connection to Flask backend
 */
export const testFlaskConnection = async (): Promise<ConnectionStatus> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${FLASK_API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        connected: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        latency,
      };
    }

    const data = await response.json();
    
    return {
      connected: data.status === 'ok' || data.success === true,
      latency,
      error: data.status === 'ok' ? undefined : data.message || 'Health check failed',
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown connection error',
      latency: Date.now() - startTime,
    };
  }
};

/**
 * Data export utilities for development and debugging
 */

/**
 * Export global variables data to JSON file
 */
export const exportToJSON = (data: GlobalVariables, filename: string = 'global_variables.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export global variables data to plain text file
 */
export const exportToText = (data: GlobalVariables, filename: string = 'global_variables.txt') => {
  const textContent = `Global Variables Export
Generated: ${new Date().toISOString()}

Person One Input: ${data.personOneInput}
Person Two Input: ${data.personTwoInput}
Truth Verification: ${data.truthVerification}
Chat Explanation: ${data.chatExplanation}
`;

  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Polling manager for automatic updates from Flask API
 */
class PollingManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;

  /**
   * Start polling Flask API for changes
   */
  start(callback: (data: GlobalVariables | null) => void, interval: number = 2000) {
    if (this.isPolling) {
      console.warn('Polling is already active');
      return;
    }

    this.isPolling = true;
    this.intervalId = setInterval(async () => {
      const data = await fetchGlobalVariables();
      callback(data);
    }, interval);

    console.log(`Started polling Flask API every ${interval}ms`);
  }

  /**
   * Stop polling
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    console.log('Stopped polling Flask API');
  }

  /**
   * Check if polling is currently active
   */
  get isActive() {
    return this.isPolling;
  }
}

// Export singleton polling manager
export const pollingManager = new PollingManager();