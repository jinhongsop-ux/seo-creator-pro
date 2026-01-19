import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-2 items-center p-4 bg-white rounded-xl rounded-tl-none border-2 border-slate-900 w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
      <div className="w-2.5 h-2.5 bg-[#EBC9EE] border border-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 bg-[#C7F0C9] border border-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 bg-[#EBC9EE] border border-slate-900 rounded-full animate-bounce"></div>
    </div>
  );
};

export default React.memo(TypingIndicator);