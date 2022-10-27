<template>
  <h3><img src="@/assets/img/typescript.png">Typescript Transpiler</h3>
  <div class="form-input">
    <label>Entry File</label>
    <select 
      :disabled="loading"
      v-model.trim="selEntryFileLocation">
      <template v-for="path of workspace.getFileTreeFilenames()" :key="path">
        <option
          v-if="path && path.search(/.ts$/) >= 0 && path.search(/node_modules/) < 0"
          :value="path">{{ path }}</option>
      </template>
    </select>
  </div>
  <div class="form-input">
    <label>Output Location</label>
    <select v-model.trim="selOutputLocation">
      <option value="/">/</option>
      <template v-for="path of workspace.getFileTreePaths()" :key="path">
        <option v-if="path && path.search(/node_modules/) < 0" :value="path">{{ path }}</option>
      </template>
      
    </select>
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
  <div class="loader-container" v-if="loading">
    <div
      class="lds-ring lds-ring-small">
      <div></div><div></div><div></div><div></div></div>
    <span>Loading ...</span>
  </div>
  <div class="error-container" v-if="diagnostics">
    <ul v-for="(d, index) in diagnostics" :key="index">
      <li>{{ d }}</li>
    </ul>
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
const selOutputLocation = ref('/')
const diagnostics = ref([])

function compile(outDir: string, entryFile: string) {
  if (!entryFile) {
    createToast(`Please select a file!`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      })
    return
  }
  const compilerOptions = {
    noEmitOnError: true,
    strict: true,
    noImplicitOverride: true,
    target: ts.ScriptTarget.ES6,
    module: ts.ModuleKind.ES6,
    lib: [
      '/node_modules/es2015/lib.dom.d.ts',
      '/node_modules/es2015/lib.dom.iterable.d.ts',
      '/node_modules/es2015/lib.es2015.collection.d.ts',
      '/node_modules/es2015/lib.es2015.core.d.ts',
      '/node_modules/es2015/lib.es2015.generator.d.ts',
      '/node_modules/es2015/lib.es2015.iterable.d.ts',
      '/node_modules/es2015/lib.es2015.promise.d.ts',
      '/node_modules/es2015/lib.es2015.proxy.d.ts',
      '/node_modules/es2015/lib.es2015.reflect.d.ts',
      '/node_modules/es2015/lib.es2015.symbol.d.ts',
      '/node_modules/es2015/lib.es2015.symbol.wellknown.d.ts',
      '/node_modules/es2015/lib.es5.d.ts',
      '/node_modules/smartweave/contract-executor.d.ts',
    ],
    outDir: outDir,
    esModuleInterop: true,
    removeComments: true,
    checkJs: true,
    allowJs: true,
    allowUnreachableCode: false,
    exactOptionalPropertyTypes: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noImplicitAny: false
  };
  diagnostics.value = []
  const transpiler = new TSTranspiler(compilerOptions, props.workspace)
  const fileNames = [entryFile]
  loading.value = true

  try {
    diagnostics.value = transpiler.compile(fileNames)
    if (diagnostics.value.length) {
      throw new Error('Error on transpilation!');
    }
    createToast(`Success!`,
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      });
  } catch(error) {
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  loading.value = false

}


const loadNodeModulesToWorkspace = async () => {
  const emptyEvent = new Event('emptyEvent')
  const modulesInfo = {}

  diagnostics.value = []
  loading.value = true

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

  // Add smartweave types
  try {
    await loadSmartweave()
  } catch (error) {
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  
  // Add Verto Flex lib

  // Update loader
  loading.value = false
};

async function loadES2015() {
  const files = [
    'node-modules-sources/es2015/lib.dom.d.ts',
    'node-modules-sources/es2015/lib.dom.iterable.d.ts',
    'node-modules-sources/es2015/lib.es2015.collection.d.ts',
    'node-modules-sources/es2015/lib.es2015.core.d.ts',
    'node-modules-sources/es2015/lib.es2015.generator.d.ts',
    'node-modules-sources/es2015/lib.es2015.iterable.d.ts',
    'node-modules-sources/es2015/lib.es2015.promise.d.ts',
    'node-modules-sources/es2015/lib.es2015.proxy.d.ts',
    'node-modules-sources/es2015/lib.es2015.reflect.d.ts',
    'node-modules-sources/es2015/lib.es2015.symbol.d.ts',
    'node-modules-sources/es2015/lib.es2015.symbol.wellknown.d.ts',
    'node-modules-sources/es2015/lib.es5.d.ts',
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
      let src = ''
      try {
        src = await downloadContent(f)
      } catch (error) {
        createToast(`Error downloading source file.`,
        {
          type: 'danger',
          showIcon: true,
          position: 'bottom-right',
        });
        // Skip rest of the code
        continue
      }
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


async function loadSmartweave() {
  const files = [
    'node-modules-sources/smartweave/contract-executor.d.ts',
  ]
  const path = '/node_modules/smartweave/'
  const emptyEvent = new Event('empty')
  props.workspace.addFolder('/node_modules', 'smartweave')

  for (const f of files) {
    const fileNameFragments = f.split('/')
    const fileName = fileNameFragments[fileNameFragments.length - 1]
    if (props.workspace.findFileIdByName(path, fileName) >= 0) {
      continue
    } else {
      let src = ''
      try {
        src = await downloadContent(f)
      } catch (error) {
        createToast(`Error downloading source file.`,
        {
          type: 'danger',
          showIcon: true,
          position: 'bottom-right',
        });
        // Skip rest of the code
        continue
      }
      props.workspace.addEditor(
        emptyEvent,
        false,
        src,
        fileName,
        '/node_modules/smartweave',
        false)

    }
  }

}

async function downloadContent(asset: string): string {
  const c = await fetch(asset)
  if (c && c.ok) {
    return c.text()
  }
  throw new Error(c.statusText)
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
.loader-container {
  padding:  20px;
  font-size:  12px;
  text-align: center;
}
h3 {
  padding: 0px 12px 12px 12px;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 0px;
}
h3 img {
  width: 20px;
  float: left;
  margin-right: 6px;
}

</style>