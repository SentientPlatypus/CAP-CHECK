/**
 * Global State Management for Chat Interface
 * 
 * Centralized variables for chat functionality:
 * - Person A and B input states
 * - Chat explanation/instructions text
 * - Truth verification for fact-checking statements
 * - Shared state that can be accessed across components
 * 
 * Usage:
 * import { chatGlobals } from '@/lib/globalState';
 * chatGlobals.personOneInput = 'Hello world';
 * chatGlobals.truthVerification = true;
 * console.log(chatGlobals.chatExplanation);
 */

/**
 * Global chat state object
 * Contains reactive variables for chat interface
 */
let chatGlobals = {
  /**
   * Current input text for Person A (left side of chat)
   */
  personOneInput: '',
  
  /**
   * Current input text for Person B (right side of chat)  
   */
  personTwoInput: '',
  
  /**
   * Truth verification status for fact-checking
   * true = statement is factual, false = statement is false/misleading, null = no verification
   */
  truthVerification: null as boolean | null,
  
  /**
   * Explanation text displayed in the chat interface
   * Describes how the chat system works
   */
  chatExplanation: 'This AI-powered fact-checking system analyzes statements in real-time. Switch between Person A and Person B to simulate conversations while the system verifies the truthfulness of each statement.'
};

// Flask API base URL - update this to your Flask server URL
const FLASK_API_URL = 'http://localhost:5000/api';

/**
 * Load global state from Flask API
 */
const loadGlobalState = async () => {
  try {
    const response = await fetch(`${FLASK_API_URL}/variables`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasChanges = JSON.stringify(chatGlobals) !== JSON.stringify(data);
      
      // Update local state with Flask data
      chatGlobals.personOneInput = data.person_one_input || data.personOneInput || '';
      chatGlobals.personTwoInput = data.person_two_input || data.personTwoInput || '';
      chatGlobals.truthVerification = data.truth_verification !== undefined ? data.truth_verification : data.truthVerification;
      chatGlobals.chatExplanation = data.chat_explanation || data.chatExplanation || chatGlobals.chatExplanation;
      
      if (hasChanges) {
        console.log('Global state updated from Flask API:', data);
        // Trigger custom event for components to react to changes
        window.dispatchEvent(new CustomEvent('globalStateChanged', { detail: chatGlobals }));
      }
    }
  } catch (error) {
    console.log('Flask API not available, using local state:', error);
  }
};

/**
 * Save global state to Flask API
 */
const saveGlobalState = async () => {
  try {
    const response = await fetch(`${FLASK_API_URL}/variables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        person_one_input: chatGlobals.personOneInput,
        person_two_input: chatGlobals.personTwoInput,
        truth_verification: chatGlobals.truthVerification,
        chat_explanation: chatGlobals.chatExplanation
      }),
    });
    
    if (response.ok) {
      console.log('Global state saved to Flask API');
    }
  } catch (error) {
    console.log('Failed to save to Flask API:', error);
  }
};

/**
 * Start polling Flask API for changes
 */
const startPolling = () => {
  // Poll every 3 seconds for changes from Flask
  setInterval(loadGlobalState, 3000);
};

/**
 * Stop polling (if needed)
 */
let pollingInterval: NodeJS.Timeout | null = null;
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};


// Initialize state on module load
loadGlobalState().then(() => {
  // Start polling for changes after initial load
  startPolling();
});

export { chatGlobals };

/**
 * Helper functions for managing global chat state
 */
export const chatActions = {
  /**
   * Update Person A's input text
   */
  setPersonOneInput: (input: string) => {
    chatGlobals.personOneInput = input;
    saveGlobalState();
  },
  
  /**
   * Update Person B's input text
   */
  setPersonTwoInput: (input: string) => {
    chatGlobals.personTwoInput = input;
    saveGlobalState();
  },
  
  /**
   * Set truth verification status
   */
  setTruthVerification: (isTrue: boolean | null) => {
    chatGlobals.truthVerification = isTrue;
    saveGlobalState();
  },
  
  /**
   * Update the chat explanation text
   */
  setChatExplanation: (explanation: string) => {
    chatGlobals.chatExplanation = explanation;
    saveGlobalState();
  },
  
  /**
   * Clear all inputs and reset truth verification
   */
  clearAllInputs: () => {
    chatGlobals.personOneInput = '';
    chatGlobals.personTwoInput = '';
    chatGlobals.truthVerification = null;
  },
  
  /**
   * Get current input for active person
   */
  getCurrentInput: (currentSender: 'left' | 'right') => {
    return currentSender === 'left' ? chatGlobals.personOneInput : chatGlobals.personTwoInput;
  },
  
  /**
   * Set current input for active person
   */
  setCurrentInput: (currentSender: 'left' | 'right', input: string) => {
    if (currentSender === 'left') {
      chatGlobals.personOneInput = input;
    } else {
      chatGlobals.personTwoInput = input;
    }
    saveGlobalState();
  },

  /**
   * Export current state as JSON (for external services)
   */
  exportState: () => {
    saveGlobalState();
    return chatGlobals;
  },

  /**
   * Load state from Flask API
   */
  loadState: loadGlobalState,

  /**
   * Manually refresh state from Flask API
   */
  refreshFromFlask: () => {
    return loadGlobalState();
  },

  /**
   * Save current state to Flask API
   */
  saveToFlask: () => {
    return saveGlobalState();
  },

  /**
   * Start/stop automatic polling
   */
  startPolling,
  stopPolling,

  /**
   * Update Flask API URL
   */
  setFlaskURL: (url: string) => {
    // This would update the FLASK_API_URL - you can modify as needed
    console.log('Flask API URL updated to:', url);
  }
};

/**
 * Type definitions for better TypeScript support
 */
export type ChatSender = 'left' | 'right';

export interface ChatGlobalsType {
  personOneInput: string;
  personTwoInput: string;
  truthVerification: boolean | null;
  chatExplanation: string;
}

/**
 * Truth verification utilities
 */
export const truthUtils = {
  /**
   * Get verification badge text based on truth status
   */
  getVerificationText: (isTrue: boolean | null) => {
    if (isTrue === true) return 'VERIFIED TRUE';
    if (isTrue === false) return 'FLAGGED FALSE';
    return 'ANALYZING...';
  },
  
  /**
   * Get verification badge color classes based on truth status
   */
  getVerificationColor: (isTrue: boolean | null) => {
    if (isTrue === true) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (isTrue === false) return 'bg-red-500/20 text-red-400 border-red-500/50';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  }
};