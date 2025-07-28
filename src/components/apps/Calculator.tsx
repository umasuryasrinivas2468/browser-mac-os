
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';

const Calculator: React.FC = () => {
  const { isDarkMode } = useOS();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const buttonClass = `h-12 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
    isDarkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
  }`;

  const operatorClass = `h-12 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
    isDarkMode 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`;

  return (
    <div className={`flex flex-col h-full p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`mb-6 p-4 rounded-lg text-right ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className={`text-3xl font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1">
        <button onClick={clear} className={`${operatorClass} col-span-2`}>
          Clear
        </button>
        <button onClick={() => performOperation('÷')} className={operatorClass}>
          ÷
        </button>
        <button onClick={() => performOperation('×')} className={operatorClass}>
          ×
        </button>

        <button onClick={() => inputNumber('7')} className={buttonClass}>7</button>
        <button onClick={() => inputNumber('8')} className={buttonClass}>8</button>
        <button onClick={() => inputNumber('9')} className={buttonClass}>9</button>
        <button onClick={() => performOperation('-')} className={operatorClass}>-</button>

        <button onClick={() => inputNumber('4')} className={buttonClass}>4</button>
        <button onClick={() => inputNumber('5')} className={buttonClass}>5</button>
        <button onClick={() => inputNumber('6')} className={buttonClass}>6</button>
        <button onClick={() => performOperation('+')} className={operatorClass}>+</button>

        <button onClick={() => inputNumber('1')} className={buttonClass}>1</button>
        <button onClick={() => inputNumber('2')} className={buttonClass}>2</button>
        <button onClick={() => inputNumber('3')} className={buttonClass}>3</button>
        <button onClick={() => performOperation('=')} className={`${operatorClass} row-span-2`}>
          =
        </button>

        <button onClick={() => inputNumber('0')} className={`${buttonClass} col-span-2`}>
          0
        </button>
        <button onClick={inputDecimal} className={buttonClass}>.</button>
      </div>
    </div>
  );
};

export default Calculator;
