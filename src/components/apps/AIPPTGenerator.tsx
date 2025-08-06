import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Presentation, Download, Loader2, Wand2, Edit3, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MistralService, GeneratedContent } from '@/services/mistralService';
import PptxGenJS from 'pptxgenjs';

const AIPPTGenerator: React.FC = () => {
  const { isDarkMode, openWindow } = useOS();
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate the presentation');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const content = await MistralService.generateDocument({
        type: 'ppt',
        prompt: `${prompt}. Create a presentation with approximately ${slideCount} slides.`,
        title: title || undefined,
        slides: slideCount,
      });

      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate presentation content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPPT = async () => {
    if (!generatedContent) return;

    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'Aczen OS AI Generator';
    pptx.company = 'Aczen Technologies';
    pptx.title = generatedContent.title || 'AI Generated Presentation';

    // Define theme colors
    const theme = generatedContent.theme || {
      primary: '1f2937',
      secondary: '3b82f6',
      accent: '10b981',
      text: '374151'
    };

    if (generatedContent.slides && Array.isArray(generatedContent.slides)) {
      generatedContent.slides.forEach((slide: any, index: number) => {
        const pptSlide = pptx.addSlide();

        // Add slide background
        pptSlide.background = { color: 'ffffff' };

        // Add title
        if (slide.title) {
          pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 24,
            bold: true,
            color: theme.primary,
            align: 'center'
          });
        }

        // Add content
        if (slide.content) {
          let contentText = slide.content;
          if (Array.isArray(slide.content)) {
            contentText = slide.content.map((item: string) => `• ${item}`).join('\n');
          }

          pptSlide.addText(contentText, {
            x: 0.5,
            y: 2,
            w: 9,
            h: 4,
            fontSize: 16,
            color: theme.text,
            valign: 'top'
          });
        }

        // Add speaker notes if available
        if (slide.speakerNotes || slide.notes) {
          pptSlide.addNotes(slide.speakerNotes || slide.notes);
        }

        // Add slide number
        pptSlide.addText(`${index + 1}`, {
          x: 9.5,
          y: 7,
          w: 0.5,
          h: 0.3,
          fontSize: 12,
          color: theme.secondary,
          align: 'center'
        });
      });
    } else {
      // Create a single slide with the content
      const slide = pptx.addSlide();
      slide.addText(generatedContent.title || 'Generated Presentation', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 24,
        bold: true,
        color: theme.primary,
        align: 'center'
      });

      const content = typeof generatedContent.content === 'string' 
        ? generatedContent.content 
        : JSON.stringify(generatedContent.content, null, 2);

      slide.addText(content, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 4,
        fontSize: 16,
        color: theme.text,
        valign: 'top'
      });
    }

    // Save the presentation
    const fileName = `${title || 'generated-presentation'}.pptx`;
    await pptx.writeFile({ fileName });
  };

  const handleEditInSlideDeck = () => {
    if (!generatedContent) return;

    // Open in SlideDeckEditor with the generated content
    openWindow({
      id: `slidedeck-${Date.now()}`,
      title: `Edit: ${generatedContent.title}`,
      component: () => {
        const SlideDeckEditor = require('./SlideDeckEditor').default;
        return <SlideDeckEditor initialSlides={generatedContent.slides} />;
      },
    });
  };

  const handlePreview = () => {
    if (!generatedContent) return;

    // Open a preview window
    openWindow({
      id: `ppt-preview-${Date.now()}`,
      title: `Preview: ${generatedContent.title}`,
      component: () => (
        <div className={`h-full p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">{generatedContent.title}</h1>
            {generatedContent.slides && Array.isArray(generatedContent.slides) ? (
              <div className="space-y-8">
                {generatedContent.slides.map((slide: any, index: number) => (
                  <div key={index} className={`border rounded-lg p-6 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">{slide.title}</h2>
                      <span className={`text-sm px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        Slide {index + 1}
                      </span>
                    </div>
                    <div className="mb-4">
                      {Array.isArray(slide.content) ? (
                        <ul className="list-disc list-inside space-y-2">
                          {slide.content.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="whitespace-pre-wrap">{slide.content}</p>
                      )}
                    </div>
                    {(slide.speakerNotes || slide.notes) && (
                      <div className={`mt-4 p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm font-medium mb-1">Speaker Notes:</p>
                        <p className="text-sm">{slide.speakerNotes || slide.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>No slides available for preview</p>
              </div>
            )}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5" />
          <h1 className="text-lg font-semibold">AI Presentation Generator</h1>
        </div>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Generate professional presentations using AI
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Presentation Title (Optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter presentation title..."
                className={isDarkMode ? 'bg-gray-800 border-gray-600' : ''}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Number of Slides
              </label>
              <Input
                type="number"
                value={slideCount}
                onChange={(e) => setSlideCount(Math.max(1, parseInt(e.target.value) || 5))}
                min="1"
                max="20"
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
                placeholder="Describe your presentation topic. For example: 'Create a presentation about digital marketing strategies for small businesses' or 'Generate slides about climate change and renewable energy solutions'"
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
                  Generating Presentation...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Presentation
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
                    onClick={handlePreview}
                    variant="outline"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleEditInSlideDeck}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Slides
                  </Button>
                  <Button
                    onClick={handleDownloadPPT}
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PPTX
                  </Button>
                </div>
              </div>

              <div className={`max-h-96 overflow-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {generatedContent.slides && Array.isArray(generatedContent.slides) ? (
                  <div className="space-y-4">
                    {generatedContent.slides.map((slide: any, index: number) => (
                      <div key={index} className={`border rounded p-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{slide.title}</h4>
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            Slide {index + 1}
                          </span>
                        </div>
                        <div className="text-sm">
                          {Array.isArray(slide.content) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {slide.content.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="whitespace-pre-wrap">{slide.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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

export default AIPPTGenerator;