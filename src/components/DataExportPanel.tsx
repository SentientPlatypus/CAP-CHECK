/**
 * Data Export Panel Component
 * Provides UI controls for exporting global variables
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database, RefreshCw } from 'lucide-react';
import { 
  exportGlobalVariables, 
  exportAsTextFile, 
  getVariablesForFlask,
  getCurrentVariables 
} from '@/lib/dataExporter';
import { chatActions } from '@/lib/globalState';
import { useToast } from '@/hooks/use-toast';

export const DataExportPanel = () => {
  const { toast } = useToast();

  const handleExportJSON = () => {
    exportGlobalVariables();
    toast({
      title: "JSON Exported",
      description: "Global variables exported as JSON file",
    });
  };

  const handleExportText = () => {
    exportAsTextFile();
    toast({
      title: "Text File Exported", 
      description: "Global variables exported as text file",
    });
  };

  const handleViewFlaskFormat = () => {
    const flaskData = getVariablesForFlask();
    console.log('Flask Format:', flaskData);
    toast({
      title: "Flask Format Logged",
      description: "Check console for Flask-compatible format",
    });
  };

  const handleRefreshFromJSON = () => {
    chatActions.loadState();
    toast({
      title: "State Refreshed",
      description: "Reloaded variables from JSON file",
    });
  };

  const currentVars = getCurrentVariables();

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

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleExportJSON} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          
          <Button onClick={handleExportText} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Text
          </Button>
          
          <Button onClick={handleViewFlaskFormat} variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Flask Format
          </Button>
          
          <Button onClick={handleRefreshFromJSON} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Integration Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Flask Integration:</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Use the exported JSON files or the Flask Format to sync these variables with your SQLite database.
            The system automatically polls for changes every 2 seconds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};