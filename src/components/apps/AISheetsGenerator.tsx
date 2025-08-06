import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileSpreadsheet, Download, Loader2, Wand2, Edit3, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MistralService, GeneratedContent } from '@/services/mistralService';

const AISheetsGenerator: React.FC = () => {
  const { isDarkMode, openWindow } = useOS();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [rowCount, setRowCount] = useState(10);
  const [columnCount, setColumnCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate the spreadsheet');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const content = await MistralService.generateDocument({
        type: 'sheets',
        prompt: `${prompt}. Create a spreadsheet with approximately ${rowCount} rows and ${columnCount} columns.`,
        title: title || undefined,
        rows: rowCount,
        columns: columnCount,
      });

      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate spreadsheet content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!generatedContent) return;

    let csvContent = '';
    
    if (generatedContent.headers && generatedContent.data) {
      // Add headers
      csvContent += generatedContent.headers.join(',') + '\n';
      
      // Add data rows
      generatedContent.data.forEach((row: any[]) => {
        const csvRow = row.map(cell => {
          // Escape commas and quotes in cell content
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        });
        csvContent += csvRow.join(',') + '\n';
      });
    } else {
      // Fallback: convert content to CSV format
      const content = typeof generatedContent.content === 'string' 
        ? generatedContent.content 
        : JSON.stringify(generatedContent.content, null, 2);
      
      csvContent = content;
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title || 'generated-spreadsheet'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditInSheets = () => {
    if (!generatedContent) return;

    // Convert generated content to cell format for AczenSheetsApp
    const cells: { [key: string]: { value: string } } = {};
    
    if (generatedContent.headers && generatedContent.data) {
      const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
      
      // Add headers
      generatedContent.headers.forEach((header: string, colIndex: number) => {
        if (colIndex < columns.length) {
          const cellId = `${columns[colIndex]}1`;
          cells[cellId] = { value: String(header) };
        }
      });
      
      // Add data
      generatedContent.data.forEach((row: any[], rowIndex: number) => {
        row.forEach((cell: any, colIndex: number) => {
          if (colIndex < columns.length) {
            const cellId = `${columns[colIndex]}${rowIndex + 2}`;
            cells[cellId] = { value: String(cell || '') };
          }
        });
      });
    }

    // Open in AczenSheetsApp with the generated data
    openWindow({
      id: `sheets-${Date.now()}`,
      title: `Edit: ${generatedContent.title}`,
      component: () => {
        const AczenSheetsApp = require('./AczenSheetsApp').default;
        return <AczenSheetsApp initialCells={cells} />;
      },
    });
  };

  const renderPreviewTable = () => {
    if (!generatedContent || !generatedContent.headers || !generatedContent.data) {
      return null;
    }

    return (
      <div className="overflow-auto max-h-64">
        <table className={`w-full border-collapse text-sm ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <thead>
            <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              {generatedContent.headers.map((header: string, index: number) => (
                <th key={index} className={`border px-2 py-1 text-left font-medium ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generatedContent.data.slice(0, 10).map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-white') : (isDarkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className={`border px-2 py-1 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    {String(cell || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {generatedContent.data.length > 10 && (
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing first 10 rows of {generatedContent.data.length} total rows
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          <h1 className="text-lg font-semibold">AI Spreadsheet Generator</h1>
        </div>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Generate structured spreadsheets using AI
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Spreadsheet Title (Optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter spreadsheet title..."
                className={isDarkMode ? 'bg-gray-800 border-gray-600' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Approximate Rows
                </label>
                <Input
                  type="number"
                  value={rowCount}
                  onChange={(e) => setRowCount(Math.max(1, parseInt(e.target.value) || 10))}
                  min="1"
                  max="100"
                  className={isDarkMode ? 'bg-gray-800 border-gray-600' : ''}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Approximate Columns
                </label>
                <Input
                  type="number"
                  value={columnCount}
                  onChange={(e) => setColumnCount(Math.max(1, parseInt(e.target.value) || 5))}
                  min="1"
                  max="20"
                  className={isDarkMode ? 'bg-gray-800 border-gray-600' : ''}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the data you want in your spreadsheet. For example: 'Create a sales tracking spreadsheet for a small business' or 'Generate a budget planning template with monthly expenses'"
                rows={4}
                className={isDarkMode ? 'bg-gray-800 border-gray-600' : ''}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Spreadsheet...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Spreadsheet
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{generatedContent.title}</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleEditInSheets}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit in Sheets
                  </Button>
                  <Button
                    onClick={handleDownloadCSV}
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </div>

              {/* Table Preview */}
              {renderPreviewTable()}

              {/* Formulas Section */}
              {generatedContent.formulas && Array.isArray(generatedContent.formulas) && generatedContent.formulas.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Suggested Formulas:</h4>
                  <div className="space-y-1">
                    {generatedContent.formulas.map((formula: any, index: number) => (
                      <div key={index} className={`text-sm p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <span className="font-mono">{formula.cell || `Formula ${index + 1}`}:</span> {formula.formula || formula}
                        {formula.description && (
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            - {formula.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback content display */}
              {(!generatedContent.headers || !generatedContent.data) && (
                <div className={`max-h-64 overflow-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="text-sm whitespace-pre-wrap">
                    {typeof generatedContent.content === 'string' 
                      ? generatedContent.content 
                      : JSON.stringify(generatedContent.content, null, 2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISheetsGenerator;