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

import { 
  fetchGlobalVariables, 
  saveGlobalVariables, 
  sendLastMessageToFlask,
  fetchAiVerificationStatus,
  pollingManager,
  type GlobalVariables 
} from './apiService';

/**
 * Global chat state object
 * Contains reactive variables for chat interface
 */
let chatGlobals: GlobalVariables = {
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
 * Track the last user message for CAP CHECK functionality
 */
let lastUserMessage: { text: string; sender: 'left' | 'right' } | null = null;

/**
 * Load global state from Flask API
 */
const loadGlobalState = async () => {
  const data = await fetchGlobalVariables();
  if (data) {
    const hasChanges = JSON.stringify(chatGlobals) !== JSON.stringify(data);
    chatGlobals = { ...data };
    
    if (hasChanges) {
      console.log('Global state updated from Flask API:', data);
      // Trigger custom event for components to react to changes
      window.dispatchEvent(new CustomEvent('globalStateChanged', { detail: chatGlobals }));
    }
  }
};

/**
 * Save global state to Flask API
 */
const saveGlobalState = async () => {
  await saveGlobalVariables(chatGlobals);
};

/**
 * Start polling Flask API for changes
 */
const startPolling = () => {
  pollingManager.start((data) => {
    if (data) {
      const hasChanges = JSON.stringify(chatGlobals) !== JSON.stringify(data);
      chatGlobals = { ...data };
      
      if (hasChanges) {
        console.log('Global state updated from Flask API:', data);
        window.dispatchEvent(new CustomEvent('globalStateChanged', { detail: chatGlobals }));
      }
    }
  });
};

/**
 * Stop polling
 */
const stopPolling = () => {
  pollingManager.stop();
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
    // Track as last user message if it's not empty
    if (input.trim()) {
      lastUserMessage = { text: input.trim(), sender: 'left' };
    }
    saveGlobalState();
  },
  
  /**
   * Update Person B's input text
   */
  setPersonTwoInput: (input: string) => {
    chatGlobals.personTwoInput = input;
    // Track as last user message if it's not empty
    if (input.trim()) {
      lastUserMessage = { text: input.trim(), sender: 'right' };
    }
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
    saveGlobalState();
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
   * Get the last user message for CAP CHECK
   */
  getLastUserMessage: () => lastUserMessage,

  /**
   * Send last user message to Flask backend for processing
   */
  sendLastMessageToBackend: async () => {
    if (lastUserMessage) {
      return await sendLastMessageToFlask(lastUserMessage.text, lastUserMessage.sender);
    }
    return false;
  },

  /**
   * Set last user message manually (for tracking manual messages)
   */
  setLastUserMessage: (text: string, sender: 'left' | 'right') => {
    if (text.trim()) {
      lastUserMessage = { text: text.trim(), sender };
    }
  },

  /**
   * Fetch AI verification status from backend
   */
  fetchAiVerificationStatus: async () => {
    return await fetchAiVerificationStatus();
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