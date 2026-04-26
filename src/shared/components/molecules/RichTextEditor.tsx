import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node, mergeAttributes } from '@tiptap/core';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { useEffect, useRef } from 'react';
import {
  RiBold,
  RiItalic,
  RiUnderline,
  RiStrikethrough,
  RiListUnordered,
  RiListOrdered,
  RiDoubleQuotesL,
  RiCodeSSlashLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiLink,
  RiLinkUnlink,
  RiImageAddLine,
  RiYoutubeLine,
  RiAlignLeft,
  RiAlignCenter,
  RiAlignRight,
  RiSeparator,
  RiMarkPenLine,
  RiTable2,
  RiInsertRowBottom,
  RiInsertRowTop,
  RiDeleteRow,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiDeleteColumn,
  RiDeleteBin6Line,
} from 'react-icons/ri';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const isYoutubeUrl = (value: string) =>
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(value);

const isImageUrl = (value: string) =>
  /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(value);

const isVideoUrl = (value: string) =>
  /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value);

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;
  return `https://${trimmed}`;
};

const clampPercent = (value: number) => Math.max(20, Math.min(100, value));

const normalizeMediaWidth = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d+%$/.test(trimmed)) return trimmed;
  if (/^\d+px$/.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed}%`;
  return '';
};

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) =>
          element.getAttribute('data-width') ||
          element.getAttribute('width') ||
          element.style.width ||
          '100%',
        renderHTML: (attributes) => ({
          'data-width': attributes.width,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const width = normalizeMediaWidth(String(HTMLAttributes.width ?? '100%')) || '100%';
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: `width: ${width}; height: auto;`,
        class: 'my-3 rounded-xl border border-[#c4d4df] shadow-sm',
      }),
    ];
  },
});

const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      width: {
        default: '100%',
        parseHTML: (element) =>
          element.getAttribute('data-width') ||
          element.getAttribute('width') ||
          element.style.width ||
          '100%',
      },
      height: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-height') ||
          element.getAttribute('height') ||
          element.style.height ||
          null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const width = normalizeMediaWidth(String(HTMLAttributes.width ?? '100%')) || '100%';
    const height = HTMLAttributes.height ? String(HTMLAttributes.height) : null;
    const style = `width: ${width}; ${height ? `height: ${height};` : 'height: auto;'}`;

    return [
      'video',
      mergeAttributes(
        {
          controls: 'true',
          class: 'my-3 max-h-[420px] rounded-xl border border-[#c4d4df] bg-black',
          style,
          'data-width': width,
          ...(height ? { 'data-height': height } : {}),
        },
        HTMLAttributes,
      ),
    ];
  },
});

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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
      }),
      ResizableImage.configure({ allowBase64: true }),
      Youtube.configure({ controls: true }),
      Video,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Commencez la redaction de votre archive...',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[340px] rounded-b-xl border border-t-0 border-[#c4d4df] bg-white px-5 py-4 text-sm leading-relaxed text-[#1B3C53] focus:outline-none prose prose-sm max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;

    const insertImageAt = (src: string, position?: number) => {
      if (position === undefined) {
          editor.chain().focus().setImage({ src, width: 100 }).run();
        return;
      }
      editor.chain().focus().insertContentAt(position, { type: 'image', attrs: { src, width: '100%' } }).run();
    };

    const insertVideoAt = (src: string, position?: number) => {
      if (position === undefined) {
        editor.chain().focus().insertContent({ type: 'video', attrs: { src, width: '100%' } }).run();
        return;
      }
      editor.chain().focus().insertContentAt(position, { type: 'video', attrs: { src, width: '100%' } }).run();
    };

    const insertFromFiles = async (files: File[], position?: number) => {
      const mediaFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
      if (mediaFiles.length === 0) return false;

      for (const file of mediaFiles) {
        try {
          const src = await readFileAsDataUrl(file);
          if (file.type.startsWith('image/')) {
            insertImageAt(src, position);
          } else {
            insertVideoAt(src, position);
          }
        } catch {
          // Ignore unreadable dropped/pasted files.
        }
      }
      return true;
    };

    const onDrop = async (event: DragEvent) => {
      if (!event.dataTransfer) return;

      const position = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })?.pos;

      if (position === undefined) return;

      const files = Array.from(event.dataTransfer.files);
      const handledFile = await insertFromFiles(files, position);
      if (handledFile) {
        event.preventDefault();
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
        insertImageAt(url, position);
        return;
      }

      if (isVideoUrl(url)) {
        event.preventDefault();
        insertVideoAt(url, position);
      }
    };

    const onPaste = async (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      const files = Array.from(event.clipboardData.files);
      const handledFile = await insertFromFiles(files);
      if (handledFile) {
        event.preventDefault();
        return;
      }

      const pastedUrl =
        event.clipboardData.getData('text/uri-list') ||
        event.clipboardData.getData('text/plain');

      const url = pastedUrl.trim();
      if (!url) return;

      if (isYoutubeUrl(url)) {
        event.preventDefault();
        editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
        return;
      }

      if (isImageUrl(url)) {
        event.preventDefault();
        insertImageAt(url);
        return;
      }

      if (isVideoUrl(url)) {
        event.preventDefault();
        insertVideoAt(url);
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

    const onPasteEvent = (event: Event) => {
      void onPaste(event as ClipboardEvent);
    };

    dom.addEventListener('dragover', onDragOverEvent);
    dom.addEventListener('drop', onDropEvent);
    dom.addEventListener('paste', onPasteEvent);

    return () => {
      dom.removeEventListener('dragover', onDragOverEvent);
      dom.removeEventListener('drop', onDropEvent);
      dom.removeEventListener('paste', onPasteEvent);
    };
  }, [editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const addImageFromFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const src = await readFileAsDataUrl(file);
    editor.chain().focus().setImage({ src, width: 100 }).run();
  };

  const addImageByUrl = () => {
    const raw = prompt("URL de l'image");
    const url = normalizeUrl(raw ?? '');
    if (url) editor.chain().focus().setImage({ src: url, width: 100 }).run();
  };

  const addVideo = () => {
    const raw = prompt('URL Youtube');
    const url = normalizeUrl(raw ?? '');
    if (url) editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
  };

  const addVideoFromFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('video/')) return;
    const src = await readFileAsDataUrl(file);
    editor.chain().focus().insertContent({ type: 'video', attrs: { src, width: '100%' } }).run();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const raw = prompt('URL du lien', previousUrl ?? 'https://');
    const url = normalizeUrl(raw ?? '');

    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const toolbarBtn =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#c4d4df] bg-white px-2 text-[#456882] transition-colors hover:bg-[#edf4f8] disabled:cursor-not-allowed disabled:opacity-40';

  const toolbarBtnActive =
    'border-[#234C6A] bg-[#edf4f8] text-[#234C6A]';

  const blockType = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
      ? 'h2'
      : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'paragraph';

  const applyBlockType = (next: string) => {
    const chain = editor.chain().focus();
    if (next === 'h1') {
      chain.toggleHeading({ level: 1 }).run();
      return;
    }
    if (next === 'h2') {
      chain.toggleHeading({ level: 2 }).run();
      return;
    }
    if (next === 'h3') {
      chain.toggleHeading({ level: 3 }).run();
      return;
    }
    chain.setParagraph().run();
  };

  const plainTextLength = editor.getText().trim().length;
  const mediaSelected = editor.isActive('image') || editor.isActive('video');

  const currentMediaWidth = (() => {
    if (editor.isActive('image')) {
      const width = editor.getAttributes('image').width as string | undefined;
      return normalizeMediaWidth(width ?? '100%') || '100%';
    }
    if (editor.isActive('video')) {
      const width = editor.getAttributes('video').width as string | undefined;
      return normalizeMediaWidth(width ?? '100%') || '100%';
    }
    return '100%';
  })();

  const applyMediaWidth = (width: string) => {
    const normalized = normalizeMediaWidth(width);
    if (!normalized) return;
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { width: normalized }).run();
      return;
    }
    if (editor.isActive('video')) {
      editor.chain().focus().updateAttributes('video', { width: normalized }).run();
    }
  };

  const nudgeMediaWidth = (step: number) => {
    const isPercent = currentMediaWidth.endsWith('%');
    if (!isPercent) {
      applyMediaWidth('100%');
      return;
    }
    const current = Number.parseInt(currentMediaWidth, 10);
    if (Number.isNaN(current)) return;
    applyMediaWidth(`${clampPercent(current + step)}%`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#c4d4df] bg-[#f4f7fa] shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#dde8f0] bg-[#edf4f8] p-2.5">
        <select
          value={blockType}
          onChange={(event) => applyBlockType(event.target.value)}
          className="h-8 rounded-lg border border-[#c4d4df] bg-white px-2 text-xs font-medium text-[#1B3C53]"
        >
          <option value="paragraph">Paragraphe</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('bold') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras"
        >
          <RiBold className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('italic') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique"
        >
          <RiItalic className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('underline') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Souligne"
        >
          <RiUnderline className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('strike') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Barre"
        >
          <RiStrikethrough className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('highlight') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Surligner"
        >
          <RiMarkPenLine className="h-4 w-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-[#c4d4df]" />

        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive({ textAlign: 'left' }) ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Aligner a gauche"
        >
          <RiAlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive({ textAlign: 'center' }) ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Centrer"
        >
          <RiAlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive({ textAlign: 'right' }) ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Aligner a droite"
        >
          <RiAlignRight className="h-4 w-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-[#c4d4df]" />

        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('bulletList') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Liste a puces"
        >
          <RiListUnordered className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('orderedList') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Liste numerotee"
        >
          <RiListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('blockquote') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citation"
        >
          <RiDoubleQuotesL className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${toolbarBtn} ${editor.isActive('codeBlock') ? toolbarBtnActive : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloc de code"
        >
          <RiCodeSSlashLine className="h-4 w-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-[#c4d4df]" />

        <button type="button" className={toolbarBtn} onClick={addLink} title="Ajouter un lien">
          <RiLink className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Retirer le lien"
        >
          <RiLinkUnlink className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => imageInputRef.current?.click()}
          title="Uploader une image"
        >
          <RiImageAddLine className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={addImageByUrl}
          title="Ajouter une image par URL"
        >
          Img URL
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => videoInputRef.current?.click()}
          title="Uploader une video"
        >
          Video
        </button>
        <button type="button" className={toolbarBtn} onClick={addVideo} title="Ajouter une video YouTube">
          <RiYoutubeLine className="h-4 w-4" />
        </button>

        {mediaSelected && (
          <div className="ml-1 flex items-center gap-1 rounded-lg border border-[#c4d4df] bg-white px-1 py-1">
            <span className="px-1 text-[11px] font-medium text-[#456882]">Taille</span>
            {['25%', '50%', '75%', '100%'].map((size) => (
              <button
                key={size}
                type="button"
                className={`${toolbarBtn} h-7 min-w-0 px-1.5 text-[11px] ${currentMediaWidth === size ? toolbarBtnActive : ''}`}
                onClick={() => applyMediaWidth(size)}
                title={`Appliquer ${size}`}
              >
                {size}
              </button>
            ))}
            <button
              type="button"
              className={`${toolbarBtn} h-7 min-w-0 px-2 text-xs`}
              onClick={() => nudgeMediaWidth(-10)}
              title="Reduire la taille"
            >
              -
            </button>
            <button
              type="button"
              className={`${toolbarBtn} h-7 min-w-0 px-2 text-xs`}
              onClick={() => nudgeMediaWidth(10)}
              title="Augmenter la taille"
            >
              +
            </button>
          </div>
        )}

        <span className="mx-1 h-6 w-px bg-[#c4d4df]" />

        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Inserer un tableau"
        >
          <RiTable2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="Ajouter une ligne au-dessus"
          disabled={!editor.can().chain().focus().addRowBefore().run()}
        >
          <RiInsertRowTop className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Ajouter une ligne en dessous"
          disabled={!editor.can().chain().focus().addRowAfter().run()}
        >
          <RiInsertRowBottom className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().deleteRow().run()}
          title="Supprimer la ligne"
          disabled={!editor.can().chain().focus().deleteRow().run()}
        >
          <RiDeleteRow className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="Ajouter une colonne a gauche"
          disabled={!editor.can().chain().focus().addColumnBefore().run()}
        >
          <RiInsertColumnLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Ajouter une colonne a droite"
          disabled={!editor.can().chain().focus().addColumnAfter().run()}
        >
          <RiInsertColumnRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title="Supprimer la colonne"
          disabled={!editor.can().chain().focus().deleteColumn().run()}
        >
          <RiDeleteColumn className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Supprimer le tableau"
          disabled={!editor.can().chain().focus().deleteTable().run()}
        >
          <RiDeleteBin6Line className="h-4 w-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-[#c4d4df]" />

        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Inserer un separateur"
        >
          <RiSeparator className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().undo().run()}
          title="Annuler"
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <RiArrowGoBackLine className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={toolbarBtn}
          onClick={() => editor.chain().focus().redo().run()}
          title="Retablir"
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <RiArrowGoForwardLine className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = '';
          void addImageFromFile(file);
        }}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = '';
          void addVideoFromFile(file);
        }}
      />

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between border-t border-[#dde8f0] bg-[#edf4f8] px-3 py-2 text-xs text-[#456882]">
        <span>Astuce: glissez-deposez une image/video (fichier ou URL), puis utilisez "Taille" pour redimensionner.</span>
        <span>{plainTextLength} caractere(s)</span>
      </div>
    </div>
  );
};

