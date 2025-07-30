
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '@/contexts/OSContext';
import AczenSheetsApp from './AczenSheetsApp';
import AczenIDEApp from './AczenIDEApp';
import SettingsApp from './SettingsApp';

const TerminalApp: React.FC = () => {
  const { currentTime, openWindow } = useOS();
  const [history, setHistory] = useState<string[]>([
    'Welcome to Aczen Web Terminal v2.1.0',
    'Type "help" for available commands.',
    'Try "aczen", "gst", "codex", "control", or "time" for Aczen features.',
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
      '  help         - Show this help message',
      '  clear        - Clear the terminal',
      '  whoami       - Show current user',
      '  date         - Show current date and time',
      '  pwd          - Show current directory',
      '  ls [dir]     - List directory contents',
      '  echo <msg>   - Echo a message',
      '  uname        - Show system information',
      '  uptime       - Show system uptime',
      '  cat <file>   - Display file contents (simulated)',
      '  mkdir <dir>  - Create directory (simulated)',
      '  touch <file> - Create file (simulated)',
      '  rm <file>    - Remove file (simulated)',
      '  ps           - Show running processes',
      '  top          - Show system resources',
      '  history      - Show command history',
      '  neofetch     - Show system info with ASCII art',
      '  weather      - Show weather information',
      '  joke         - Tell a random joke',
      '',
      'Aczen Commands:',
      '  aczen        - Display Aczen branding',
      '  gst          - Open Aczen Sheets',
      '  codex        - Open Aczen IDE',
      '  control      - Open Settings',
      '  time         - Show current time and date',
      ''
    ],
    clear: () => {
      setHistory(['']);
      return [];
    },
    whoami: () => ['user'],
    date: () => [new Date().toString()],
    pwd: () => ['/Users/user'],
    ls: (args: string[]) => {
      const dir = args[0] || '';
      if (dir === 'Documents') {
        return ['report.pdf    notes.txt    presentation.pptx', ''];
      } else if (dir === 'Downloads') {
        return ['installer.dmg    image.jpg    archive.zip', ''];
      }
      return [
        'Documents    Downloads    Pictures    Music    Videos',
        'Desktop      Applications Library     Public',
        ''
      ];
    },
    uname: () => ['Aczen Web Terminal (Darwin Kernel Version 23.1.0)'],
    uptime: () => [`up ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)} hours, load average: 1.2, 1.5, 1.8`],
    cat: (args: string[]) => {
      const filename = args[0] || 'unknown';
      const files: { [key: string]: string[] } = {
        'readme.txt': ['This is a simulated file system.', 'Welcome to Aczen Web!', 'Version 2.1.0'],
        'version.txt': ['Aczen Web v2.1.0', 'Build 2024.01.15', 'Release: Stable'],
        'config.json': ['{ "theme": "dark", "user": "user", "version": "2.1.0" }'],
        'notes.txt': ['Meeting notes:', '- Implement new features', '- Fix responsive design', '- Update documentation']
      };
      return files[filename] || [`cat: ${filename}: No such file or directory`];
    },
    mkdir: (args: string[]) => {
      const dirname = args[0] || 'unknown';
      return [`mkdir: created directory '${dirname}'`];
    },
    touch: (args: string[]) => {
      const filename = args[0] || 'unknown';
      return [`touch: created file '${filename}'`];
    },
    rm: (args: string[]) => {
      const filename = args[0] || 'unknown';
      return [`rm: removed '${filename}'`];
    },
    ps: () => [
      'PID   COMMAND',
      '1     systemd',
      '123   aczen-web',
      '456   terminal',
      '789   browser',
      ''
    ],
    top: () => [
      'System Resources:',
      'CPU Usage: 15.2%',
      'Memory: 8.2GB / 16GB (51%)',
      'Disk: 256GB / 512GB (50%)',
      'Network: ↓ 1.2MB/s ↑ 0.8MB/s',
      ''
    ],
    history: () => commandHistory.slice(-10).map((cmd, i) => `${commandHistory.length - 10 + i + 1}  ${cmd}`),
    neofetch: () => [
      '<span style="color: #3b82f6;">       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄</span>',
      '<span style="color: #3b82f6;">     ██                         ██</span>',
      '<span style="color: #3b82f6;">   ██                             ██</span>',
      '<span style="color: #3b82f6;">  ██          ▄▄▄▄▄▄▄▄▄▄▄▄         ██</span>',
      '<span style="color: #3b82f6;"> ██         ██████████████         ██</span>',
      '<span style="color: #3b82f6;">██    ████  ██████████████  ████    ██</span>',
      '<span style="color: #3b82f6;">██   ██████████████████████████     ██</span>',
      '<span style="color: #3b82f6;">██  ████████████████████████████    ██</span>',
      '<span style="color: #3b82f6;">██ ██████████████  ████████████     ██</span>',
      '<span style="color: #3b82f6;">██ █████████████    █████████████   ██</span>',
      '<span style="color: #3b82f6;">██ ████████████      ████████████   ██</span>',
      '<span style="color: #3b82f6;">██  ██████████        ███████████   ██</span>',
      '<span style="color: #3b82f6;"> ██  █████████        ██████████   ██</span>',
      '<span style="color: #3b82f6;">  ██   ██████          ███████    ██</span>',
      '<span style="color: #3b82f6;">   ██    ████          █████     ██</span>',
      '<span style="color: #3b82f6;">     ██                        ██</span>',
      '<span style="color: #3b82f6;">       ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀</span>',
      '',
      '<span style="color: #22d3ee; font-weight: bold; font-size: 1.2em;">         A C Z E N</span>',
      '<span style="color: #6b7280;">         ─────────</span>',
      '',
      '<span style="color: #3b82f6; font-weight: bold;">user@aczen-web</span>',
      '<span style="color: #6b7280;">─────────────────────</span>',
      '<span style="color: #10b981;">OS:</span> Aczen Web v2.1.0',
      '<span style="color: #10b981;">Host:</span> Aczen WebOS Desktop',
      '<span style="color: #10b981;">Kernel:</span> 5.8.0-50-generic',
      '<span style="color: #10b981;">Uptime:</span> 19 mins',
      '<span style="color: #10b981;">Packages:</span> 2088 (dpkg), 18 (flatpak)',
      '<span style="color: #10b981;">Shell:</span> aczen-terminal',
      '<span style="color: #10b981;">Resolution:</span> 3072x1728',
      '<span style="color: #10b981;">DE:</span> Aczen Desktop',
      '<span style="color: #10b981;">WM:</span> Aczen Window Manager',
      '<span style="color: #10b981;">WM Theme:</span> AczenBlue-Light',
      '<span style="color: #10b981;">Theme:</span> AczenBlue-Light [GTK2/3]',
      '<span style="color: #10b981;">Icons:</span> AczenBlue-Light [GTK2/3]',
      '<span style="color: #10b981;">Terminal:</span> aczen-terminal',
      '<span style="color: #10b981;">Terminal Font:</span> Cousine 11',
      '<span style="color: #10b981;">CPU:</span> Intel i3 540 (4) @ 3.067GHz',
      '<span style="color: #10b981;">GPU:</span> Intel Core Processor',
      '<span style="color: #10b981;">Memory:</span> 1846MiB / 7697MiB',
      ''
    ],
    weather: () => [
      '🌤️  Weather in San Francisco',
      '─────────────────────────────',
      'Temperature: 22°C (72°F)',
      'Condition: Partly Cloudy',
      'Humidity: 65%',
      'Wind: 8 km/h NW',
      ''
    ],
    joke: () => {
      const jokes = [
        'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
        'How many programmers does it take to change a light bulb? None, that\'s a hardware problem! 💡',
        'Why do Java developers wear glasses? Because they can\'t C# ! 👓',
        'What\'s a programmer\'s favorite hangout place? Foo Bar! 🍺',
        'Why did the programmer quit his job? He didn\'t get arrays! 📊'
      ];
      return [jokes[Math.floor(Math.random() * jokes.length)], ''];
    },
    // Custom Aczen commands
    aczen: () => {
      return [
        '<span style="color: #22d3ee; font-weight: bold; font-size: 1.5em;">A C Z E N</span>',
        '<span style="color: #3b82f6;">#WebOS #Innovation #Future</span>', 
        ''
      ];
    },
    gst: () => {
      openWindow({
        id: 'aczen-sheets',
        title: 'Aczen Sheets',
        component: AczenSheetsApp
      });
      return ['Opening Aczen Sheets...', ''];
    },
    codex: () => {
      openWindow({
        id: 'aczen-ide',
        title: 'Aczen IDE',
        component: AczenIDEApp
      });
      return ['Opening Aczen IDE...', ''];
    },
    control: () => {
      openWindow({
        id: 'settings',
        title: 'Settings',
        component: SettingsApp
      });
      return ['Opening Settings...', ''];
    },
    time: () => {
      const now = new Date();
      return [
        `Current Time: ${now.toLocaleTimeString()}`,
        `Current Date: ${now.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
        ''
      ];
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
      className="h-full bg-black text-green-400 font-mono text-xs sm:text-sm p-2 sm:p-4 overflow-auto"
      onClick={() => inputRef.current?.focus()}
      ref={terminalRef}
    >
      <div className="whitespace-pre-wrap break-words">
        {history.map((line, index) => (
          <div key={index} className="leading-relaxed">
            {line.includes('<span') ? (
              <div dangerouslySetInnerHTML={{ __html: line }} />
            ) : (
              line
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center flex-wrap sm:flex-nowrap">
        <div className="flex items-center flex-shrink-0">
          <span className="text-blue-400 text-xs sm:text-sm">user@aczen-web</span>
          <span className="text-white">:</span>
          <span className="text-purple-400">~</span>
          <span className="text-white">$ </span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 ml-1 min-w-0 text-xs sm:text-sm"
          spellCheck={false}
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
};

export default TerminalApp;
