import { useState, useEffect } from "react";
import { Sparkles, Send, Loader2, FileText, Presentation, Code, Image as ImageIcon, Plus, Lightbulb, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PptxGenJS from "pptxgenjs";

interface AssistAppProps {
  onOpenApp?: (appId: string, data?: any) => void;
}

export const AssistApp = ({ onOpenApp }: AssistAppProps) => {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompts, setImagePrompts] = useState<string[]>([]);
  const [isCloudReady, setIsCloudReady] = useState(false);
  const [checkingCloud, setCheckingCloud] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Cloud backend is configured
    const checkCloudConfig = () => {
      const hasUrl = import.meta.env.VITE_SUPABASE_URL;
      const hasKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (hasUrl && hasKey) {
        setIsCloudReady(true);
      }
      setCheckingCloud(false);
    };
    
    // Small delay to allow env vars to load
    setTimeout(checkCloudConfig, 500);
  }, []);

  const handleGenerate = async (type: 'ppt' | 'doc' | 'code') => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter what you'd like to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assist-generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type, 
            prompt, 
            title: title || `Untitled ${type.toUpperCase()}`,
            imagePrompts: type === 'ppt' ? imagePrompts : []
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (type === 'ppt') {
        await handlePPTGeneration(data);
      } else if (type === 'doc') {
        await handleDocGeneration(data);
      } else if (type === 'code') {
        handleCodeGeneration(data);
      }

      toast({
        title: "Generated successfully!",
        description: `Your ${type.toUpperCase()} is ready`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePPTGeneration = async (data: any) => {
    const pptx = new PptxGenJS();
    const slides = data.content?.slides || [];
    const images = data.images || [];

    for (const slide of slides) {
      const pptSlide = pptx.addSlide();
      
      // Title
      if (slide.title) {
        pptSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: "90%",
          h: 1,
          fontSize: 32,
          bold: true,
          color: "363636"
        });
      }

      // Content
      if (slide.content && Array.isArray(slide.content)) {
        pptSlide.addText(slide.content, {
          x: 0.5,
          y: 2,
          w: "90%",
          h: 4,
          fontSize: 18,
          bullet: true,
          color: "363636"
        });
      }

      // Image
      if (slide.imageIndex !== undefined && images[slide.imageIndex]) {
        pptSlide.addImage({
          data: images[slide.imageIndex],
          x: 6,
          y: 2,
          w: 3.5,
          h: 3.5
        });
      }
    }

    const pptBlob = await pptx.write({ outputType: "blob" }) as Blob;
    const fileName = `${title || 'presentation'}.pptx`;
    
    // Store in localStorage for File Manager
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      localStorage.setItem(`aczen_file_${fileName}`, base64);
      
      // Open in SlideDeck editor
      if (onOpenApp) {
        onOpenApp('slidedeck', { 
          slides: slides.map((s: any) => ({
            title: s.title,
            content: s.content?.join('\n') || '',
            notes: s.notes || ''
          }))
        });
      }
    };
    reader.readAsDataURL(pptBlob);
  };

  const handleDocGeneration = async (data: any) => {
    const sections = data.content?.sections || [];
    const docTitle = data.content?.title || title || 'Untitled Document';
    
    let docContent = `${docTitle}\n\n`;
    sections.forEach((section: any) => {
      if (section.heading) {
        docContent += `${section.heading}\n\n`;
      }
      if (section.content) {
        docContent += `${section.content}\n\n`;
      }
    });

    const fileName = `${docTitle}.txt`;
    localStorage.setItem(`aczen_file_${fileName}`, docContent);
    
    // Open in TextEditor
    if (onOpenApp) {
      onOpenApp('texteditor', { content: docContent, fileName });
    }
  };

  const handleCodeGeneration = (data: any) => {
    const code = data.content?.code || data.content;
    const fileName = `code.${data.content?.language || 'txt'}`;
    
    localStorage.setItem(`aczen_file_${fileName}`, code);
    
    // Open in TextEditor (can be enhanced to open in IDE)
    if (onOpenApp) {
      onOpenApp('texteditor', { content: code, fileName });
    }
  };

  const addImagePrompt = () => {
    setImagePrompts([...imagePrompts, ""]);
  };

  const updateImagePrompt = (index: number, value: string) => {
    const updated = [...imagePrompts];
    updated[index] = value;
    setImagePrompts(updated);
  };

  if (checkingCloud) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <p className="text-slate-300">Initializing backend...</p>
        </div>
      </div>
    );
  }

  if (!isCloudReady) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Backend Not Configured</h2>
            <p className="text-slate-300">
              This app requires Lovable Cloud to be enabled. Please refresh the page and wait a moment for the backend to initialize.
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/30 to-transparent rounded-[100%]"></div>
      </div>

      {/* Branding */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-semibold">Aczen Eco 2.0</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            What should we build today?
          </h1>
          <p className="text-xl text-slate-300">
            Create stunning apps & websites by chatting with AI.
          </p>
        </div>

        {/* Input area */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-4">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-white placeholder:text-slate-500 text-lg outline-none"
          />
          
          <Textarea
            placeholder="Type your idea and we'll build it together..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-transparent border-0 text-white placeholder:text-slate-500 resize-none text-lg focus-visible:ring-0"
          />

          {/* Image prompts for PPT */}
          {imagePrompts.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ImageIcon className="w-4 h-4" />
                <span>Image prompts for slides</span>
              </div>
              {imagePrompts.map((imgPrompt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Image ${idx + 1} description...`}
                  value={imgPrompt}
                  onChange={(e) => updateImagePrompt(idx, e.target.value)}
                  className="w-full bg-slate-900/50 text-white placeholder:text-slate-600 px-3 py-2 rounded-lg outline-none text-sm"
                />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={addImagePrompt}
                className="text-slate-400 hover:text-white"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Plan
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleGenerate('doc')}
                disabled={isGenerating}
                variant="ghost"
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Document
              </Button>
              
              <Button
                onClick={() => handleGenerate('ppt')}
                disabled={isGenerating}
                variant="ghost"
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4 mr-2" />}
                PPT
              </Button>
              
              <Button
                onClick={() => handleGenerate('code')}
                disabled={isGenerating}
                variant="ghost"
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4 mr-2" />}
                Code
              </Button>

              <Button
                size="icon"
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Import options */}
        <div className="text-center space-x-4 text-slate-400">
          <span>or import from</span>
          <button className="hover:text-white transition-colors">
            <span className="inline-flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Figma
            </span>
          </button>
          <button className="hover:text-white transition-colors">
            <span className="inline-flex items-center gap-2">
              <Code className="w-4 h-4" />
              GitHub
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
