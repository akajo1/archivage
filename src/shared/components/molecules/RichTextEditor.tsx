import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const isYoutubeUrl = (value: string) =>
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(value);

const isImageUrl = (value: string) =>
  /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value);

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Invalid file result'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Read error'));
    reader.readAsDataURL(file);
  });

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true, autolink: true }),
      Image,
      Youtube.configure({ controls: true }),
    ],
    content: value,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[240px] rounded-b-lg border border-[#ccb997] bg-[#fffaf2] p-3 text-sm text-[#2f2a24] focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;

    const onDrop = async (event: DragEvent) => {
      if (!event.dataTransfer) return;

      const position = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })?.pos;

      if (position === undefined) return;

      const files = Array.from(event.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        event.preventDefault();
        for (const file of imageFiles) {
          try {
            const src = await readFileAsDataUrl(file);
            editor.chain().focus().insertContentAt(position, {
              type: 'image',
              attrs: { src },
            }).run();
          } catch {
            // Ignore unreadable dropped files.
          }
        }
        return;
      }

      const droppedUrl =
        event.dataTransfer.getData('text/uri-list') ||
        event.dataTransfer.getData('text/plain');

      if (!droppedUrl) return;

      const url = droppedUrl.trim();
      if (!url) return;

      if (isYoutubeUrl(url)) {
        event.preventDefault();
        editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
        return;
      }

      if (isImageUrl(url)) {
        event.preventDefault();
        editor.chain().focus().insertContentAt(position, {
          type: 'image',
          attrs: { src: url },
        }).run();
      }
    };

    const onDragOverEvent = (event: Event) => {
      const dragEvent = event as DragEvent;
      if (!dragEvent.dataTransfer) return;
      dragEvent.preventDefault();
    };

    const onDropEvent = (event: Event) => {
      void onDrop(event as DragEvent);
    };

    dom.addEventListener('dragover', onDragOverEvent);
    dom.addEventListener('drop', onDropEvent);

    return () => {
      dom.removeEventListener('dragover', onDragOverEvent);
      dom.removeEventListener('drop', onDropEvent);
    };
  }, [editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("URL de l'image");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addVideo = () => {
    const url = prompt('URL Youtube');
    if (url) editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
  };

  const addLink = () => {
    const url = prompt('URL du lien');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const toolbarBtn =
    'rounded border border-[#ccb997] bg-[#f8f0e3] px-2 py-1 text-xs text-[#5e503f] hover:bg-[#ecdcc4]';

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-[#ccb997] bg-[#f2e7d6] p-2">
        <button type="button" className={toolbarBtn} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={toolbarBtn} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={toolbarBtn} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button type="button" className={toolbarBtn} onClick={() => editor.chain().focus().toggleBulletList().run()}>Liste</button>
        <button type="button" className={toolbarBtn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Titre</button>
        <button type="button" className={toolbarBtn} onClick={addLink}>Lien</button>
        <button type="button" className={toolbarBtn} onClick={addImage}>Image</button>
        <button type="button" className={toolbarBtn} onClick={addVideo}>Video</button>
      </div>
      <EditorContent editor={editor} />
      <p className="mt-2 text-xs text-[#7f6f5b]">
        Astuce: glissez-deposez une image (fichier ou URL) ou un lien YouTube dans l'editeur.
      </p>
    </div>
  );
};

