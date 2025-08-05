
import React, { useState, useEffect, useCallback } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Plus, Save, Download, Upload, Search, Undo, Redo, 
  Snowflake, MoreHorizontal, Trash2, Edit3, Bold, 
  Italic, AlignLeft, AlignCenter, AlignRight, Palette,
  RowsIcon, Columns, Lock, Unlock
} from 'lucide-react';

interface CellStyle {
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
}

interface Cell {
  value: string;
  formula?: string;
  style?: CellStyle;
}

interface Sheet {
  id: string;
  name: string;
  cells: { [key: string]: Cell };
  frozenRows: number;
  frozenCols: number;
  columnWidths: { [key: string]: number };
  rowHeights: { [key: number]: number };
}

const SpreadsheetApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [sheets, setSheets] = useState<Sheet[]>([{
    id: 'sheet1',
    name: 'Sheet1',
    cells: {},
    frozenRows: 0,
    frozenCols: 0,
    columnWidths: {},
    rowHeights: {}
  }]);
  const [activeSheetId, setActiveSheetId] = useState('sheet1');
  const [selectedCell, setSelectedCell] = useState('A1');
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedCells, setHighlightedCells] = useState<string[]>([]);
  const [showFormatting, setShowFormatting] = useState(false);
  const [history, setHistory] = useState<Sheet[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const activeSheet = sheets.find(s => s.id === activeSheetId)!;
  const columns = Array.from({ length: 50 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 200 }, (_, i) => i + 1);

  // Formula evaluation engine
  const evaluateFormula = useCallback((formula: string): string => {
    if (!formula.startsWith('=')) return formula;
    
    let expression = formula.slice(1);
    
    // Replace cell references
    expression = expression.replace(/[A-Z]+\d+/g, (cellRef) => {
      const cell = activeSheet.cells[cellRef];
      return cell?.value || '0';
    });
    
    // Handle functions
    expression = expression.replace(/SUM\(([^)]+)\)/g, (_, range) => {
      const values = getCellRange(range).map(v => parseFloat(v) || 0);
      return values.reduce((a, b) => a + b, 0).toString();
    });
    
    expression = expression.replace(/AVERAGE\(([^)]+)\)/g, (_, range) => {
      const values = getCellRange(range).map(v => parseFloat(v) || 0);
      return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toString() : '0';
    });
    
    expression = expression.replace(/MIN\(([^)]+)\)/g, (_, range) => {
      const values = getCellRange(range).map(v => parseFloat(v) || 0);
      return values.length ? Math.min(...values).toString() : '0';
    });
    
    expression = expression.replace(/MAX\(([^)]+)\)/g, (_, range) => {
      const values = getCellRange(range).map(v => parseFloat(v) || 0);
      return values.length ? Math.max(...values).toString() : '0';
    });
    
    expression = expression.replace(/COUNT\(([^)]+)\)/g, (_, range) => {
      const values = getCellRange(range).filter(v => !isNaN(parseFloat(v)));
      return values.length.toString();
    });
    
    // IF function
    expression = expression.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/g, (_, condition, trueVal, falseVal) => {
      try {
        const result = Function(`"use strict"; return (${condition})`)();
        return result ? trueVal : falseVal;
      } catch {
        return '#ERROR!';
      }
    });
    
    try {
      return Function(`"use strict"; return (${expression})`)().toString();
    } catch {
      return '#ERROR!';
    }
  }, [activeSheet.cells]);

  const getCellRange = (range: string): string[] => {
    if (range.includes(':')) {
      const [start, end] = range.split(':');
      const startCol = start.replace(/\d/g, '');
      const startRow = parseInt(start.replace(/\D/g, ''));
      const endCol = end.replace(/\d/g, '');
      const endRow = parseInt(end.replace(/\D/g, ''));
      
      const values: string[] = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol.charCodeAt(0); c <= endCol.charCodeAt(0); c++) {
          const cellId = String.fromCharCode(c) + r;
          values.push(activeSheet.cells[cellId]?.value || '0');
        }
      }
      return values;
    }
    
    const cell = activeSheet.cells[range];
    return [cell?.value || '0'];
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(sheets)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const updateCell = (cellId: string, value: string, formula?: string) => {
    saveToHistory();
    
    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        const newCells = { ...sheet.cells };
        
        if (formula) {
          const evaluatedValue = evaluateFormula(formula);
          newCells[cellId] = { 
            ...newCells[cellId], 
            value: evaluatedValue, 
            formula 
          };
        } else {
          newCells[cellId] = { 
            ...newCells[cellId], 
            value 
          };
        }
        
        return { ...sheet, cells: newCells };
      }
      return sheet;
    }));
  };

  const formatCell = (property: keyof CellStyle, value: any) => {
    saveToHistory();
    
    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        const newCells = { ...sheet.cells };
        const currentCell = newCells[selectedCell] || { value: '' };
        newCells[selectedCell] = {
          ...currentCell,
          style: {
            ...currentCell.style,
            [property]: value
          }
        };
        return { ...sheet, cells: newCells };
      }
      return sheet;
    }));
  };

  const addSheet = () => {
    const newSheetId = `sheet${sheets.length + 1}`;
    const newSheet: Sheet = {
      id: newSheetId,
      name: `Sheet${sheets.length + 1}`,
      cells: {},
      frozenRows: 0,
      frozenCols: 0,
      columnWidths: {},
      rowHeights: {}
    };
    
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetId(newSheetId);
  };

  const renameSheet = (sheetId: string, newName: string) => {
    setSheets(prev => prev.map(sheet => 
      sheet.id === sheetId ? { ...sheet, name: newName } : sheet
    ));
  };

  const deleteSheet = (sheetId: string) => {
    if (sheets.length <= 1) return;
    
    setSheets(prev => {
      const newSheets = prev.filter(s => s.id !== sheetId);
      if (activeSheetId === sheetId) {
        setActiveSheetId(newSheets[0].id);
      }
      return newSheets;
    });
  };

  const insertRow = (rowIndex: number) => {
    saveToHistory();
    
    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        const newCells = { ...sheet.cells };
        
        // Shift rows down
        Object.keys(newCells).forEach(cellId => {
          const row = parseInt(cellId.replace(/\D/g, ''));
          if (row >= rowIndex) {
            const col = cellId.replace(/\d/g, '');
            const newCellId = col + (row + 1);
            newCells[newCellId] = newCells[cellId];
            delete newCells[cellId];
          }
        });
        
        return { ...sheet, cells: newCells };
      }
      return sheet;
    }));
  };

  const insertColumn = (colIndex: string) => {
    saveToHistory();
    
    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        const newCells = { ...sheet.cells };
        const colCharCode = colIndex.charCodeAt(0);
        
        // Shift columns right
        Object.keys(newCells).forEach(cellId => {
          const col = cellId.replace(/\d/g, '');
          const row = cellId.replace(/\D/g, '');
          
          if (col.charCodeAt(0) >= colCharCode) {
            const newCol = String.fromCharCode(col.charCodeAt(0) + 1);
            const newCellId = newCol + row;
            newCells[newCellId] = newCells[cellId];
            delete newCells[cellId];
          }
        });
        
        return { ...sheet, cells: newCells };
      }
      return sheet;
    }));
  };

  const exportCSV = () => {
    const maxRow = Math.max(1, ...Object.keys(activeSheet.cells).map(id => parseInt(id.replace(/\D/g, ''))));
    const maxCol = Math.max(0, ...Object.keys(activeSheet.cells).map(id => id.replace(/\d/g, '').charCodeAt(0) - 65));
    
    const csvData = [];
    for (let r = 1; r <= maxRow; r++) {
      const row = [];
      for (let c = 0; c <= maxCol; c++) {
        const cellId = String.fromCharCode(65 + c) + r;
        row.push(activeSheet.cells[cellId]?.value || '');
      }
      csvData.push(row.join(','));
    }
    
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSheet.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = () => {
    const matches: string[] = [];
    Object.entries(activeSheet.cells).forEach(([cellId, cell]) => {
      if (cell.value.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(cellId);
      }
    });
    setHighlightedCells(matches);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setSheets(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setSheets(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    const cell = activeSheet.cells[cellId];
    setFormulaBarValue(cell?.formula || cell?.value || '');
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    if (value.startsWith('=')) {
      updateCell(selectedCell, value, value);
    } else {
      updateCell(selectedCell, value);
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-2 p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <button onClick={addSheet} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="New Sheet">
          <Plus className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Save">
          <Save className="w-4 h-4" />
        </button>
        <button onClick={exportCSV} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Export CSV">
          <Download className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50">
          <Redo className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <button onClick={() => insertRow(parseInt(selectedCell.replace(/\D/g, '')))} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Insert Row">
          <RowsIcon className="w-4 h-4" />
        </button>
        <button onClick={() => insertColumn(selectedCell.replace(/\d/g, ''))} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Insert Column">
          <Columns className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 ml-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="px-2 py-1 text-sm border rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <Search className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          onClick={() => setShowFormatting(!showFormatting)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ml-auto"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {/* Formatting Bar */}
      {showFormatting && (
        <div className={`flex items-center gap-2 p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <button onClick={() => formatCell('bold', true)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => formatCell('italic', true)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <Italic className="w-4 h-4" />
          </button>
          
          <select onChange={(e) => formatCell('fontSize', parseInt(e.target.value))} className="px-2 py-1 rounded">
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
          </select>
          
          <input 
            type="color" 
            onChange={(e) => formatCell('fontColor', e.target.value)}
            className="w-8 h-8 rounded"
            title="Font Color"
          />
          <input 
            type="color" 
            onChange={(e) => formatCell('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded"
            title="Background Color"
          />
          
          <button onClick={() => formatCell('textAlign', 'left')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button onClick={() => formatCell('textAlign', 'center')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button onClick={() => formatCell('textAlign', 'right')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formula Bar */}
      <div className={`flex items-center gap-2 p-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <span className="font-mono text-sm font-medium w-12">{selectedCell}</span>
        <input
          type="text"
          value={formulaBarValue}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          className={`flex-1 px-2 py-1 border rounded text-sm font-mono ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          }`}
          placeholder="Enter formula or value..."
        />
      </div>

      {/* Sheet Tabs */}
      <div className={`flex items-center gap-1 p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        {sheets.map((sheet) => (
          <div key={sheet.id} className="flex items-center">
            <button
              onClick={() => setActiveSheetId(sheet.id)}
              className={`px-3 py-1 rounded-t-lg text-sm ${
                activeSheetId === sheet.id
                  ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onDoubleClick={() => {
                const newName = prompt('Enter new sheet name:', sheet.name);
                if (newName) renameSheet(sheet.id, newName);
              }}
            >
              {sheet.name}
            </button>
            {sheets.length > 1 && (
              <button
                onClick={() => deleteSheet(sheet.id)}
                className="ml-1 p-1 hover:bg-red-500 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className={`w-12 h-8 border sticky left-0 top-0 z-10 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}></th>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`w-24 h-8 border sticky top-0 z-10 text-xs font-medium ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <td className={`w-12 h-8 border sticky left-0 z-10 text-xs font-medium text-center ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
                  {row}
                </td>
                {columns.map((col) => {
                  const cellId = `${col}${row}`;
                  const cell = activeSheet.cells[cellId];
                  const isSelected = selectedCell === cellId;
                  const isHighlighted = highlightedCells.includes(cellId);
                  const cellStyle = cell?.style || {};
                  
                  return (
                    <td
                      key={cellId}
                      className={`w-24 h-8 border cursor-cell ${
                        isSelected ? 'ring-2 ring-blue-500' : 
                        isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800' : 
                        'hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                      onClick={() => handleCellClick(cellId)}
                      style={{
                        backgroundColor: cellStyle.backgroundColor,
                        color: cellStyle.fontColor,
                        fontSize: cellStyle.fontSize,
                        textAlign: cellStyle.textAlign,
                        fontWeight: cellStyle.bold ? 'bold' : 'normal',
                        fontStyle: cellStyle.italic ? 'italic' : 'normal'
                      }}
                    >
                      <input
                        type="text"
                        value={cell?.value || ''}
                        onChange={(e) => updateCell(cellId, e.target.value)}
                        className="w-full h-full px-1 text-xs font-mono bg-transparent outline-none"
                        style={{
                          color: cellStyle.fontColor,
                          fontSize: cellStyle.fontSize,
                          textAlign: cellStyle.textAlign,
                          fontWeight: cellStyle.bold ? 'bold' : 'normal',
                          fontStyle: cellStyle.italic ? 'italic' : 'normal'
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpreadsheetApp;
