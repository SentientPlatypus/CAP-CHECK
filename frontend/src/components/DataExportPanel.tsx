/**
 * Data Export Panel Component
 * Provides UI controls for exporting global variables
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { chatActions, chatGlobals } from '@/lib/globalState';
import { 
  testFlaskConnection, 
  exportToJSON, 
  exportToText
} from '@/lib/apiService';

export const DataExportPanel = () => {
  const { toast } = useToast();

  const handleExportJSON = () => {
    exportToJSON(chatGlobals);
    toast({
      title: "JSON Exported",
      description: "Global variables exported as JSON file",
    });
  };

  const handleExportText = () => {
    exportToText(chatGlobals);
    toast({
      title: "Text File Exported", 
      description: "Global variables exported as text file",
    });
  };

  const handleViewFlaskFormat = () => {
    const flaskData = {
      status: 'success',
      data: {
        person_one_input: chatGlobals.personOneInput,
        person_two_input: chatGlobals.personTwoInput,
        truth_verification: chatGlobals.truthVerification,
        chat_explanation: chatGlobals.chatExplanation
      },
      timestamp: new Date().toISOString()
    };
    console.log('Flask Format:', flaskData);
    toast({
      title: "Flask Format Logged",
      description: "Check console for Flask-compatible format",
    });
  };

  const handleRefreshFromFlask = async () => {
    try {
      await chatActions.refreshFromFlask();
      toast({
        title: "State Refreshed",
        description: "Reloaded variables from Flask API",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Flask API",
        variant: "destructive",
      });
    }
  };

  const handleTestFlaskConnection = async () => {
    try {
      const status = await testFlaskConnection();
      toast({
        title: status.connected ? "Connection Successful" : "Connection Failed",
        description: status.connected ? "Flask API is responding" : `Error: ${status.error}`,
        variant: status.connected ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to test Flask API connection",
        variant: "destructive",
      });
    }
  };

  const currentVars = chatGlobals;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Global Variables Export
        </CardTitle>
        <CardDescription>
          Export and manage global variables for Flask/SQLite integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Values Display */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Current Values:</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Person One:</strong> {currentVars.personOneInput || '(empty)'}</div>
            <div><strong>Person Two:</strong> {currentVars.personTwoInput || '(empty)'}</div>
            <div><strong>Truth Status:</strong> {currentVars.truthVerification === null ? 'null' : String(currentVars.truthVerification)}</div>
            <div><strong>Explanation:</strong> {currentVars.chatExplanation.substring(0, 60)}...</div>
          </div>
        </div>

        {/* Flask API Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleTestFlaskConnection} variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Test Flask API
          </Button>
          
          <Button onClick={handleRefreshFromFlask} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh from Flask
          </Button>
          
          <Button onClick={handleExportJSON} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          
          <Button onClick={handleViewFlaskFormat} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View API Format
          </Button>
        </div>

        {/* Flask API Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Flask API Endpoints:</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div><code>GET /api/variables</code> - Fetch all variables</div>
            <div><code>POST /api/variables</code> - Update all variables</div>
            <div><code>PUT /api/variables/&#123;name&#125;</code> - Update single variable</div>
            <div><code>GET /api/health</code> - Check API status</div>
            <div><code>GET /api/database/status</code> - Check SQLite status</div>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
            Frontend polls Flask API every 3 seconds for real-time updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};