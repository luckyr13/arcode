<template>
  <div class="body fadeIn">
    <h3 class="logo">ArCode Gallery</h3>
    <p
      v-if="!loading"
      class="more-results text-right">
      <a 
        :disabled="loadingMore"
        :class="{ btn: true, btnDisabled: loadingMore }"
        href="/">
        GO BACK TO ArCode
      </a>
    </p>
    <div v-if="loading" class="loading text-center">Loading ...</div>
    <main v-if="elements.length">
      <CardList :elements="elements"></CardList>
    </main>
    <p 
      v-if="!loading && (!elements || !elements.length)"
      class="text-center">
      No results.
    </p>
    <p
      v-if="!loading && showLoadMore"
      class="more-results">
      <button 
        :disabled="loadingMore"
        :class="{ btn: true, btnDisabled: loadingMore }"
        @click="loadMore()">
        LOAD MORE RESULTS
      </button>
    </p>
  </div>
</template>
<script setup lang="ts">
import CardList from '@/components/composed/CardList.vue'
import { onMounted, ref } from 'vue'
import { WorkspaceList } from '@/core/WorkspaceList'
import { ArweaveWrapper } from '@/core/ArweaveWrapper'
import { createToast } from 'mosha-vue-toastify'

const elements = ref([])
const arweaveWrapper = new ArweaveWrapper()
const workspaceListClass = new WorkspaceList(arweaveWrapper.arweave)
const loading = ref(false)
const loadingMore = ref(false)
const showLoadMore = ref(false)

const loadMore = async () => {
  loadingMore.value = true;
  try {
    const tmpRes = await workspaceListClass.nextResults()

    if (tmpRes && tmpRes.length) {
      showLoadMore.value = true
      elements.value.push(...tmpRes)
    } else {
      showLoadMore.value = false
    }
  } catch (error) {
    showLoadMore.value = false
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      })
  }
  loadingMore.value = false;
}

onMounted(async () => {
  const limit = 5
  let maxHeight = 0
  loading.value = true
  try { 
    maxHeight = await arweaveWrapper.getCurrentHeight()
    elements.value = await workspaceListClass.getList(limit, maxHeight)

    if (elements.value && elements.value.length) {
      showLoadMore.value = true
    }
  } catch (error) {
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      })
  }
  loading.value = false;
})
</script>
<style scoped>
:root {
  --color-background: #1E1E1E;
  --color-text: #FFFFFF;
  --card-color-background: #1E1E1E;
  --card-color-text: #FFFFFF;
  
  --color-neon-pink: #FF10F0;
  --color-neon-green: #39ff14;
  --color-neon-green-rgba: rgba(57,255,20,0.2);
  --color-neon-pink-rgba: rgba(255,16,240,0.2);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-family: 'Press Start 2P', cursive;
}

.body {
  min-height: 100vh;
  color: var(--color-text);
  background: var(--color-background);
  background-image: url('@/assets/img/matrix.webp');
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 20px;
}

.loading {
  color:  var(--color-neon-pink);
}
.more-results {
  text-align: center;
  padding-bottom: 32px;
  padding-top: 32px;
}

.logo {
  font-size:  42px;
  text-shadow: 4px 4px 12px var(--color-neon-green);
  padding-top: 32px;
  margin-bottom: 42px;
  text-align: center;
}

.text-center {
  text-align: center;
}

.actions {
  text-align: right;
}

.btn, .btn-small {
  padding: 14px;
  background-color: transparent;
  color: #FFF;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  border-radius: 12px;
  border: 2px solid var(--color-neon-pink);
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  box-shadow: 0px 0px 6px 6px var(--color-neon-pink-rgba);
  text-shadow: 2px 2px 6px var(--color-neon-pink);
}
.btn:hover {
  border: 2px solid var(--color-neon-green);
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  box-shadow: 0px 0px 6px 6px var(--color-neon-green-rgba);
  text-shadow: 2px 2px 6px var(--color-neon-green);
}

.btn-small {
  padding: 0px 6px 0px 6px !important;
  font-size: 8px;
  border: 0;
  box-shadow: 0px 0px 0px 0px;
}

.btn-small:hover {
  text-shadow: 2px 2px 6px var(--color-neon-green);
}

.btnDisabled, .btnDisabled:hover {
  color: grey;
  border: 2px solid grey !important;
  box-shadow: 0px 0px 6px 6px grey !important;
  text-shadow: 2px 2px 6px grey !important;
  cursor: default;
}

.mosha__toast__content__text {
  font-size: 10px !important;
}


/* FADE IN */
.fadeIn {
  -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
  -moz-animation: fadein 1s; /* Firefox < 16 */
  -ms-animation: fadein 1s; /* Internet Explorer */
  -o-animation: fadein 1s; /* Opera < 12.1 */
  animation: fadein 1s;

}

.fadeInTransparent {
  -webkit-animation: fadeintransparent 1s; /* Safari, Chrome and Opera > 12.1 */
  -moz-animation: fadeintransparent 1s; /* Firefox < 16 */
  -ms-animation: fadeintransparent 1s; /* Internet Explorer */
  -o-animation: fadeintransparent 1s; /* Opera < 12.1 */
  animation: fadeintransparent 1s;

}

/* FADE IN */
@keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Internet Explorer */
@-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Opera < 12.1 */
@-o-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* /FADE IN */


/* FADE IN */
@keyframes fadeintransparent {
    from { opacity: 0; }
    to   { opacity: 0.95; }
}

/* Firefox < 16 */
@-moz-keyframes fadeintransparent {
    from { opacity: 0; }
    to   { opacity: 0.95; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadeintransparent {
    from { opacity: 0; }
    to   { opacity: 0.95; }
}

/* Internet Explorer */
@-ms-keyframes fadeintransparent {
    from { opacity: 0; }
    to   { opacity: 0.95; }
}

/* Opera < 12.1 */
@-o-keyframes fadeintransparent {
    from { opacity: 0; }
    to   { opacity: 0.95; }
}

/* /FADE IN */

</style>