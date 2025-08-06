import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { FileText, Download, Loader2, Wand2, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MistralService, GeneratedContent } from '@/services/mistralService';
import jsPDF from 'jspdf';

const AIPDFGenerator: React.FC = () => {
  const { isDarkMode, openWindow } = useOS();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate the PDF');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const content = await MistralService.generateDocument({
        type: 'pdf',
        prompt,
        title: title || undefined,
      });

      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = generatedContent.title || 'Generated Document';
    doc.text(title, margin, yPosition);
    yPosition += 20;

    // Add content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    if (generatedContent.sections && Array.isArray(generatedContent.sections)) {
      // Structured content with sections
      generatedContent.sections.forEach((section: any) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        // Section title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(section.title || 'Section', margin, yPosition);
        yPosition += 10;

        // Section content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(section.content || '', maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      });
    } else {
      // Plain text content
      const content = typeof generatedContent.content === 'string' 
        ? generatedContent.content 
        : JSON.stringify(generatedContent.content, null, 2);
      
      const lines = doc.splitTextToSize(content, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
    }

    // Save the PDF
    const fileName = `${title || 'generated-document'}.pdf`;
    doc.save(fileName);
  };

  const handleEditInTextEditor = () => {
    if (!generatedContent) return;

    let content = '';
    if (generatedContent.sections && Array.isArray(generatedContent.sections)) {
      content = generatedContent.sections
        .map((section: any) => `# ${section.title}\n\n${section.content}\n\n`)
        .join('');
    } else {
      content = typeof generatedContent.content === 'string' 
        ? generatedContent.content 
        : JSON.stringify(generatedContent.content, null, 2);
    }

    // Open in TextEditor with the generated content
    openWindow({
      id: `texteditor-${Date.now()}`,
      title: `Edit: ${generatedContent.title}`,
      component: () => {
        const TextEditor = require('./TextEditor').default;
        return <TextEditor initialContent={content} />;
      },
    });
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h1 className="text-lg font-semibold">AI PDF Generator</h1>
        </div>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Generate professional PDF documents using AI
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Document Title (Optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title..."
                className={isDarkMode ? 'bg-gray-800 border-gray-600' : ''}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Content Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want in your PDF document. For example: 'Create a business proposal for a mobile app development project' or 'Generate a technical report on renewable energy solutions'"
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
                  Generating PDF Content...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate PDF Content
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
                    onClick={handleEditInTextEditor}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit in TextEditor
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className={`max-h-96 overflow-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {generatedContent.sections && Array.isArray(generatedContent.sections) ? (
                  generatedContent.sections.map((section: any, index: number) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-semibold mb-2">{section.title}</h4>
                      <p className="text-sm whitespace-pre-wrap">{section.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm whitespace-pre-wrap">
                    {typeof generatedContent.content === 'string' 
                      ? generatedContent.content 
                      : JSON.stringify(generatedContent.content, null, 2)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPDFGenerator;