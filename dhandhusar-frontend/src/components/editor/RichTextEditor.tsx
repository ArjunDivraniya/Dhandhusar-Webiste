import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
}

interface ToolbarButtonProps {
  isActive?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  isActive,
  onClick,
  title,
  children,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
      isActive
        ? 'bg-[#315B3B] text-white'
        : 'text-[#5C5850] hover:text-[#24231F] hover:bg-[#F5F0E5]'
    }`}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  error,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#315B3B] underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'p-3 min-h-[200px] max-h-[500px] overflow-y-auto text-sm text-[#24231F] focus:outline-none',
      },
    },
  });

  // Sync incoming content prop when switching tabs or loading initial data
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div
      className={`rounded-lg bg-white border transition-colors ${
        error ? 'border-red-400' : 'border-[#D9C6A5]/80 focus-within:border-[#315B3B] focus-within:ring-2 focus-within:ring-[#315B3B]/20'
      }`}
    >
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-[#D9C6A5]/40 bg-[#FAF7F0] rounded-t-lg">
        <ToolbarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-[#D9C6A5]/60 mx-1" />

        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-[#D9C6A5]/60 mx-1" />

        <ToolbarButton
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Link"
          onClick={setLink}
          isActive={editor.isActive('link')}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-[#D9C6A5]/60 mx-1" />

        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
      {error && <p className="px-3 pb-2 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
