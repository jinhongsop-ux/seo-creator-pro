import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
}

// PERFORMANCE OPTIMIZATION:
// Define components outside the render function. 
// Defining them inline causes React to unmount and remount every node on every re-render (streaming chunk),
// which causes massive lag and flickering.
const MD_COMPONENTS: Components = {
  h1: ({node, ...props}) => (
    <div className="relative inline-block mt-6 mb-6">
      <span className="absolute inset-0 bg-[#EBC9EE] transform translate-y-2 -rotate-1 opacity-60"></span>
      <h1 className="relative text-2xl font-black text-slate-900" {...props} />
    </div>
  ),
  h2: ({node, ...props}) => (
      <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 flex items-center gap-2" {...props}>
        <span className="w-2 h-6 bg-[#C7F0C9] border border-slate-900 block"></span>
        {props.children}
      </h2>
  ),
  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3 border-b-2 border-[#EBC9EE] inline-block" {...props} />,
  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-3 marker:text-slate-900" {...props} />,
  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-3 marker:font-bold marker:text-slate-900" {...props} />,
  li: ({node, ...props}) => <li className="text-slate-800 leading-relaxed font-medium" {...props} />,
  p: ({node, ...props}) => <p className="text-slate-800 leading-relaxed my-3 font-medium" {...props} />,
  strong: ({node, ...props}) => <strong className="font-black text-slate-900 bg-[#EBC9EE]/50 px-1" {...props} />,
  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-900 bg-[#C7F0C9]/20 pl-4 py-2 italic my-4 rounded-r-lg" {...props} />,
  code: ({node, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !String(children).includes('\n');
      return isInline 
        ? <code className="bg-slate-100 border border-slate-300 text-purple-700 rounded px-1 py-0.5 font-bold font-mono text-sm" {...props}>{children}</code>
        : <code className="block bg-slate-900 text-[#C7F0C9] rounded-lg p-4 overflow-x-auto font-mono text-sm my-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(235,201,238,1)]" {...props}>{children}</code>;
  },
  img: ({node, ...props}) => (
      <div className="my-6 p-4 border-2 border-slate-900 border-dashed rounded-xl bg-white flex flex-col items-center justify-center text-slate-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span className="text-sm font-bold uppercase tracking-wider">{props.alt || 'Image Placeholder'}</span>
      </div>
  )
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = React.memo(({ content }) => {
  return (
    <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-900">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={MD_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}, (prev, next) => prev.content === next.content);

export default MarkdownViewer;