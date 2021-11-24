<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center">
      <img class="logo" alt="arCode" src="@/assets/logo.png">
      <h4 class="text-center">
        arCode IDE
      </h4>
    </div>
    <div class="workspace">
      <div class="tabs"></div>
      <div id="arcode-code-editor" class="editor"></div>
    </div>
  </div>
  
</template>

<script lang="ts">
import { defineComponent, onMounted} from 'vue';
import {EditorState} from "@codemirror/state";
import {EditorView, keymap} from "@codemirror/view";
import {defaultKeymap} from "@codemirror/commands";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { bracketMatching } from "@codemirror/matchbrackets";
import {javascript} from "@codemirror/lang-javascript";
import { lineNumbers } from "@codemirror/gutter";

export default defineComponent({
  name: 'Workspace',
  setup() {

    let startState = EditorState.create({
      doc: "Hello World",
      extensions: [
        keymap.of(defaultKeymap),
        bracketMatching(),
        defaultHighlightStyle.fallback,
        javascript(),
        lineNumbers(),
        EditorView.lineWrapping,
        EditorView.theme({}, { dark: true })
      ]
    })

    let view = new EditorView({
      state: startState
    })

    
    onMounted(() => {
      const editor = view.dom;
      const editorContainer = document.getElementById('arcode-code-editor');
      if (editorContainer !== null) {
        editorContainer.append(editor);
      }
    })
    

    return {
      view,
      startState
    }
  }
});
</script>

<style scoped lang="scss">
$workspace-tabs-height: 35px;
.logo {
  width: 20%;
}

.arcode-workspace {
  height: 100%;
  position: relative;
}
.workspace-bg {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  z-index: 0;
}

.workspace {
  height: 100%;
  width: 100%;
  z-index: 10;
  position: absolute;
  z-index: 0;
}

.workspace .tabs{
  height: $workspace-tabs-height;
}


.workspace .editor{
  height: calc(100% - $workspace-tabs-height);
  overflow-y: auto;
}
</style>
