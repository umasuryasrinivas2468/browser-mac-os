import React, { useState, useRef, useCallback } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Move, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  BarChart3, 
  Play, 
  Download, 
  Undo, 
  Redo, 
  Palette, 
  Upload,
  Shapes,
  FileText,
  Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Slide {
  id: string;
  title: string;
  content: string;
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  elements: SlideElement[];
  speakerNotes: string;
}

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: any;
}

const SlideDeckEditor: React.FC = () => {
  const { isDarkMode } = useOS();
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Welcome Slide',
      content: 'Your presentation starts here',
      background: { type: 'color', value: '#ffffff' },
      elements: [],
      speakerNotes: ''
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'shape' | 'image'>('select');
  const [history, setHistory] = useState<Slide[][]>([slides]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  const templates = [
    {
      name: 'Pitch Deck',
      slides: [
        { title: 'Company Overview', content: 'Introduce your company' },
        { title: 'Problem', content: 'What problem are you solving?' },
        { title: 'Solution', content: 'How do you solve it?' },
        { title: 'Market Size', content: 'How big is the opportunity?' },
        { title: 'Business Model', content: 'How do you make money?' },
        { title: 'Financial Projections', content: 'Show your numbers' },
        { title: 'Team', content: 'Who is behind this?' },
        { title: 'Funding', content: 'What do you need?' }
      ]
    },
    {
      name: 'Product Deck',
      slides: [
        { title: 'Product Overview', content: 'What is your product?' },
        { title: 'Features', content: 'Key features and benefits' },
        { title: 'User Journey', content: 'How users interact with your product' },
        { title: 'Roadmap', content: 'Future development plans' },
        { title: 'Metrics', content: 'Product performance data' }
      ]
    },
    {
      name: 'About Company',
      slides: [
        { title: 'Our Story', content: 'How we started' },
        { title: 'Mission & Vision', content: 'What drives us' },
        { title: 'Values', content: 'What we believe in' },
        { title: 'Team', content: 'Meet the people' },
        { title: 'Achievements', content: 'Our milestones' },
        { title: 'Contact', content: 'Get in touch' }
      ]
    }
  ];

  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      content: 'New slide content',
      background: { type: 'color', value: '#ffffff' },
      elements: [],
      speakerNotes: ''
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    saveToHistory(newSlides);
  }, [slides]);

  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.min(currentSlideIndex, newSlides.length - 1));
    saveToHistory(newSlides);
  }, [slides, currentSlideIndex]);

  const duplicateSlide = useCallback((index: number) => {
    const slideToClone = { ...slides[index], id: Date.now().toString() };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, slideToClone);
    setSlides(newSlides);
    saveToHistory(newSlides);
  }, [slides]);

  const moveSlide = useCallback((fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(toIndex);
    saveToHistory(newSlides);
  }, [slides]);

  const saveToHistory = (newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSlides);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setSlides(history[prevIndex]);
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setSlides(history[nextIndex]);
      setHistoryIndex(nextIndex);
    }
  };

  const applyTemplate = (template: typeof templates[0]) => {
    const templateSlides: Slide[] = template.slides.map((slide, index) => ({
      id: (index + 1).toString(),
      title: slide.title,
      content: slide.content,
      background: { type: 'color', value: '#ffffff' },
      elements: [],
      speakerNotes: ''
    }));
    setSlides(templateSlides);
    setCurrentSlideIndex(0);
    saveToHistory(templateSlides);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('landscape');
    
    slides.forEach((slide, index) => {
      if (index > 0) pdf.addPage();
      pdf.setFontSize(24);
      pdf.text(slide.title, 20, 30);
      pdf.setFontSize(14);
      pdf.text(slide.content, 20, 50);
    });

    // Save to Downloads folder in file manager
    const fileStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');
    if (!fileStructure.Home?.children?.Downloads?.children) {
      if (!fileStructure.Home) fileStructure.Home = { type: 'folder', children: {} };
      if (!fileStructure.Home.children) fileStructure.Home.children = {};
      if (!fileStructure.Home.children.Downloads) {
        fileStructure.Home.children.Downloads = { type: 'folder', children: {} };
      }
      if (!fileStructure.Home.children.Downloads.children) {
        fileStructure.Home.children.Downloads.children = {};
      }
    }

    const fileName = `presentation_${Date.now()}.pdf`;
    fileStructure.Home.children.Downloads.children[fileName] = {
      type: 'file',
      content: pdf.output('datauristring'),
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    pdf.save(fileName);
  };

  const savePresentationToFileManager = () => {
    // Get or create the file structure
    const fileStructure = JSON.parse(localStorage.getItem('filemanager_structure') || '{}');
    
    // Ensure Documents folder exists
    if (!fileStructure.Home) fileStructure.Home = { type: 'folder', children: {} };
    if (!fileStructure.Home.children) fileStructure.Home.children = {};
    if (!fileStructure.Home.children.Documents) {
      fileStructure.Home.children.Documents = { type: 'folder', children: {} };
    }
    if (!fileStructure.Home.children.Documents.children) {
      fileStructure.Home.children.Documents.children = {};
    }

    // Create presentation content
    const presentationContent = `PPT_DOCUMENT:Slide Deck Presentation\n\n${slides.map(slide => 
      `Slide: ${slide.title}\nContent: ${slide.content}\nSpeaker Notes: ${slide.speakerNotes}\n---\n`
    ).join('')}`;

    const fileName = `presentation_${Date.now()}.ppt`;
    fileStructure.Home.children.Documents.children[fileName] = {
      type: 'file',
      content: presentationContent,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    
    // Show success message (you can add a toast here if needed)
    console.log('Presentation saved to Documents folder');
  };

  const currentSlide = slides[currentSlideIndex];

  if (isPresenterMode) {
    return (
      <div className="h-full bg-black text-white flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full aspect-video bg-white text-black rounded-lg p-8">
            <h1 className="text-4xl font-bold mb-6">{currentSlide?.title}</h1>
            <p className="text-xl">{currentSlide?.content}</p>
          </div>
        </div>
        <div className="w-80 p-4 border-l border-gray-600">
          <h3 className="font-semibold mb-4">Speaker Notes</h3>
          <p className="text-sm text-gray-300">{currentSlide?.speakerNotes || 'No notes for this slide'}</p>
          <div className="mt-6">
            <Button onClick={() => setIsPresenterMode(false)} className="w-full mb-2">
              Exit Presenter Mode
            </Button>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                size="sm"
              >
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Sidebar with slides */}
      <div className={`w-64 border-r p-4 overflow-y-auto ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Slides</h3>
          <Button onClick={addSlide} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Templates */}
        <div className="mb-4">
          <Select onValueChange={(value) => {
            const template = templates.find(t => t.name === value);
            if (template) applyTemplate(template);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.name} value={template.name}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`p-3 rounded-lg cursor-pointer border-2 ${
                index === currentSlideIndex
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium truncate">{slide.title}</div>
                  <div className="text-xs text-gray-500 truncate">{slide.content}</div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(index);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`flex items-center justify-between p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <Button onClick={undo} disabled={historyIndex === 0} size="sm" variant="ghost">
              <Undo className="w-4 h-4" />
            </Button>
            <Button onClick={redo} disabled={historyIndex === history.length - 1} size="sm" variant="ghost">
              <Redo className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button
              onClick={() => setSelectedTool('text')}
              size="sm"
              variant={selectedTool === 'text' ? 'default' : 'ghost'}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setSelectedTool('shape')}
              size="sm"
              variant={selectedTool === 'shape' ? 'default' : 'ghost'}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setSelectedTool('image')}
              size="sm"
              variant={selectedTool === 'image' ? 'default' : 'ghost'}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={savePresentationToFileManager} size="sm" variant="outline">
              <FileText className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button onClick={() => setIsPresenterMode(true)} size="sm">
              <Play className="w-4 h-4 mr-1" />
              Present
            </Button>
            <Button onClick={exportToPDF} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6 flex items-center justify-center">
            <div 
              className="w-full max-w-4xl aspect-video rounded-lg shadow-lg p-8"
              style={{ 
                backgroundColor: currentSlide?.background.value || '#ffffff',
                backgroundImage: currentSlide?.background.type === 'gradient' ? currentSlide.background.value : undefined
              }}
            >
              <div className="mb-6">
                <Input
                  value={currentSlide?.title || ''}
                  onChange={(e) => {
                    const newSlides = [...slides];
                    newSlides[currentSlideIndex].title = e.target.value;
                    setSlides(newSlides);
                  }}
                  className="text-3xl font-bold bg-transparent border-none p-0 focus:ring-0"
                  placeholder="Slide title"
                />
              </div>
              <Textarea
                value={currentSlide?.content || ''}
                onChange={(e) => {
                  const newSlides = [...slides];
                  newSlides[currentSlideIndex].content = e.target.value;
                  setSlides(newSlides);
                }}
                className="text-lg bg-transparent border-none p-0 focus:ring-0 resize-none"
                placeholder="Slide content"
                rows={6}
              />
            </div>
          </div>

          {/* Properties panel */}
          <div className={`w-80 border-l p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-semibold mb-4">Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={currentSlide?.background.value || '#ffffff'}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[currentSlideIndex].background = { type: 'color', value: e.target.value };
                      setSlides(newSlides);
                    }}
                    className="w-8 h-8 rounded border"
                  />
                  <Button size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-1" />
                    Image
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Speaker Notes</label>
                <Textarea
                  value={currentSlide?.speakerNotes || ''}
                  onChange={(e) => {
                    const newSlides = [...slides];
                    newSlides[currentSlideIndex].speakerNotes = e.target.value;
                    setSlides(newSlides);
                  }}
                  placeholder="Add speaker notes..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideDeckEditor;
