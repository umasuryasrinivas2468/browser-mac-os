import React, { useState, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Plus, 
  Minus, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Save,
  Download,
  Upload,
  Grid3X3,
  SortAsc,
  SortDesc,
  Filter,
  MoreVertical,
  X,
  Check,
  Calculator,
  BarChart,
  PieChart,
  Lock
} from 'lucide-react';

interface SpreadsheetAppProps {
  initialData?: string[][];
}

const SpreadsheetApp: React.FC<SpreadsheetAppProps> = ({ initialData }) => {
  const { isDarkMode } = useOS();
  const [data, setData] = useState<string[][]>(initialData || [['']]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fileName, setFileName] = useState('Untitled Spreadsheet');

  // Function to handle cell value change
  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data];
    newData[row][col] = value;
    setData(newData);
  };

  // Function to add a new row
  const addRow = () => {
    setData([...data, Array(data[0].length).fill('')]);
  };

  // Function to add a new column
  const addColumn = () => {
    const newData = data.map(row => [...row, '']);
    setData(newData);
  };

  // Function to remove the last row
  const removeRow = () => {
    if (data.length > 1) {
      setData(data.slice(0, -1));
    }
  };

  // Function to remove the last column
  const removeColumn = () => {
    if (data[0].length > 1) {
      const newData = data.map(row => row.slice(0, -1));
      setData(newData);
    }
  };

  // Function to handle cell selection
  const handleCellClick = (row: number, col: number) => {
    setSelectedCells([[row, col]]);
  };

  // Apply formatting to selected cells
  const applyFormatting = (type: 'bold' | 'italic' | 'underline' | 'textAlign') => {
    if (selectedCells.length === 0) return;

    const newData = data.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (selectedCells.some(([r, c]) => r === rowIndex && c === colIndex)) {
          // Apply formatting based on type
          if (type === 'bold') setIsBold(!isBold);
          if (type === 'italic') setIsItalic(!isItalic);
          if (type === 'underline') setIsUnderline(!isUnderline);
          if (type === 'textAlign') {
            if (textAlign === 'left') setTextAlign('center');
            else if (textAlign === 'center') setTextAlign('right');
            else setTextAlign('left');
          }
        }
        return cell;
      })
    );
    setData(newData);
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <div className={`flex items-center space-x-2 p-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex-wrap`}>
        {/* Add/Remove Row/Column */}
        <button onClick={addRow} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={removeRow} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          <Minus className="w-4 h-4" />
        </button>
        <button onClick={addColumn} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button onClick={removeColumn} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          <X className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-gray-400" />

        {/* Text Formatting */}
        <button onClick={() => applyFormatting('bold')} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'} ${isBold ? 'font-bold' : ''}`}>
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => applyFormatting('italic')} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'} ${isItalic ? 'italic' : ''}`}>
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => applyFormatting('underline')} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'} ${isUnderline ? 'underline' : ''}`}>
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-gray-400" />

        {/* Text Alignment */}
        <button onClick={() => applyFormatting('textAlign')} className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
          {textAlign === 'left' ? <AlignLeft className="w-4 h-4" /> :
           textAlign === 'center' ? <AlignCenter className="w-4 h-4" /> :
           <AlignRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {data[0].map((_, col) => (
                <th key={col} className="p-2 border border-gray-300">
                  {String.fromCharCode(65 + col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50') : ''}`}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-2 border border-gray-300">
                    <input
                      type="text"
                      className={`w-full p-1 text-sm focus:outline-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      style={{
                        fontWeight: selectedCells.some(([r, c]) => r === rowIndex && c === colIndex) && isBold ? 'bold' : 'normal',
                        fontStyle: selectedCells.some(([r, c]) => r === rowIndex && c === colIndex) && isItalic ? 'italic' : 'normal',
                        textDecoration: selectedCells.some(([r, c]) => r === rowIndex && c === colIndex) && isUnderline ? 'underline' : 'none',
                        textAlign: selectedCells.some(([r, c]) => r === rowIndex && c === colIndex) ? textAlign : 'left',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpreadsheetApp;
