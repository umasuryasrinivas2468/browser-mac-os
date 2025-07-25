
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';

const TerminalApp: React.FC = () => {
  const { currentTime } = useOS();
  const [history, setHistory] = useState<string[]>([
    'Welcome to MacOS Web Terminal v1.0',
    'Type "help" for available commands.',
    ''
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = {
    help: () => [
      'Available commands:',
      '  help       - Show this help message',
      '  clear      - Clear the terminal',
      '  whoami     - Show current user',
      '  date       - Show current date and time',
      '  pwd        - Show current directory',
      '  ls         - List directory contents',
      '  echo <msg> - Echo a message',
      '  uname      - Show system information',
      '  uptime     - Show system uptime',
      '  cat <file> - Display file contents (simulated)',
      ''
    ],
    clear: () => {
      setHistory(['']);
      return [];
    },
    whoami: () => ['john_doe'],
    date: () => [new Date().toString()],
    pwd: () => ['/Users/john_doe'],
    ls: () => [
      'Documents    Downloads    Pictures    Music    Videos',
      'Desktop      Applications Library     Public',
      ''
    ],
    uname: () => ['MacOS Web Terminal (Darwin Kernel)'],
    uptime: () => [`up ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)} hours`],
    cat: (args: string[]) => {
      const filename = args[0] || 'unknown';
      const files: { [key: string]: string[] } = {
        'readme.txt': ['This is a simulated file system.', 'Welcome to MacOS Web!'],
        'version.txt': ['MacOS Web v1.0', 'Build 2024.01.01'],
        'config.json': ['{ "theme": "dark", "user": "john_doe" }']
      };
      return files[filename] || [`cat: ${filename}: No such file or directory`];
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const [command, ...args] = trimmedCmd.split(' ');
    const newHistory = [...history, `$ ${trimmedCmd}`];

    if (command === 'echo') {
      newHistory.push(args.join(' '));
    } else if (commands[command as keyof typeof commands]) {
      const result = (commands[command as keyof typeof commands] as Function)(args);
      if (Array.isArray(result)) {
        newHistory.push(...result);
      }
    } else {
      newHistory.push(`command not found: ${command}`);
    }

    newHistory.push('');
    setHistory(newHistory);
    setCommandHistory([...commandHistory, trimmedCmd]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div 
      className="h-full bg-black text-green-400 font-mono text-sm p-4 overflow-auto"
      onClick={() => inputRef.current?.focus()}
      ref={terminalRef}
    >
      <div className="whitespace-pre-wrap">
        {history.map((line, index) => (
          <div key={index}>
            {line}
          </div>
        ))}
      </div>
      
      <div className="flex items-center">
        <span className="text-blue-400">john_doe@macos-web</span>
        <span className="text-white">:</span>
        <span className="text-purple-400">~</span>
        <span className="text-white">$ </span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 ml-1"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default TerminalApp;
