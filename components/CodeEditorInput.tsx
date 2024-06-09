'use client';

import { useCallback, useRef, type FC } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from '@monaco-editor/react';
import { CODE_DEFAULT_TEMPLATE } from "@/schemas/function";
import { cn } from "@lib/utils";

const DynamicCodeEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type CodeEditorInputProps = {
  id?: string;
  className?: string;
  onChange?: (value?: string) => void;
  value?: string;
  readOnly?: boolean;
};

const CodeEditorInput: FC<CodeEditorInputProps> = (props) => {
  const {
    id,
    className,
    onChange = () => void 0,
    value = CODE_DEFAULT_TEMPLATE,
    readOnly = false
  } = props;
  const editorRef = useRef<Parameters<OnMount> | null>(null);
  const classes = cn(className);

  const onEditorMount = useCallback<OnMount>((editor, monaco) => {
    editorRef.current = [editor, monaco];

    // Disable the default save (CTRL+S or CMD+S) behavior
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // No operation (disable save)
    });

    // Disable other unnecessary commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      // No operation (disable command palette)
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      // No operation (disable find)
    });
  }, []);

  return (
    <DynamicCodeEditor
      id={ id || 'code-editor' }
      height="70vh"
      defaultLanguage="javascript"
      theme='vs-dark'
      keepCurrentModel={ false }
      className={ classes }
      onChange={ onChange }
      options={{
        readOnly,
        lineNumbers: 'on',
        minimap: { enabled: false },
        fontSize: 12,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        renderLineHighlight: 'none',
        automaticLayout: true,
        folding: false,
        contextmenu: false,
        links: false,
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        tabCompletion: 'off',
        acceptSuggestionOnEnter: 'off',
        padding: { top: 10, bottom: 10 },
        // @ts-ignore
        lightbulb: { enabled: 'off' },
        codeLens: false,
        fixedOverflowWidgets: false,
        hover: { enabled: false },
      }}
      defaultValue={ value }
      onMount={ onEditorMount }
    />
  );
};

export default CodeEditorInput;
