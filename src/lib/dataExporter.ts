/**
 * Data Exporter for Global Variables
 * Provides easy access to all global variables for external services
 */

import { chatGlobals } from './globalState';

/**
 * Export all global variables to a downloadable JSON file
 */
export const exportGlobalVariables = () => {
  const timestamp = new Date().toISOString();
  const data = {
    timestamp,
    variables: {
      personOneInput: chatGlobals.personOneInput,
      personTwoInput: chatGlobals.personTwoInput,
      truthVerification: chatGlobals.truthVerification,
      chatExplanation: chatGlobals.chatExplanation
    }
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `globalVariables_${timestamp.replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get current state as a simple object for API calls
 */
export const getCurrentVariables = () => {
  return {
    personOneInput: chatGlobals.personOneInput,
    personTwoInput: chatGlobals.personTwoInput,
    truthVerification: chatGlobals.truthVerification,
    chatExplanation: chatGlobals.chatExplanation,
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Create a text file with all variables for easy reading
 */
export const exportAsTextFile = () => {
  const timestamp = new Date().toISOString();
  const textContent = `Global Variables Export
Generated: ${timestamp}

Person One Input: ${chatGlobals.personOneInput || '(empty)'}
Person Two Input: ${chatGlobals.personTwoInput || '(empty)'}
Truth Verification: ${chatGlobals.truthVerification === null ? 'null' : chatGlobals.truthVerification}
Chat Explanation: ${chatGlobals.chatExplanation}

---
For Flask/SQLite Integration:
- personOneInput: "${chatGlobals.personOneInput}"
- personTwoInput: "${chatGlobals.personTwoInput}"
- truthVerification: ${chatGlobals.truthVerification}
- chatExplanation: "${chatGlobals.chatExplanation}"
`;

  const textBlob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(textBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `globalVariables_${timestamp.replace(/[:.]/g, '-')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * API endpoint simulation - returns variables in Flask-friendly format
 */
export const getVariablesForFlask = () => {
  return {
    status: 'success',
    data: {
      person_one_input: chatGlobals.personOneInput,
      person_two_input: chatGlobals.personTwoInput,
      truth_verification: chatGlobals.truthVerification,
      chat_explanation: chatGlobals.chatExplanation
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Auto-export variables when they change (for continuous monitoring)
 */
export const enableAutoExport = () => {
  let lastState = JSON.stringify(getCurrentVariables());
  
  const checkForChanges = () => {
    const currentState = JSON.stringify(getCurrentVariables());
    if (currentState !== lastState) {
      console.log('Variables changed, auto-exporting...');
      exportGlobalVariables();
      lastState = currentState;
    }
  };

  // Check every 5 seconds for changes
  return setInterval(checkForChanges, 5000);
};