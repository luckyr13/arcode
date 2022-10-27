<template>
  <div class="form-input">
    <label>Entry File</label>
    <select 
      :disabled="loading"
      v-model.trim="selEntryFileLocation">
      <template v-for="path of workspace.getFileTreeFilenames()" :key="path">
        <option v-if="path && path.search(/.ts$/) >= 0" :value="path">{{ path }}</option>
      </template>
    </select>
  </div>
  <div class="form-input">
    <label>Workspace Location</label>
    <select v-model.trim="selOutputLocation">
      <option value="/">/</option>
      <template v-for="path of workspace.getFileTreePaths()" :key="path">
        <option v-if="path" :value="path">{{ path }}</option>
      </template>
      
    </select>
  </div>
  <div class="error-container">
    {{ diagnostics }}
  </div>
  <div class="text-center actions">
    <button
      class="primary"
      @click="compile(selOutputLocation, selEntryFileLocation)">
      Compile
    </button>
    <br>
    <button
      class="primary"
      @click="loadNodeModulesToWorkspace()">
      Install node_modules dependencies
    </button>
  </div>
</template>
<script setup lang="ts">
import { DefaultWorkspace } from '@/components/composed/DefaultWorkspace'
import { ref } from 'vue'
import { TSTranspiler } from '@/core/TSTranspiler'
import * as ts from 'typescript'
import { createToast } from 'mosha-vue-toastify';

const props = defineProps({
  workspace: DefaultWorkspace
});

const loading = ref(false)
const selEntryFileLocation = ref('')
const selOutputLocation = ref('')
const diagnostics = ref('')

function compile(outDir: string, entryFile: string) {
  const compilerOptions = {
    noEmitOnError: true,
    strict: true,
    noImplicitOverride: true,
    target: ts.ScriptTarget.ES6,
    module: ts.ModuleKind.ES6,
    lib: [
      '/node_modules/es2015/lib.es2015.core.d.ts',
      '/node_modules/es2015/lib.dom.d.ts',
    ],
    outDir: outDir,
    esModuleInterop: true,
    removeComments: true,
    checkJs: true,
    allowJs: true,
    allowUnreachableCode: false,
    exactOptionalPropertyTypes: true,
    noImplicitReturns: true,
    noImplicitThis: true
  };
  diagnostics.value = ''
  const transpiler = new TSTranspiler(compilerOptions, props.workspace)
  const fileNames = [entryFile]

  try {
    transpiler.compile(fileNames)
    createToast(`Success!`,
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      });
  } catch(error) {
    diagnostics.value = error
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }

}


const loadNodeModulesToWorkspace = async () => {
  const emptyEvent = new Event('emptyEvent')
  const modulesInfo = {}

  // Add folders
  props.workspace.addFolder('/', 'node_modules')

  // Add es2015 types
  try {
    await loadES2015()
  } catch (error) {
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  
  // Add Verto Flex lib
};

async function loadES2015() {
  const files = [
    'assets/node-modules-sources/lib.dom.d.ts'
  ]
  const path = '/node_modules/es2015/'
  const emptyEvent = new Event('empty')
  props.workspace.addFolder('/node_modules', 'es2015')

  for (const f of files) {
    const fileNameFragments = f.split('/')
    const fileName = fileNameFragments[fileNameFragments.length - 1]
    if (props.workspace.findFileIdByName(path, fileName) >= 0) {
      continue
    } else {
      const src = 'testing'
      props.workspace.addEditor(
        emptyEvent,
        false,
        src,
        fileName,
        '/node_modules/es2015',
        false)

    }
  }

}


</script>
<style scoped>
.form-input input,
.form-input select
 {
  padding: 6px;
}
.form-input option
{
  padding: 6px;
}
button {
  width: 70%;
  height: 36px;
  line-height: 14px;
  border: 0;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  color: gray;
  cursor: default;
  background-color: rgba(0,0,0,0.1);
  border-radius: 6px;
  font-size: 12px;
  margin: 0 auto;
  margin-bottom: 6px;
}

button.primary {
  background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

button span {
  font-size: 14px;
  margin-left: 6px;
  line-height: 14px;

}

button:hover {
  background-color: rgba(0,0,0,0.3);
}

.actions {
  margin-top: 20px;
}

.error-container {
  padding:  20px;
  font-size:  12px;
  color: red;
}

</style>