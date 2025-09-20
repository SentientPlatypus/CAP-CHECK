/**
 * Flask API Integration
 * Direct communication with Flask backend endpoints
 */

// Default Flask API URL - update this to match your Flask server
export const DEFAULT_FLASK_URL = 'http://localhost:5000/api';

/**
 * Flask API Client Class
 */
export class FlaskAPIClient {
  private baseURL: string;

  constructor(baseURL: string = DEFAULT_FLASK_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Update the base URL for Flask API
   */
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  /**
   * Get all global variables from Flask
   */
  async getVariables() {
    try {
      const response = await fetch(`${this.baseURL}/variables`, {
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
      console.error('Failed to get variables from Flask:', error);
      throw error;
    }
  }

  /**
   * Update all global variables in Flask
   */
  async updateVariables(variables: {
    person_one_input?: string;
    person_two_input?: string;
    truth_verification?: boolean | null;
    chat_explanation?: string;
  }) {
    try {
      const response = await fetch(`${this.baseURL}/variables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update variables in Flask:', error);
      throw error;
    }
  }

  /**
   * Update a specific variable in Flask
   */
  async updateSingleVariable(variableName: string, value: any) {
    try {
      const response = await fetch(`${this.baseURL}/variables/${variableName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to update ${variableName} in Flask:`, error);
      throw error;
    }
  }

  /**
   * Test Flask API connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        connected: response.ok,
        status: response.status,
        url: this.baseURL
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        url: this.baseURL
      };
    }
  }

  /**
   * Get SQLite database status from Flask
   */
  async getDatabaseStatus() {
    try {
      const response = await fetch(`${this.baseURL}/database/status`, {
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
  }
}

// Export a default instance
export const flaskAPI = new FlaskAPIClient();