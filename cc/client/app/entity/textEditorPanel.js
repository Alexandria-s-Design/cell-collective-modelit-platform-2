import Entity from "./Entity";

class TextEditorPanel extends Entity {}

Entity.init(
  { TextEditorPanel },
  {
    name: { maxLength: 255 },
    index: null,
    editorText: null,
    styling: { defaultVal: false },
  },
);

export default TextEditorPanel;
