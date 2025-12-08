
import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Quote, Image as ImageIcon, Link as LinkIcon, 
  Heading1, Heading2, Code, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Type
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Sync initial content or external updates
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
        // Prevent cursor jumping by only updating if empty or drastically different
        if (content === '' && editorRef.current.innerHTML !== '') {
             editorRef.current.innerHTML = '';
        } else if (editorRef.current.innerHTML === '') {
             editorRef.current.innerHTML = content;
        }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ icon: Icon, cmd, arg, title }: any) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); execCmd(cmd, arg); }}
      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
            <ToolbarButton icon={Undo} cmd="undo" title="Undo" />
            <ToolbarButton icon={Redo} cmd="redo" title="Redo" />
        </div>
        
        <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
            <ToolbarButton icon={Bold} cmd="bold" title="Bold" />
            <ToolbarButton icon={Italic} cmd="italic" title="Italic" />
            <ToolbarButton icon={Underline} cmd="underline" title="Underline" />
        </div>

        <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
            <ToolbarButton icon={Heading1} cmd="formatBlock" arg="H2" title="Heading 2" />
            <ToolbarButton icon={Heading2} cmd="formatBlock" arg="H3" title="Heading 3" />
            <ToolbarButton icon={Type} cmd="formatBlock" arg="P" title="Paragraph" />
        </div>

        <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
            <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="Align Left" />
            <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="Align Center" />
            <ToolbarButton icon={AlignRight} cmd="justifyRight" title="Align Right" />
        </div>

        <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-2">
            <ToolbarButton icon={List} cmd="insertUnorderedList" title="Bullet List" />
            <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" title="Numbered List" />
        </div>

        <div className="flex items-center gap-1">
            <ToolbarButton icon={Quote} cmd="formatBlock" arg="BLOCKQUOTE" title="Quote" />
            <ToolbarButton icon={Code} cmd="formatBlock" arg="PRE" title="Code Block" />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const url = prompt('Enter Link URL:');
                if(url) execCmd('createLink', url);
              }}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
              title="Link"
            >
                <LinkIcon size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const url = prompt('Enter Image URL:');
                if(url) execCmd('insertImage', url);
              }}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
              title="Image"
            >
                <ImageIcon size={18} />
            </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-6 min-h-[500px] outline-none blog-content"
        dangerouslySetInnerHTML={{ __html: content }} // Initial load
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          cursor: text;
        }
      `}</style>
    </div>
  );
};
