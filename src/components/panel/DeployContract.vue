<template>
<div class="arcode-main-toolbar-panel-title">
  Deploy contract
</div>
<div class="deploy-container" v-if="mainAddress && !deployedContractTX">
  <div class="form-input">
    <label>Network</label>
    <select 
      :disabled="loadingDeployContract" 
      v-model.trim="selNetwork">
      <option v-for="(nItem, nIndex) in networks" v-bind:key="nIndex" :value="nIndex">{{ nItem.host }} ({{ nIndex }})</option>
    </select>
  </div>
  <div class="form-input">
    <label>Wallet</label>
    <input type="text" disabled :value="mainAddress">
  </div>
  <div class="form-input">
    <label>Method</label>
    <select 
      @change="resetForms()"
      :disabled="loadingDeployContract" 
      v-model.trim="selDeployMethod">
      <option value="contract-src-file">Contract-Src from File</option>
      <option value="contract-src-tx">Contract-Src from TX</option>
    </select>
  </div>
  <template v-if="selDeployMethod === 'contract-src-file'">
    <div class="form-input">
      <label>Contract Source</label>
      <select 
        :disabled="loadingDeployContract"
        v-model.trim="selDeployFileContractLocation">
        <template v-for="path of workspace.getFileTreeFilenames()" :key="path">
          <option v-if="path && path.search(/.js$/) >= 0" :value="path">{{ path }}</option>
        </template>
      </select>
    </div>
    <div class="form-input">
      <label>Contract Initial State</label>
      <select
        :disabled="loadingDeployContract"
        v-model.trim="selDeployFileStateLocation">
        <template v-for="path of workspace.getFileTreeFilenames()" :key="path">
          <option v-if="path && path.search(/.json$/) >= 0" :value="path">{{ path }}</option>
        </template>
      </select>
    </div>
    <h5 class="title-tags">Tags</h5>
    <p class="no-results" v-if="!tagsList1.length">No tags.</p>
    <div class="data-input-list" v-for="(tL1, index1) of tagsList1" :key="index1">
      <div class="form-input col-key">
        <label>Name</label>
        <input 
          :disabled="loadingDeployContract"
          type="text" v-model.trim="tL1.name">
      </div>
      <div class="form-input col-value">
        <label>Value</label>
        <input 
          :disabled="loadingDeployContract"
          type="text" v-model.trim="tL1.value">
      </div>
      <div class="form-input col-action">
        <DefaultIcon 
          @click="removeTag(index1, tagsList1)"
          class="icon-action"
          icon="codicon-trash" />
      </div>
    </div>
    <h5 class="title-tags">Balance</h5>
    <ul class="deploy-menu">
      <li>
        <span class="span-balance">{{ balance }}</span> AR
      </li>
      <li class="text-right">
        <a v-if="onLocalnetByString(selNetwork)"
          class="link" @click="testnetMintTokens()">+ Mint 1 AR</a>
      </li>
      <li>
        <label class="">
          <input
            :disabled="onLocalnetByString(selNetwork)"
            v-model.trim="txtUseArweaveGw" 
            type="checkbox"> useArweaveGw (Instead of Warp Gw)
        </label>
      </li>
      <li>
        <label class="">
          <input
            :disabled="onLocalnetByString(selNetwork)"
            v-model.trim="txtDisableBundling" 
            type="checkbox"> disableBundling (Disable Warp Sequencer and deploy contract directly to Arweave)
        </label>
      </li>
      <li class="text-center-f">
        <button
          :class="{primary: !loadingDeployContract}" 
          :disabled="loadingDeployContract"
          @click="addTag('', '', tagsList1)">
          <DefaultIcon class="icon-btn" icon="codicon-tag" /><span>Add Tag</span>
        </button>
      </li>
      <li class="text-center-f">
        <button
          :class="{primary: (selDeployFileStateLocation && selDeployFileContractLocation) && !loadingDeployContract}" 
          :disabled="(!selDeployFileStateLocation || !selDeployFileContractLocation) || loadingDeployContract"
          @click="deployContract(
            selDeployFileStateLocation,
            selDeployFileContractLocation,
            workspace,
            tagsList1)">
          <DefaultIcon class="icon-btn" icon="codicon-rocket" /><span>Deploy Now</span>
        </button>
      </li>
    </ul>
  </template>
  <template v-else-if="selDeployMethod === 'contract-src-tx'">
    <div class="form-input">
      <label>Contract Source TX</label>
      <input 
        :disabled="loadingDeployContract"
        v-model.trim="txtDeployFileContractLocationByTx">
    </div>
    <div class="form-input">
      <label>New Contract Initial State</label>
      <select
        :disabled="loadingDeployContract"
        v-model.trim="selDeployFileStateLocation2">
        <template v-for="path of workspace.getFileTreeFilenames()" :key="path">
          <option v-if="path && path.search(/.json$/) >= 0" :value="path">{{ path }}</option>
        </template>
      </select>
    </div>
    <h5 class="title-tags">Tags</h5>
    <p class="no-results" v-if="!tagsList2.length">No tags.</p>
    <div class="data-input-list" v-for="(tL2, index2) of tagsList2" :key="index2">
      <div class="form-input col-key">
        <label>Name</label>
        <input 
          :disabled="loadingDeployContract"
          type="text" v-model.trim="tL2.name">
      </div>
      <div class="form-input col-value">
        <label>Value</label>
        <input 
          :disabled="loadingDeployContract"
          type="text" v-model.trim="tL2.value">
      </div>
      <div class="form-input col-action">
        <DefaultIcon 
          @click="removeTag(index2, tagsList2)"
          class="icon-action"
          icon="codicon-trash" />
      </div>
    </div>
    <h5 class="title-tags">Balance</h5>
    <ul class="deploy-menu">
      <li>
        <span class="span-balance">{{ balance }}</span> AR
      </li>
      <li class="text-right">
        <a v-if="onLocalnetByString(selNetwork)"
          class="link" @click="testnetMintTokens()">+ Mint 1 AR</a>
      </li>
      <li>
        <label class="">
          <input
            :disabled="onLocalnetByString(selNetwork)"
            v-model.trim="txtUseArweaveGw2" 
            type="checkbox"> useArweaveGw (Instead of Warp Gw)
        </label>
      </li>
      <li>
        <label class="">
          <input  
            :disabled="onLocalnetByString(selNetwork)"
            v-model.trim="txtDisableBundling2" 
            type="checkbox"> disableBundling (Disable Warp Sequencer and deploy contract directly to Arweave)
        </label>
      </li>
      <li class="text-center-f">
        <button
          :class="{primary: !loadingDeployContract}" 
          :disabled="loadingDeployContract"
          @click="addTag('', '', tagsList2)">
          <DefaultIcon class="icon-btn" icon="codicon-tag" /><span>Add Tag</span>
        </button>
      </li>
      <li class="text-center-f">
        <button
          :class="{primary: (selDeployFileStateLocation2 && txtDeployFileContractLocationByTx) && !loadingDeployContract}" 
          :disabled="(!selDeployFileStateLocation2 || !txtDeployFileContractLocationByTx) || loadingDeployContract"
          @click="deployContractFromTX(selDeployFileStateLocation2, txtDeployFileContractLocationByTx, workspace, tagsList2)">
          <DefaultIcon class="icon-btn" icon="codicon-rocket" /><span>Deploy Now</span>
        </button>
      </li>
    </ul>
  </template>
  
</div>
<div class="deploy-container text-center-f" v-else-if="!mainAddress">
  <DefaultIcon class="icon-deploy-login" icon="codicon-lock" />
  <p class="text-center no-results">Please login first!</p>
</div>
<div class="deploy-container text-center-f" v-else-if="deployedContractTX">
  <DefaultIcon class="icon-deploy-login success" icon="codicon-check" />
  <h3>Contract deployed successfully!</h3>
  <p class="text-center">
    <strong>Contract TX:</strong><br>
    <span>{{ deployedContractTX.contractTxId }}</span>
  </p>
  <p class="text-center">
    <strong>Contract Src TX:</strong><br>
    <span>{{ deployedContractTX.srcTxId }}</span>
  </p>
  <p>
    <a class="link" :href="arcodePreviewUrl(deployedContractTX.contractTxId)" target="_blank">Preview in ArCode</a>
  </p>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onMounted } from 'vue'
import DefaultIcon from '@/components/atomic/DefaultIcon'
import { ArweaveWrapper, arweaveNetworks, defaultNetwork, onLocalnetByString } from '@/core/ArweaveWrapper'
import { WarpContracts} from '@/core/WarpContracts'
import { ContractData, ArWallet, 
  FromSrcTxContractData, Tags } from 'warp-contracts';
import { createToast } from 'mosha-vue-toastify'
import { DefaultWorkspace } from '@/components/composed/DefaultWorkspace'

const networks = computed(() => {
  return arweaveNetworks
});
const selDeployFileContractLocation = ref('')
const txtDeployFileContractLocationByTx = ref('')
const selDeployFileStateLocation = ref('')
const selDeployFileStateLocation2 = ref('')
const txtUseArweaveGw = ref(false);
const txtDisableBundling = ref(false);
const txtUseArweaveGw2 = ref(false);
const txtDisableBundling2 = ref(false);
const deployedContractTX = ref('')
const loadingDeployContract = ref(false)
const selDeployMethod = ref('contract-src-file')
const defaultSelNetwork = props.networkParam ? props.networkParam : defaultNetwork
const selNetwork = ref(defaultSelNetwork)
const prevNetwork = ref(selNetwork.value)
const props = defineProps({
  iframe: Boolean,
  workspace: Object,
  tokenState: Object,
  login: Object,
  networkParam: String
});
const tagsList1 = reactive<Tags>([])
const tagsList2 = reactive<Tags>([])
const mainAddress = ref(props.login.mainAddress)
const balance = ref('0')
const isBridgeActive = ref(false)
const arcodePreviewUrl = (tx) => {
  return `https://arcode.studio/#/${tx}?network=${selNetwork.value}`
};

const deployContract = async (
  statePath: string,
  contractSrcPath: string,
  workspace: DefaultWorkspace,
  tags: Tags) => {
  let contractSrc = ``
  let initStateSrc = ``
  loadingDeployContract.value = true
  try {
    const useArweaveGw = txtUseArweaveGw.value
    const customGw = ''
    const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
    const arweave = arweaveWrapper.arweave
    const warpContracts = new WarpContracts(arweave, customGw, useArweaveGw)

    // Iframe fix
    const loginMethod = props.login.method
    if (isBridgeActive.value && (loginMethod === 'arconnect' || loginMethod === 'finnie')) {
      props.login.hijackArweavePostAPI(arweave)
    }
    const stateName2 = statePath.split('/')[statePath.split('/').length - 1]
    let statePath2 = statePath.split('/').splice(0, statePath.split('/').length - 1).join('/')
    if (statePath2 === '') {
      statePath2 = '/'
    }
    const stateFileId = workspace.findFileIdByName(statePath2, stateName2)
    const iState = workspace.editors.findIndex(ed => ed.id == stateFileId)
  
    const contractName2 = contractSrcPath.split('/')[contractSrcPath.split('/').length - 1]
    let contractPath2 = contractSrcPath.split('/').splice(0, contractSrcPath.split('/').length - 1).join('/')
    if (contractPath2 === '') {
      contractPath2 = '/'
    }
    const contractFileId = workspace.findFileIdByName(contractPath2, contractName2)
    const iContract = workspace.editors.findIndex(ed => ed.id == contractFileId)
    
    
    if (iState < 0 || iContract < 0) {
      throw Error(`Invalid state or contract id ${iState} ${iContract}`)
    }
    contractSrc = workspace.editors[iContract].view.state.doc.toString()
    initStateSrc = workspace.editors[iState].view.state.doc.toString()

    // Validate initial state
    try {
      JSON.parse(initStateSrc)
    } catch (error) {
      throw Error(`Invalid state: ${error} file ${stateName2}`)
    }

    const wallet: ArWallet = props.login.key
    
    const contract: ContractData = {
      wallet: wallet,
      initState: initStateSrc,
      src: contractSrc,
      tags: tags
    }
    const disableBundling = txtDisableBundling.value

    // Check balance
    if (balance.value == 0 && disableBundling ||
        balance.value == 0 && warpContracts.onLocalnet(arweave)) {
      throw Error('Not enough balance! You need to have at least some AR to use this feature.')
    }

    // Use signer?
    if (!disableBundling) {
      contract.wallet = await props.login.getUserSigner()
    }

    const tx = await warpContracts.createContract(contract, disableBundling)

    if (tx) {
      deployedContractTX.value = tx
      createToast('Contract deployed!',
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      })

      if (warpContracts.onLocalnet(arweave)) {
        // Call mine 
        const miningRes = await arweaveWrapper.arlocalMine()
        console.log('Confirmed tx: ', miningRes)
        createToast('Transaction confirmed!',
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        })
      }

    } else {
      throw Error('Error creating tx', tx)
    }
    
    
  } catch (err) {
    let error = `${err}`
    if (typeof(err) === 'object' &&
        Object.prototype.hasOwnProperty.call(err, 'message')) {
      error = err.message
    }
    createToast(error,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    })
    console.error('deployContract', err)
  }
  

  loadingDeployContract.value = false
};



const deployContractFromTX = async (
  statePath: string, 
  contractSrcTX: string,
  workspace: DefaultWorkspace,
  tags: Tags) => {
  let initStateSrc = ``
  loadingDeployContract.value = true
  try {
    
    const useArweaveGw = txtUseArweaveGw2.value
    const customGw = ''
    const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
    const arweave = arweaveWrapper.arweave
    const warpContracts = new WarpContracts(arweave, customGw, useArweaveGw)
    // Iframe fix
    const loginMethod = props.login.method
    if (isBridgeActive.value && (loginMethod === 'arconnect' || loginMethod === 'finnie')) {
      props.login.hijackArweavePostAPI(arweave.arweave)
    }

    const stateName2 = statePath.split('/')[statePath.split('/').length - 1]
    let statePath2 = statePath.split('/').splice(0, statePath.split('/').length - 1).join('/')
    if (statePath2 === '') {
      statePath2 = '/'
    }
    const stateFileId = workspace.findFileIdByName(statePath2, stateName2)
    const iState = workspace.editors.findIndex(ed => ed.id == stateFileId)
    const wallet: ArWallet = props.login.key
    if (iState < 0 || !contractSrcTX) {
      throw Error(`Invalid state or contract id ${iState} ${contractSrcTX}`)
    }
    initStateSrc = workspace.editors[iState].view.state.doc.toString()
    
    const contract: FromSrcTxContractData = {
      wallet: wallet,
      initState: initStateSrc,
      srcTxId: contractSrcTX,
      tags: tags
    }
    
    const disableBundling = txtDisableBundling2.value

    // Check balance
    if (balance.value == 0 && disableBundling ||
        balance.value == 0 && warpContracts.onLocalnet(arweave)) {
      throw Error('Not enough balance! You need to have at least some AR to use this feature.')
    }

    // Use signer?
    if (!disableBundling) {
      contract.wallet = await props.login.getUserSigner()
    }

    const tx = await warpContracts.createContractFromTX(contract, disableBundling)
    
    if (tx) {
      deployedContractTX.value = tx
      createToast('Contract deployed!',
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      })

      if (warpContracts.onLocalnet(arweave)) {
        // Call mine 
        const miningRes = await arweaveWrapper.arlocalMine()
        console.log('Confirmed tx: ', miningRes)
        createToast('Transaction confirmed!',
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        })
      }

    } else {
      throw Error('Error creating tx', tx)
    }
    
    
  } catch (err) {
    let error = `${err}`
    if (typeof(err) === 'object' &&
        Object.prototype.hasOwnProperty.call(err, 'message')) {
      error = err.message
    }
    createToast(error,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    })
  }
  

  loadingDeployContract.value = false
};

const removeTag = (index: number, tags: Tags) => {
  tags.splice(index, 1)
};

const addTag = (key: string, value: string, tags: Tags) => {
  tags.push({ key, value })
};

const testnetMintTokens = async (qty='1000000000000') => {
  try {
    const net = networks.value[selNetwork.value]
    const url = `${net.protocol}://${net.host}:${net.port}/mint/${mainAddress.value}/${qty}`
    const res = await fetch(url)
    if (res.status === 200) {
    createToast('Tokens minted!',
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      })
    } else {
      console.log('Error:', res)
      createToast('Tokens not minted!',
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      })
    }

    // Update balance after 1 second 
    window.setTimeout(async () => {
      const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
      balance.value = await arweaveWrapper.arweave.wallets.getBalance(mainAddress.value)
      balance.value = arweaveWrapper.winstonToAr(balance.value)
    }, 1500)


  } catch (err) {
    createToast(err,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
  }
};

onMounted(async () => {
  // Get wallet balance
  if (mainAddress.value) {
    balance.value = 0
    try {
      const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
      balance.value = await arweaveWrapper.arweave.wallets.getBalance(mainAddress.value)
      balance.value = arweaveWrapper.winstonToAr(balance.value)
      prevNetwork.value = selNetwork.value
    } catch (err) {
      createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      })
    }
  }

  // Check ifarme conditions
  isBridgeActive.value = false
  if (props.iframe) {
    // Start handshake with parent 
    try {
      isBridgeActive.value = await props.login.isBridgeActive()

    } catch (err) {
      createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
    }
  }
});

watchEffect(async () => {
  // Balance for Method 1
  if (mainAddress.value && selNetwork.value != prevNetwork.value) {
    balance.value = 0
    try {
      const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
      balance.value = await arweaveWrapper.arweave.wallets.getBalance(mainAddress.value)
      balance.value = arweaveWrapper.winstonToAr(balance.value)
      prevNetwork.value = selNetwork.value;

      resetForms();
    } catch (err) {
      createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
    }
  }
});

const resetForms = () => {
  selDeployFileContractLocation.value = ''
  txtDeployFileContractLocationByTx.value = ''
  selDeployFileStateLocation.value = ''
  selDeployFileStateLocation2.value = ''
  deployedContractTX.value = ''
  loadingDeployContract.value = false
  txtUseArweaveGw.value = false
  txtDisableBundling.value = false
  txtUseArweaveGw2.value = false
  txtDisableBundling2.value = false

  if (onLocalnetByString(selNetwork.value)) {
    txtDisableBundling2.value = true
    txtDisableBundling.value = true
  }
};


</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
  height: 28px;
  line-height: 28px;
  font-size: 12px;
  padding-left: 20px;
}

.deploy-container {
  padding: 10px;
  text-align: left;
}
.deploy-menu {
  padding: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: 12px;
}
.deploy-menu li {
  padding: 0px;
  list-style: none;
  text-align: left;
  margin-top: 10px;
}

.deploy-menu li p {
  margin-bottom: 20px;
}

.deploy-menu li button {
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
  font-size: 14px;
}

.deploy-menu li button.primary {
  background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.deploy-menu li button span {
  font-size: 14px;
  margin-left: 6px;
  line-height: 14px;

}

.deploy-menu li button:hover {
  background-color: rgba(0,0,0,0.3);
}


.form-input input,
.form-input select
 {
  padding: 6px;
}
.form-input option
 {
  padding: 6px;
}

.icon-btn {
  display: inline !important;
  line-height: 14px;
  font-size: 14px;
  float: right;
}

.icon-deploy-login {
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: 36px !important;
}

.success {
  color: #58EB2B;
}

.title-tags {
  margin: 0px 0px;
}

.col-key {
  float: left;
  width: 42%;
}
.col-value {
  float: left;
  width: 45%;
}
.col-action {
  float: left;
  width: 10%;
  height: 32px;
}
.icon-action {
  padding: 22px 0;
  font-size: 16px !important;
  cursor: pointer;
}

.data-input-list {
  min-height: 76px;
}
.no-results {
  font-size: 12px;
}
.link {
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  color: inherit;
}
.text-center-f {
  text-align: center !important;
}
.span-balance{
  font-size: 16px;
}
.usage-fee-txt {
  color: red !important;
}
</style>