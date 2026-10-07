// src/components/coding/CodeEditor.jsx
import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Play, Send, RotateCcw, Trash2, AlignLeft, Loader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/data/codingQuestionsData";

export const CodeEditor = ({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onResetCode,
  onClearCode,
  onRunCode,
  onSubmitCode,
  isRunning,
  isSubmitting,
}) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
    }
  };

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#252526] border-b border-[#333333]">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="text-xs font-semibold text-gray-400">
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-[#1e1e1e] border border-gray-700 text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Editor Utility Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFormatCode}
            title="Format Code"
            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors text-xs flex items-center gap-1"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Format</span>
          </button>
          <button
            type="button"
            onClick={onResetCode}
            title="Reset to Starter Code"
            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={onClearCode}
            title="Clear Code"
            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-[320px] relative">
        <Editor
          height="100%"
          language={currentLangObj.monacoLang}
          value={code}
          onChange={(val) => onCodeChange(val || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            formatOnType: true,
            formatOnPaste: true,
          }}
          loading={
            <div className="h-full flex items-center justify-center text-xs text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Initializing Monaco Code Editor...
            </div>
          }
        />
      </div>

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-t border-[#333333]">
        <div className="text-xs text-gray-400 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">Run</kbd> to test against sample inputs.
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Run Code
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Submit Solution
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
