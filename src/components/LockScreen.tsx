
import React, { useState } from 'react';
import { useOS } from '@/contexts/OSContext';

const LockScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const { setIsLocked } = useOS();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '123') {
      setIsLocked(false);
    } else {
      setIsShaking(true);
      setPassword('');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        background: `
          linear-gradient(135deg, 
            #667eea 0%, 
            #764ba2 25%, 
            #f093fb 50%, 
            #f5576c 75%, 
            #4facfe 100%
          ),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `
      }}
    >
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-light text-white mb-2">MacOS Web</h2>
          <p className="text-white/70">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-64 px-4 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/50 text-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="Enter password"
              autoFocus
            />
          </div>
          <p className="text-xs text-white/50">Default password: 123</p>
        </form>
      </div>
    </div>
  );
};

export default LockScreen;
