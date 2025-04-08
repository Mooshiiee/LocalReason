// File: MonacoEditorExample.tsx

import { FC, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const MonacoEditor: FC = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Runs once after editor is mounted
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  const getEditorValue = () => {
    const value = editorRef.current?.getValue();
    console.log(value);
  };

  return (
    <div style={{ height: "90vh" }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue={`function hello() {\n  alert('Hello world!');\n}`}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
      <button onClick={getEditorValue} style={{ marginTop: 10 }}>
        Log Editor Content
      </button>
    </div>
  );
};

export default MonacoEditorExample;
