
import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { Plus, Search, Trash2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FileItem {
  type: 'file' | 'folder';
  children?: { [key: string]: FileItem };
  content?: string;
  savedAt?: string;
}

const NotesApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('macos-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        setSelectedNote(parsedNotes[0]);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('macos-notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    setSelectedNote({ ...updatedNote, updatedAt: new Date() });
  };

  const deleteNote = (noteId: string) => {
    const filteredNotes = notes.filter(note => note.id !== noteId);
    setNotes(filteredNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(filteredNotes.length > 0 ? filteredNotes[0] : null);
    }
  };

  const saveAsPDF = () => {
    if (!selectedNote) return;
    
    const pdf = new jsPDF();
    const lines = selectedNote.content.split('\n');
    let yPosition = 20;
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(selectedNote.title, 20, yPosition);
    yPosition += 20;
    
    // Add content
    pdf.setFontSize(12);
    lines.forEach((line) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 10;
    });

    // Save to Downloads folder in file structure
    const fileStructureStr = localStorage.getItem('filemanager_structure') || '{}';
    try {
      const fileStructure = JSON.parse(fileStructureStr) as { [key: string]: FileItem };
      const pdfFileName = `${selectedNote.title}.pdf`;
      
      // Ensure Downloads folder structure exists
      if (!fileStructure.Downloads) {
        fileStructure.Downloads = {
          type: 'folder',
          children: {}
        };
      }
      if (!fileStructure.Downloads.children) {
        fileStructure.Downloads.children = {};
      }
      
      // Add PDF to Downloads
      fileStructure.Downloads.children[pdfFileName] = {
        type: 'file',
        content: `PDF_CONTENT:${selectedNote.content}`,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    } catch (error) {
      console.error('Error saving PDF to file structure:', error);
    }

    pdf.save(`${selectedNote.title}.pdf`);
  };

  const saveAsPPT = () => {
    if (!selectedNote) return;
    
    const pptFileName = `${selectedNote.title}.pptx`;
    
    // Save to Downloads folder in file structure
    const fileStructureStr = localStorage.getItem('filemanager_structure') || '{}';
    try {
      const fileStructure = JSON.parse(fileStructureStr) as { [key: string]: FileItem };
      
      // Ensure Downloads folder structure exists
      if (!fileStructure.Downloads) {
        fileStructure.Downloads = {
          type: 'folder',
          children: {}
        };
      }
      if (!fileStructure.Downloads.children) {
        fileStructure.Downloads.children = {};
      }
      
      // Add PPT to Downloads
      fileStructure.Downloads.children[pptFileName] = {
        type: 'file',
        content: `PPT_CONTENT:${selectedNote.content}`,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('filemanager_structure', JSON.stringify(fileStructure));
    } catch (error) {
      console.error('Error saving PPT to file structure:', error);
    }

    // Create and download PPT file
    const blob = new Blob([selectedNote.content], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pptFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`w-80 border-r flex flex-col ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Notes</h2>
            <button
              onClick={createNewNote}
              className="p-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`w-full p-4 text-left border-b hover:bg-gray-100 transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'border-b-gray-200'
                } ${isDarkMode ? 'hover:bg-gray-800' : ''}`}
              >
                <h3 className="font-medium truncate">{note.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {note.content || 'No additional text'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {note.updatedAt.toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote({ ...selectedNote, title: e.target.value })}
                className={`text-xl font-semibold bg-transparent border-none outline-none flex-1 mr-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              />
              <div className="flex items-center space-x-2">
                <Button onClick={saveAsPDF} size="sm" variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={saveAsPPT} size="sm" variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  PPT
                </Button>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4">
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateNote({ ...selectedNote, content: e.target.value })}
                placeholder="Start writing..."
                className={`w-full h-full resize-none border-none outline-none bg-transparent ${
                  isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-yellow-600" />
              </div>
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
