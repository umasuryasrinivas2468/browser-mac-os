
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  Plus, Save, Download, Upload, Search, Undo, Redo, 
  Snowflake, RowsIcon, Columns, Trash2, Edit3, Bold, 
  Italic, AlignLeft, AlignCenter, AlignRight, Palette
} from 'lucide-react';

interface Cell {
  value: string;
  formula?: string;
  style?: {
    fontSize?: number;
    fontColor?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
  };
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

interface SpreadsheetState {
  sheets: Sheet[];
  activeSheetId: string;
  history: any[];
  historyIndex: number;
}

const SpreadsheetApp: React.FC = () => {
  const { isDarkMode } = useOS();
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetState>({
    sheets: [{
      id: 'sheet1',
      name: 'Sheet1',
      cells: {},
      frozenRows: 0,
      frozenCols: 0,
      columnWidths: {},
      rowHeights: {}
    }],
    activeSheetId: 'sheet1',
    history: [],
    historyIndex: -1
  });
  
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaBar, setFormulaBar] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightedCells, setHighlightedCells] = useState<string[]>([]);
  const [showFormatting, setShowFormatting] = useState<boolean>(false);

  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  const activeSheet = spreadsheet.sheets.find(s => s.id === spreadsheet.activeSheetId)!;

  const getCellId = (col: string, row: number) => `${col}${row}`;

  // Formula engine with enhanced functions
  const evaluateFormula = useCallback((formula: string, currentCellId?: string): string => {
    if (!formula.startsWith('=')) return formula;

    const expression = formula.slice(1);
    
    // Prevent circular references
    const visitedCells = new Set<string>();
    const evaluateWithCircularCheck = (expr: string, cellId?: string): string => {
      if (cellId && visitedCells.has(cellId)) {
        return '#CIRCULAR!';
      }
      if (cellId) visitedCells.add(cellId);
      
      // Replace cell references with their values
      return expr.replace(/[A-Z]\d+/g, (match) => {
        const cell = activeSheet.cells[match];
        if (!cell) return '0';
        
        if (cell.formula && cell.formula.startsWith('=')) {
          return evaluateWithCircularCheck(cell.formula.slice(1), match);
        }
        return isNaN(Number(cell.value)) ? '0' : cell.value;
      });
    };

    let processedExpression = evaluateWithCircularCheck(expression, currentCellId);

    // Handle functions
    // SUM function
    processedExpression = processedExpression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
      const values = parseRange(range);
      const sum = values.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      return sum.toString();
    });

    // AVERAGE function
    processedExpression = processedExpression.replace(/AVERAGE\(([^)]+)\)/g, (match, range) => {
      const values = parseRange(range);
      const sum = values.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      return values.length > 0 ? (sum / values.length).toString() : '0';
    });

    // MIN function
    processedExpression = processedExpression.replace(/MIN\(([^)]+)\)/g, (match, range) => {
      const values = parseRange(range).map(v => parseFloat(v) || 0);
      return values.length > 0 ? Math.min(...values).toString() : '0';
    });

    // MAX function
    processedExpression = processedExpression.replace(/MAX\(([^)]+)\)/g, (match, range) => {
      const values = parseRange(range).map(v => parseFloat(v) || 0);
      return values.length > 0 ? Math.max(...values).toString() : '0';
    });

    // COUNT function
    processedExpression = processedExpression.replace(/COUNT\(([^)]+)\)/g, (match, range) => {
      const values = parseRange(range);
      const count = values.filter(v => !isNaN(parseFloat(v))).length;
      return count.toString();
    });

    // IF function
    processedExpression = processedExpression.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/g, (match, condition, trueVal, falseVal) => {
      try {
        const conditionResult = Function('"use strict"; return (' + condition + ')')();
        return conditionResult ? trueVal.trim() : falseVal.trim();
      } catch {
        return '#ERROR!';
      }
    });

    try {
      const result = Function('"use strict"; return (' + processedExpression + ')')();
      return isNaN(result) ? '#ERROR!' : result.toString();
    } catch {
      return '#ERROR!';
    }
  }, [activeSheet.cells]);

  const parseRange = (range: string): string[] => {
    const values: string[] = [];
    
    if (range.includes(':')) {
      const [start, end] = range.split(':');
      const startCol = start.charAt(0);
      const startRow = parseInt(start.slice(1));
      const endCol = end.charAt(0);
      const endRow = parseInt(end.slice(1));
      
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol.charCodeAt(0); c <= endCol.charCodeAt(0); c++) {
          const cellId = String.fromCharCode(c) + r;
          const cell = activeSheet.cells[cellId];
          values.push(cell?.value || '0');
        }
      }
    } else {
      // Single cell or comma-separated values
      const parts = range.split(',');
      parts.forEach(part => {
        const trimmed = part.trim();
        if (/^[A-Z]\d+$/.test(trimmed)) {
          const cell = activeSheet.cells[trimmed];
          values.push(cell?.value || '0');
        } else {
          values.push(trimmed);
        }
      });
    }
    
    return values;
  };

  const saveToHistory = () => {
    const newHistory = spreadsheet.history.slice(0, spreadsheet.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(spreadsheet)));
    
    setSpreadsheet(prev => ({
      ...prev,
      history: newHistory.slice(-50), // Keep last 50 states
      historyIndex: Math.min(newHistory.length - 1, 49)
    }));
  };

  const handleCellChange = (cellId: string, value: string) => {
    saveToHistory();
    
    setSpreadsheet(prev => {
      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id === prev.activeSheetId) {
          const newCells = { ...sheet.cells };
          
          if (value.startsWith('=')) {
            const evaluatedValue = evaluateFormula(value, cellId);
            newCells[cellId] = { 
              ...newCells[cellId], 
              value: evaluatedValue, 
              formula: value 
            };
          } else {
            newCells[cellId] = { 
              ...newCells[cellId], 
              value 
            };
          }
          
          // Recalculate dependent formulas
          Object.keys(newCells).forEach(id => {
            const cell = newCells[id];
            if (cell.formula && cell.formula.includes(cellId)) {
              newCells[id] = {
                ...cell,
                value: evaluateFormula(cell.formula, id)
              };
            }
          });
          
          return { ...sheet, cells: newCells };
        }
        return sheet;
      });
      
      return { ...prev, sheets: newSheets };
    });
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    const cell = activeSheet.cells[cellId];
    setFormulaBar(cell?.formula || cell?.value || '');
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBar(value);
    handleCellChange(selectedCell, value);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setHighlightedCells([]);
      return;
    }
    
    const matches: string[] = [];
    Object.entries(activeSheet.cells).forEach(([cellId, cell]) => {
      if (cell.value.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(cellId);
      }
    });
    setHighlightedCells(matches);
  };

  const addSheet = () => {
    const newSheetId = `sheet${spreadsheet.sheets.length + 1}`;
    setSpreadsheet(prev => ({
      ...prev,
      sheets: [...prev.sheets, {
        id: newSheetId,
        name: `Sheet${prev.sheets.length + 1}`,
        cells: {},
        frozenRows: 0,
        frozenCols: 0,
        columnWidths: {},
        rowHeights: {}
      }],
      activeSheetId: newSheetId
    }));
  };

  const deleteSheet = (sheetId: string) => {
    if (spreadsheet.sheets.length <= 1) return;
    
    setSpreadsheet(prev => {
      const newSheets = prev.sheets.filter(s => s.id !== sheetId);
      const newActiveId = prev.activeSheetId === sheetId ? newSheets[0].id : prev.activeSheetId;
      return {
        ...prev,
        sheets: newSheets,
        activeSheetId: newActiveId
      };
    });
  };

  const exportToCSV = () => {
    const csvContent = [];
    const maxRow = Math.max(...Object.keys(activeSheet.cells).map(id => parseInt(id.slice(1))), 1);
    const maxCol = Math.max(...Object.keys(activeSheet.cells).map(id => id.charCodeAt(0) - 64), 1);
    
    for (let r = 1; r <= maxRow; r++) {
      const row = [];
      for (let c = 1; c <= maxCol; c++) {
        const cellId = String.fromCharCode(64 + c) + r;
        const cell = activeSheet.cells[cellId];
        row.push(cell?.value || '');
      }
      csvContent.push(row.join(','));
    }
    
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSheet.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const undo = () => {
    if (spreadsheet.historyIndex > 0) {
      const previousState = spreadsheet.history[spreadsheet.historyIndex - 1];
      setSpreadsheet({
        ...previousState,
        history: spreadsheet.history,
        historyIndex: spreadsheet.historyIndex - 1
      });
    }
  };

  const redo = () => {
    if (spreadsheet.historyIndex < spreadsheet.history.length - 1) {
      const nextState = spreadsheet.history[spreadsheet.historyIndex + 1];
      setSpreadsheet({
        ...nextState,
        history: spreadsheet.history,
        historyIndex: spreadsheet.historyIndex + 1
      });
    }
  };

  const formatCell = (property: string, value: any) => {
    saveToHistory();
    setSpreadsheet(prev => {
      const newSheets = prev.sheets.map(sheet => {
        if (sheet.id === prev.activeSheetId) {
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
      });
      return { ...prev, sheets: newSheets };
    });
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
        <button onClick={exportToCSV} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Export CSV">
          <Download className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <button onClick={undo} disabled={spreadsheet.historyIndex <= 0} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50" title="Undo">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={spreadsheet.historyIndex >= spreadsheet.history.length - 1} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-50" title="Redo">
          <Redo className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="px-2 py-1 text-sm border rounded"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Search">
            <Search className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={() => setShowFormatting(!showFormatting)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
          title="Format"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {/* Formatting Bar */}
      {showFormatting && (
        <div className={`flex items-center gap-2 p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <button onClick={() => formatCell('bold', true)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => formatCell('italic', true)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Italic">
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
          value={formulaBar}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          className={`flex-1 px-2 py-1 border rounded text-sm font-mono ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          }`}
          placeholder="Enter formula or value..."
        />
      </div>

      {/* Sheet Tabs */}
      <div className={`flex items-center gap-1 p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        {spreadsheet.sheets.map((sheet) => (
          <div key={sheet.id} className="flex items-center">
            <button
              onClick={() => setSpreadsheet(prev => ({ ...prev, activeSheetId: sheet.id }))}
              className={`px-3 py-1 rounded-t-lg text-sm ${
                spreadsheet.activeSheetId === sheet.id
                  ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                  : isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sheet.name}
            </button>
            {spreadsheet.sheets.length > 1 && (
              <button
                onClick={() => deleteSheet(sheet.id)}
                className="ml-1 p-1 hover:bg-red-500 rounded"
                title="Delete Sheet"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addSheet} className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Add Sheet">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className={`w-12 h-8 border sticky left-0 top-0 z-10 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'} text-xs font-medium`}></th>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`w-24 h-8 border sticky top-0 z-10 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'} text-xs font-medium`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <td className={`w-12 h-8 border sticky left-0 z-10 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'} text-xs font-medium text-center`}>
                  {row}
                </td>
                {columns.map((col) => {
                  const cellId = getCellId(col, row);
                  const isSelected = selectedCell === cellId;
                  const isHighlighted = highlightedCells.includes(cellId);
                  const cell = activeSheet.cells[cellId];
                  const cellStyle = cell?.style || {};
                  
                  return (
                    <td
                      key={cellId}
                      className={`w-24 h-8 border cursor-cell ${
                        isSelected 
                          ? 'ring-2 ring-blue-500' 
                          : isHighlighted 
                          ? 'bg-yellow-200 dark:bg-yellow-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
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
                        onChange={(e) => handleCellChange(cellId, e.target.value)}
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
