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

/**
 * Load global state from JSON file
 */
const loadGlobalState = async () => {
  try {
    const response = await fetch('/globalState.json?t=' + Date.now()); // Cache busting
    if (response.ok) {
      const data = await response.json();
      const hasChanges = JSON.stringify(chatGlobals) !== JSON.stringify(data);
      chatGlobals = { ...chatGlobals, ...data };
      
      if (hasChanges) {
        console.log('Global state updated from JSON file:', data);
        // Trigger custom event for components to react to changes
        window.dispatchEvent(new CustomEvent('globalStateChanged', { detail: chatGlobals }));
      }
    }
  } catch (error) {
    console.log('Using default global state values');
  }
};

/**
 * Start polling for JSON file changes
 */
const startPolling = () => {
  // Poll every 2 seconds for changes
  setInterval(loadGlobalState, 2000);
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

/**
 * Save global state to JSON file (for external access)
 * Note: This creates a downloadable file for external services to access
 */
const saveGlobalState = () => {
  const dataStr = JSON.stringify(chatGlobals, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Create download link for external access
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'globalState.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
   * Load state from external JSON file
   */
  loadState: loadGlobalState,

  /**
   * Manually refresh state from JSON file
   */
  refreshFromJSON: () => {
    return loadGlobalState();
  },

  /**
   * Start/stop automatic polling
   */
  startPolling,
  stopPolling
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