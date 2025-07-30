
import React, { useState, useCallback } from 'react';
import { Plus, Download, Upload, Save, Grid3X3, Calculator, ChartBar } from 'lucide-react';

interface Cell {
  value: string;
  formula?: string;
}

const AczenSheetsApp: React.FC = () => {
  const [cells, setCells] = useState<{ [key: string]: Cell }>({});
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaBar, setFormulaBar] = useState<string>('');

  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const rows = Array.from({ length: 20 }, (_, i) => i + 1);

  const getCellId = (col: string, row: number) => `${col}${row}`;

  const evaluateFormula = useCallback((formula: string): string => {
    if (!formula.startsWith('=')) return formula;

    const expression = formula.slice(1);
    
    // Replace cell references with their values
    const processedExpression = expression.replace(/[A-J]\d+/g, (match) => {
      const cellValue = cells[match]?.value || '0';
      return isNaN(Number(cellValue)) ? '0' : cellValue;
    });

    // Handle SUM function
    if (processedExpression.includes('SUM(')) {
      return processedExpression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
        // Simple range parsing (e.g., A1:A5)
        const [start, end] = range.split(':');
        if (!start || !end) return '0';
        
        const startCol = start.charAt(0);
        const startRow = parseInt(start.slice(1));
        const endCol = end.charAt(0);
        const endRow = parseInt(end.slice(1));
        
        let sum = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol.charCodeAt(0); c <= endCol.charCodeAt(0); c++) {
            const cellId = String.fromCharCode(c) + r;
            const cellValue = cells[cellId]?.value || '0';
            sum += parseFloat(cellValue) || 0;
          }
        }
        return sum.toString();
      });
    }

    try {
      // Safe evaluation of basic arithmetic
      const result = Function('"use strict"; return (' + processedExpression + ')')();
      return isNaN(result) ? '#ERROR!' : result.toString();
    } catch {
      return '#ERROR!';
    }
  }, [cells]);

  const handleCellChange = (cellId: string, value: string) => {
    const newCells = { ...cells };
    
    if (value.startsWith('=')) {
      const evaluatedValue = evaluateFormula(value);
      newCells[cellId] = { value: evaluatedValue, formula: value };
    } else {
      newCells[cellId] = { value };
    }
    
    setCells(newCells);
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    const cell = cells[cellId];
    setFormulaBar(cell?.formula || cell?.value || '');
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBar(value);
    handleCellChange(selectedCell, value);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <button className="p-2 hover:bg-gray-200 rounded">
          <Plus className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded">
          <Save className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded">
          <Download className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded">
          <Upload className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <button className="p-2 hover:bg-gray-200 rounded">
          <Calculator className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded">
          <ChartBar className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded">
          <Grid3X3 className="w-4 h-4" />
        </button>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <span className="font-mono text-sm font-medium w-12">{selectedCell}</span>
        <input
          type="text"
          value={formulaBar}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
          placeholder="Enter formula or value..."
        />
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-12 h-8 border border-gray-300 bg-gray-100 text-xs font-medium"></th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="w-24 h-8 border border-gray-300 bg-gray-100 text-xs font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <td className="w-12 h-8 border border-gray-300 bg-gray-100 text-xs font-medium text-center">
                  {row}
                </td>
                {columns.map((col) => {
                  const cellId = getCellId(col, row);
                  const isSelected = selectedCell === cellId;
                  return (
                    <td
                      key={cellId}
                      className={`w-24 h-8 border border-gray-300 cursor-cell ${
                        isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCellClick(cellId)}
                    >
                      <input
                        type="text"
                        value={cells[cellId]?.value || ''}
                        onChange={(e) => handleCellChange(cellId, e.target.value)}
                        className="w-full h-full px-1 text-xs font-mono bg-transparent outline-none"
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

export default AczenSheetsApp;
