/**
 * Global State Management for Chat Interface
 * 
 * Centralized variables for chat functionality:
 * - Person A and B input states
 * - Chat explanation/instructions text
 * - Shared state that can be accessed across components
 * 
 * Usage:
 * import { chatGlobals } from '@/lib/globalState';
 * chatGlobals.personOneInput = 'Hello world';
 * console.log(chatGlobals.chatExplanation);
 */

/**
 * Global chat state object
 * Contains reactive variables for chat interface
 */
export const chatGlobals = {
  /**
   * Current input text for Person A (left side of chat)
   */
  personOneInput: '',
  
  /**
   * Current input text for Person B (right side of chat)  
   */
  personTwoInput: '',
  
  /**
   * Explanation text displayed in the chat interface
   * Describes how the chat system works
   */
  chatExplanation: 'Switch between Person A and Person B to simulate a conversation. Messages are sent automatically with realistic typing delays and random responses.'
};

/**
 * Helper functions for managing global chat state
 */
export const chatActions = {
  /**
   * Update Person A's input text
   */
  setPersonOneInput: (input: string) => {
    chatGlobals.personOneInput = input;
  },
  
  /**
   * Update Person B's input text
   */
  setPersonTwoInput: (input: string) => {
    chatGlobals.personTwoInput = input;
  },
  
  /**
   * Update the chat explanation text
   */
  setChatExplanation: (explanation: string) => {
    chatGlobals.chatExplanation = explanation;
  },
  
  /**
   * Clear all inputs
   */
  clearAllInputs: () => {
    chatGlobals.personOneInput = '';
    chatGlobals.personTwoInput = '';
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
  }
};

/**
 * Type definitions for better TypeScript support
 */
export type ChatSender = 'left' | 'right';

export interface ChatGlobalsType {
  personOneInput: string;
  personTwoInput: string;
  chatExplanation: string;
}