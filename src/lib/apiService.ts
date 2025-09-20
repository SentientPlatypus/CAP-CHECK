/**
 * Centralized API Service
 * Handles all fetching operations for the application
 */

// Types
export interface GlobalVariables {
  personOneInput: string;
  personTwoInput: string;
  truthVerification: boolean | null;
  chatExplanation: string;
}

export interface FlaskAPIResponse {
  person_one_input?: string;
  person_two_input?: string;
  truth_verification?: boolean | null;
  chat_explanation?: string;
  personOneInput?: string;
  personTwoInput?: string;
  truthVerification?: boolean | null;
  chatExplanation?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  status?: number;
  error?: string;
  url: string;
}

// Configuration
const DEFAULT_FLASK_URL = 'http://localhost:5000/api';
let FLASK_API_URL = DEFAULT_FLASK_URL;

/**
 * Update Flask API URL
 */
export const setFlaskURL = (url: string) => {
  FLASK_API_URL = url;
  console.log('Flask API URL updated to:', url);
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
    const response = await fetch(`${FLASK_API_URL}/variables`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FlaskAPIResponse = await response.json();
    
    // Normalize the response to match our internal format
    return {
      personOneInput: data.person_one_input || data.personOneInput || '',
      personTwoInput: data.person_two_input || data.personTwoInput || '',
      truthVerification: data.truth_verification !== undefined ? data.truth_verification : data.truthVerification,
      chatExplanation: data.chat_explanation || data.chatExplanation || 'This AI-powered fact-checking system analyzes statements in real-time.'
    };
  } catch (error) {
    console.log('Flask API not available:', error);
    return null;
  }
};

/**
 * Save global variables to Flask API
 */
export const saveGlobalVariables = async (variables: GlobalVariables): Promise<boolean> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/variables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        person_one_input: variables.personOneInput,
        person_two_input: variables.personTwoInput,
        truth_verification: variables.truthVerification,
        chat_explanation: variables.chatExplanation
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Global variables saved to Flask API');
    return true;
  } catch (error) {
    console.log('Failed to save to Flask API:', error);
    return false;
  }
};

/**
 * Update a single variable in Flask API
 */
export const updateSingleVariable = async (variableName: string, value: any): Promise<boolean> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/variables/${variableName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Variable ${variableName} updated in Flask API`);
    return true;
  } catch (error) {
    console.error(`Failed to update ${variableName} in Flask:`, error);
    return false;
  }
};

/**
 * Test Flask API connection
 */
export const testFlaskConnection = async (): Promise<ConnectionStatus> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      connected: response.ok,
      status: response.status,
      url: FLASK_API_URL
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      url: FLASK_API_URL
    };
  }
};

/**
 * Get SQLite database status from Flask
 */
export const getDatabaseStatus = async () => {
  try {
    const response = await fetch(`${FLASK_API_URL}/database/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get database status:', error);
    throw error;
  }
};

/**
 * Polling manager for automatic data fetching
 */
export class PollingManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;

  /**
   * Start polling Flask API for changes
   */
  start(callback: (data: GlobalVariables | null) => void, interval: number = 3000) {
    if (this.isPolling) {
      console.log('Polling already started');
      return;
    }

    this.isPolling = true;
    console.log(`Starting Flask API polling every ${interval}ms`);
    
    this.intervalId = setInterval(async () => {
      const data = await fetchGlobalVariables();
      callback(data);
    }, interval);
  }

  /**
   * Stop polling
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isPolling = false;
      console.log('Flask API polling stopped');
    }
  }

  /**
   * Check if currently polling
   */
  get isActive() {
    return this.isPolling;
  }
}

/**
 * Export utilities for data export functionality
 */
export const exportToJSON = (data: GlobalVariables, filename?: string) => {
  const timestamp = new Date().toISOString();
  const exportData = {
    timestamp,
    variables: data
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `globalVariables_${timestamp.replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToText = (data: GlobalVariables, filename?: string) => {
  const timestamp = new Date().toISOString();
  const textContent = `Global Variables Export
Generated: ${timestamp}

Person One Input: ${data.personOneInput || '(empty)'}
Person Two Input: ${data.personTwoInput || '(empty)'}
Truth Verification: ${data.truthVerification === null ? 'null' : data.truthVerification}
Chat Explanation: ${data.chatExplanation}

---
For Flask/SQLite Integration:
- personOneInput: "${data.personOneInput}"
- personTwoInput: "${data.personTwoInput}"
- truthVerification: ${data.truthVerification}
- chatExplanation: "${data.chatExplanation}"
`;

  const textBlob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(textBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `globalVariables_${timestamp.replace(/[:.]/g, '-')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Create and export a singleton polling manager
export const pollingManager = new PollingManager();