import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOS } from '@/contexts/OSContext';
import { 
  FileSpreadsheet, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  X,
  Calculator,
  Hash
} from 'lucide-react';

interface Cell {
  value: string;
  formula: string;
  computedValue: string | number;
  style: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    align: 'left' | 'center' | 'right';
    backgroundColor: string;
    textColor: string;
    fontSize: number;
  };
}

interface AczenSheetsProps {
  isPopupView?: boolean;
  onTogglePopup?: () => void;
}

const AczenSheetsApp: React.FC<AczenSheetsProps> = ({
  isPopupView = false,
  onTogglePopup
}) => {
  const { isDarkMode } = useOS();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const cellInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize spreadsheet with 26 columns (A-Z) and 100 rows
  const ROWS = 100;
  const COLS = 26;
  
  const [cells, setCells] = useState<{ [key: string]: Cell }>(() => {
    const initialCells: { [key: string]: Cell } = {};
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        initialCells[cellId] = {
          value: '',
          formula: '',
          computedValue: '',
          style: {
            bold: false,
            italic: false,
            underline: false,
            align: 'left',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontSize: 12
          }
        };
      }
    }
    return initialCells;
  });

  // Excel-like formula evaluation
  const evaluateFormula = useCallback((formula: string, cellId: string): string | number => {
    if (!formula.startsWith('=')) {
      return formula;
    }

    try {
      let expression = formula.substring(1); // Remove '=' sign
      
      // Replace cell references with their values
      const cellRefRegex = /[A-Z]+\d+/g;
      expression = expression.replace(cellRefRegex, (match) => {
        if (match === cellId) return '0'; // Prevent circular reference
        const referencedCell = cells[match];
        if (referencedCell && referencedCell.computedValue !== '') {
          return referencedCell.computedValue.toString();
        }
        return '0';
      });

      // Handle Excel functions
      expression = handleExcelFunctions(expression);

      // Evaluate mathematical expression
      const result = evaluateExpression(expression);
      return isNaN(result) ? '#ERROR!' : result;
    } catch (error) {
      return '#ERROR!';
    }
  }, [cells]);

  const handleExcelFunctions = (expression: string): string => {
    // SUM function
    expression = expression.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
      const sum = calculateRangeSum(start, end);
      return sum.toString();
    });

    // AVERAGE function
    expression = expression.replace(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
      const avg = calculateRangeAverage(start, end);
      return avg.toString();
    });

    // COUNT function
    expression = expression.replace(/COUNT\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
      const count = calculateRangeCount(start, end);
      return count.toString();
    });

    // MAX function
    expression = expression.replace(/MAX\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
      const max = calculateRangeMax(start, end);
      return max.toString();
    });

    // MIN function
    expression = expression.replace(/MIN\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (match, start, end) => {
      const min = calculateRangeMin(start, end);
      return min.toString();
    });

    // IF function - IF(condition, true_value, false_value)
    expression = expression.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/gi, (match, condition, trueVal, falseVal) => {
      try {
        const conditionResult = evaluateExpression(condition.trim());
        return conditionResult ? trueVal.trim() : falseVal.trim();
      } catch {
        return '#ERROR!';
      }
    });

    // ROUND function
    expression = expression.replace(/ROUND\(([^,]+),(\d+)\)/gi, (match, value, decimals) => {
      try {
        const num = parseFloat(value.trim());
        const dec = parseInt(decimals.trim());
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec).toString();
      } catch {
        return '#ERROR!';
      }
    });

    // ABS function
    expression = expression.replace(/ABS\(([^)]+)\)/gi, (match, value) => {
      try {
        const num = parseFloat(value.trim());
        return Math.abs(num).toString();
      } catch {
        return '#ERROR!';
      }
    });

    // SQRT function
    expression = expression.replace(/SQRT\(([^)]+)\)/gi, (match, value) => {
      try {
        const num = parseFloat(value.trim());
        return Math.sqrt(num).toString();
      } catch {
        return '#ERROR!';
      }
    });

    // POWER function
    expression = expression.replace(/POWER\(([^,]+),([^)]+)\)/gi, (match, base, exponent) => {
      try {
        const baseNum = parseFloat(base.trim());
        const expNum = parseFloat(exponent.trim());
        return Math.pow(baseNum, expNum).toString();
      } catch {
        return '#ERROR!';
      }
    });

    return expression;
  };

  const calculateRangeSum = (startCell: string, endCell: string): number => {
    const range = getCellRange(startCell, endCell);
    return range.reduce((sum, cellId) => {
      const cell = cells[cellId];
      const value = parseFloat(cell?.computedValue?.toString() || '0');
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const calculateRangeAverage = (startCell: string, endCell: string): number => {
    const range = getCellRange(startCell, endCell);
    const sum = calculateRangeSum(startCell, endCell);
    return sum / range.length;
  };

  const calculateRangeCount = (startCell: string, endCell: string): number => {
    const range = getCellRange(startCell, endCell);
    return range.filter(cellId => {
      const cell = cells[cellId];
      return cell?.computedValue !== '';
    }).length;
  };

  const calculateRangeMax = (startCell: string, endCell: string): number => {
    const range = getCellRange(startCell, endCell);
    const values = range.map(cellId => {
      const cell = cells[cellId];
      return parseFloat(cell?.computedValue?.toString() || '0');
    }).filter(val => !isNaN(val));
    return values.length > 0 ? Math.max(...values) : 0;
  };

  const calculateRangeMin = (startCell: string, endCell: string): number => {
    const range = getCellRange(startCell, endCell);
    const values = range.map(cellId => {
      const cell = cells[cellId];
      return parseFloat(cell?.computedValue?.toString() || '0');
    }).filter(val => !isNaN(val));
    return values.length > 0 ? Math.min(...values) : 0;
  };

  const getCellRange = (startCell: string, endCell: string): string[] => {
    const startCol = startCell.charCodeAt(0) - 65;
    const startRow = parseInt(startCell.substring(1)) - 1;
    const endCol = endCell.charCodeAt(0) - 65;
    const endRow = parseInt(endCell.substring(1)) - 1;

    const range: string[] = [];
    for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
      for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
        range.push(`${String.fromCharCode(65 + col)}${row + 1}`);
      }
    }
    return range;
  };

  const evaluateExpression = (expression: string): number => {
    // Simple expression evaluator for basic math operations
    try {
      // Replace common Excel operators
      expression = expression.replace(/\^/g, '**'); // Power operator
      
      // Use Function constructor for safe evaluation (better than eval)
      const func = new Function('return ' + expression);
      return func();
    } catch (error) {
      throw new Error('Invalid expression');
    }
  };

  const updateCell = (cellId: string, value: string, isFormula: boolean = false) => {
    setCells(prevCells => {
      const newCells = { ...prevCells };
      const cell = newCells[cellId];
      
      if (isFormula) {
        cell.formula = value;
        cell.value = value;
      } else {
        cell.value = value;
        cell.formula = value.startsWith('=') ? value : '';
      }
      
      // Compute the value
      cell.computedValue = evaluateFormula(value, cellId);
      
      return newCells;
    });
  };

  const handleCellClick = (row: number, col: number) => {
    const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
    setSelectedCell({ row, col });
    const cell = cells[cellId];
    setFormulaBarValue(cell?.formula || cell?.value || '');
    setIsEditingFormula(false);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setIsEditingFormula(true);
    setTimeout(() => {
      if (cellInputRef.current) {
        cellInputRef.current.focus();
      }
    }, 0);
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    if (selectedCell) {
      const cellId = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`;
      updateCell(cellId, value, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedCell) {
      setIsEditingFormula(false);
      // Move to next row
      if (selectedCell.row < ROWS - 1) {
        handleCellClick(selectedCell.row + 1, selectedCell.col);
      }
    } else if (e.key === 'Tab' && selectedCell) {
      e.preventDefault();
      setIsEditingFormula(false);
      // Move to next column
      if (selectedCell.col < COLS - 1) {
        handleCellClick(selectedCell.row, selectedCell.col + 1);
      }
    } else if (e.key === 'Escape') {
      setIsEditingFormula(false);
    } else if (e.key === 'Delete' && selectedCell && !isEditingFormula) {
      // Clear cell content
      const cellId = `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`;
      updateCell(cellId, '', false);
      setFormulaBarValue('');
    }
  };

  // Handle arrow key navigation
  const handleArrowKeys = useCallback((e: KeyboardEvent) => {
    if (!selectedCell || isEditingFormula) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (selectedCell.row > 0) {
          handleCellClick(selectedCell.row - 1, selectedCell.col);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (selectedCell.row < ROWS - 1) {
          handleCellClick(selectedCell.row + 1, selectedCell.col);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (selectedCell.col > 0) {
          handleCellClick(selectedCell.row, selectedCell.col - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (selectedCell.col < COLS - 1) {
          handleCellClick(selectedCell.row, selectedCell.col + 1);
        }
        break;
    }
  }, [selectedCell, isEditingFormula]);

  useEffect(() => {
    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [handleArrowKeys]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (onTogglePopup) {
      onTogglePopup();
    }
  };

  const saveSpreadsheet = () => {
    const data = {
      cells: cells,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aczen-sheet.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csv = '';
    for (let row = 0; row < ROWS; row++) {
      const rowData = [];
      for (let col = 0; col < COLS; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        const cell = cells[cellId];
        rowData.push(cell?.computedValue || '');
      }
      csv += rowData.join(',') + '\n';
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aczen-sheet.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const PopupSheets = () => (
    <div className="fixed top-4 right-4 z-50 w-96 h-96">
      <div className={`h-full rounded-xl backdrop-blur-md border shadow-2xl flex flex-col ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Aczen Sheets
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={saveSpreadsheet}
              className={`p-1 rounded hover:bg-gray-200 ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
              }`}
              title="Save"
            >
              <Save className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className={`p-1 rounded hover:bg-gray-200 ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mini Formula Bar */}
        <div className="p-2 border-b border-gray-200">
          <input
            type="text"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            placeholder="Enter formula..."
            className={`w-full px-2 py-1 text-xs border rounded selectable-text ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="flex-1 p-2 overflow-auto">
          <div className="grid grid-cols-6 gap-px text-xs">
            {/* Column headers */}
            {Array.from({ length: 6 }, (_, col) => (
              <div
                key={`header-${col}`}
                className={`h-6 flex items-center justify-center font-medium text-xs ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {String.fromCharCode(65 + col)}
              </div>
            ))}
            
            {/* Cells */}
            {Array.from({ length: 30 }, (_, i) => {
              const row = Math.floor(i / 6);
              const col = i % 6;
              const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
              const cell = cells[cellId];
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              
              return (
                <div
                  key={cellId}
                  className={`h-6 border border-gray-300 flex items-center px-1 cursor-pointer text-xs truncate ${
                    isSelected 
                      ? 'bg-blue-100 border-blue-500' 
                      : isDarkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => handleCellClick(row, col)}
                  title={cell?.computedValue?.toString() || ''}
                >
                  {cell?.computedValue || ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick functions */}
        <div className="p-2 border-t border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => handleFormulaBarChange('=SUM(A1:A5)')}
              className={`px-2 py-1 text-xs rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              SUM
            </button>
            <button
              onClick={() => handleFormulaBarChange('=AVERAGE(A1:A5)')}
              className={`px-2 py-1 text-xs rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              AVG
            </button>
            <button
              onClick={() => handleFormulaBarChange('=COUNT(A1:A5)')}
              className={`px-2 py-1 text-xs rounded ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              COUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCell = (row: number, col: number) => {
    const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
    const cell = cells[cellId];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    
    return (
      <div
        key={cellId}
        className={`h-8 border border-gray-300 flex items-center px-2 cursor-pointer text-sm relative ${
          isSelected 
            ? 'bg-blue-100 border-blue-500' 
            : isDarkMode 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-900 hover:bg-gray-50'
        }`}
        onClick={() => handleCellClick(row, col)}
        onDoubleClick={() => handleCellDoubleClick(row, col)}
        style={{
          fontWeight: cell?.style.bold ? 'bold' : 'normal',
          fontStyle: cell?.style.italic ? 'italic' : 'normal',
          textDecoration: cell?.style.underline ? 'underline' : 'none',
          textAlign: cell?.style.align || 'left',
          backgroundColor: isSelected ? undefined : cell?.style.backgroundColor,
          color: cell?.style.textColor,
          fontSize: `${cell?.style.fontSize || 12}px`
        }}
      >
        {isSelected && isEditingFormula ? (
          <input
            ref={cellInputRef}
            type="text"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full h-full bg-transparent border-none outline-none"
            autoFocus
          />
        ) : (
          <span className="truncate w-full">
            {cell?.computedValue || ''}
          </span>
        )}
      </div>
    );
  };

  // Compact view for popup mode
  if (isPopupView) {
    return (
      <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Compact Formula Bar */}
        <div className={`p-2 border-b flex items-center space-x-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`px-2 py-1 border rounded text-xs min-w-[50px] text-center ${
            isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-gray-100 text-gray-900'
          }`}>
            {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : ''}
          </div>
          <input
            type="text"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter formula..."
            className={`flex-1 px-2 py-1 border rounded text-xs selectable-text ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Compact Spreadsheet Grid */}
        <div className="flex-1 overflow-auto">
          <div className="inline-block min-w-full">
            {/* Column Headers */}
            <div className="flex sticky top-0 z-10">
              <div className={`w-8 h-6 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                
              </div>
              {Array.from({ length: 10 }, (_, col) => (
                <div
                  key={col}
                  className={`w-16 h-6 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {String.fromCharCode(65 + col)}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: 20 }, (_, row) => (
              <div key={row} className="flex">
                {/* Row Header */}
                <div className={`w-8 h-6 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {row + 1}
                </div>
                {/* Cells */}
                {Array.from({ length: 10 }, (_, col) => {
                  const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
                  const cell = cells[cellId];
                  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                  
                  return (
                    <div key={col} className="w-16">
                      <div
                        className={`h-6 border border-gray-300 flex items-center px-1 cursor-pointer text-xs relative ${
                          isSelected 
                            ? 'bg-blue-100 border-blue-500' 
                            : isDarkMode 
                            ? 'bg-gray-800 text-white hover:bg-gray-700' 
                            : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => handleCellClick(row, col)}
                        onDoubleClick={() => handleCellDoubleClick(row, col)}
                        style={{
                          fontWeight: cell?.style.bold ? 'bold' : 'normal',
                          fontStyle: cell?.style.italic ? 'italic' : 'normal',
                          textDecoration: cell?.style.underline ? 'underline' : 'none',
                          textAlign: cell?.style.align || 'left',
                          backgroundColor: isSelected ? undefined : cell?.style.backgroundColor,
                          color: cell?.style.textColor,
                          fontSize: `${Math.max((cell?.style.fontSize || 12) - 2, 10)}px`
                        }}
                      >
                        {isSelected && isEditingFormula ? (
                          <input
                            ref={cellInputRef}
                            type="text"
                            value={formulaBarValue}
                            onChange={(e) => handleFormulaBarChange(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full h-full bg-transparent border-none outline-none text-xs"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate w-full text-xs">
                            {cell?.computedValue || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPopup && <PopupSheets />}
      
      <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Aczen Sheets
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePopup}
                className={`p-2 rounded-lg hover:bg-gray-200 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'
                }`}
                title="Toggle popup view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="flex space-x-2">
                <button 
                  onClick={saveSpreadsheet}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button 
                  onClick={exportToCSV}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className={`p-2 border-b flex items-center space-x-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <Bold className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <Italic className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <AlignLeft className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <AlignCenter className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <AlignRight className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button className={`p-2 rounded hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-700'}`}>
            <Hash className="w-4 h-4" />
          </button>
        </div>

        {/* Formula Bar */}
        <div className={`p-2 border-b flex items-center space-x-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`px-2 py-1 border rounded text-sm min-w-[60px] text-center ${
            isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-gray-100 text-gray-900'
          }`}>
            {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : ''}
          </div>
          <input
            type="text"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter formula or value..."
            className={`flex-1 px-3 py-1 border rounded selectable-text ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto">
          <div className="inline-block min-w-full">
            {/* Column Headers */}
            <div className="flex sticky top-0 z-10">
              <div className={`w-12 h-8 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                
              </div>
              {Array.from({ length: COLS }, (_, col) => (
                <div
                  key={col}
                  className={`w-20 h-8 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {String.fromCharCode(65 + col)}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: ROWS }, (_, row) => (
              <div key={row} className="flex">
                {/* Row Header */}
                <div className={`w-12 h-8 border border-gray-300 flex items-center justify-center text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {row + 1}
                </div>
                {/* Cells */}
                {Array.from({ length: COLS }, (_, col) => (
                  <div key={col} className="w-20">
                    {renderCell(row, col)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AczenSheetsApp;