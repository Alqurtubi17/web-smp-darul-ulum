'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Quote, Minus, Undo, Redo,
  Heading1, Heading2, Heading3, Highlighter, Code, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={cn(
        'p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1',
        active
          ? 'bg-emerald-100 text-emerald-800'
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
      )}>
      {children}
    </button>
  );
}

export default function RichEditor({
  value, onChange, placeholder = 'Tulis konten berita lengkap di sini...', minHeight = '320px',
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl border border-emerald-100 shadow-2xs my-4 max-w-full h-auto mx-auto block',
        },
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none px-5 py-4 text-slate-800 font-medium leading-relaxed',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  const addImageFromUrl = () => {
    const url = prompt('Masukkan URL Gambar:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt('Masukkan URL Link:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-emerald-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-emerald-100 bg-emerald-50/40">
        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-emerald-200 mx-1 self-center" />

        {/* Headings */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-emerald-200 mx-1 self-center" />

        {/* Formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')} title="Highlight">
          <Highlighter className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-emerald-200 mx-1 self-center" />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Rata Kiri">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Rata Tengah">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Rata Kanan">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-emerald-200 mx-1 self-center" />

        {/* Lists & Quote */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Kutipan">
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-emerald-200 mx-1 self-center" />

        {/* Links & Images */}
        <ToolbarBtn onClick={addLink} active={editor.isActive('link')} title="Tambah Link URL">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImageFromUrl} title="Sisipkan Gambar dari URL">
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>

        {/* Direct Upload Button inside Rich Text Content */}
        <div className="ml-auto flex items-center">
          <CustomImageUploader
            label="Upload Gambar"
            onUploadComplete={(url: string) => {
              editor.chain().focus().setImage({ src: url }).run();
            }}
            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Character Count */}
      <div className="px-4 py-2 border-t border-emerald-50 flex justify-end bg-emerald-50/20">
        <span className="text-[11px] font-semibold text-slate-500">
          {editor.storage.characterCount?.characters?.() ?? 0} Karakter
        </span>
      </div>
    </div>
  );
}
