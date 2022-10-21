<template>
  <div class="address-container">
    <strong class="address-label"><slot name="label"></slot></strong>
    <template v-if="isAddress">
      <img
        v-if="profileImage  && showProfileImage"
        class="avatar"
        :src="profileImage">
      <span
        class="address-nickname"
        v-if="nickname && showHandleInAddress">
        {{ nickname }} 
      </span>
      <span v-if="isAddress && !showHandleOnly" class="address-tx-add">
        {{ ellipsis(address) }} 
      </span>
    </template>
    <span v-if="!isAddress" class="address-tx">
      {{ ellipsis(address) }} 
    </span>
    <a 
      class="btn-small"
      target="_blank"
      v-if="isAddress && showLinks"
      :href="`https://viewblock.io/arweave/address/${address}`">
      Open in Viewblock
    </a>
    <a 
      class="btn-small"
      target="_blank"
      v-if="!isAddress && showLinks"
      :href="`https://viewblock.io/arweave/tx/${address}`">
      Open in Viewblock
    </a>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue' 
import blankProfileImg from '@/assets/img/blank-profile.png'
import Account from 'arweave-account'

const account = new Account()
const props = defineProps({
  address: String,
  isAddress: Boolean,
  showProfileImage: Boolean,
  showHandleInAddress: Boolean,
  showHandleOnly: Boolean,
  showLinks: Boolean
})
const verified = ref(false)
const profileImage = ref(blankProfileImg)
const nickname = ref('')

onMounted(async () => {
  try {
    const user = await account.get(props.address)
    if (user) {
      nickname.value = user.handle ? user.handle : ''
      profileImage.value = user.profile && user.profile.avatarURL ?
        user.profile.avatarURL : blankProfileImg
    }
  } catch (err) {
    console.error('arweaveAddress', err)
  }
});

function ellipsis(s: string) {
  const minLength = 12;
  const sliceLength = 5;

  if (!s || typeof(s) !== 'string') {
    return '';
  }

  return s && s.length < minLength ? s : `${s.substring(0, sliceLength)}...${s.substring(s.length - sliceLength, s.length)}`;
}

</script>
<style scoped>
a {
  color: inherit;
  cursor: pointer;
  line-height: 32px;
}

.address-container {
  justify-content: inherit;
}

@media (min-width: 600px) {
  .address-container {
    display: flex;
    white-space: nowrap;
    overflow-wrap: break-word;
  }

}

.address-tx {
  margin-right: 10px;
  line-height: 32px;
  margin-left: 6px;
  cursor: normal;
}
.address-tx-add {
  margin-right: 10px;
  line-height: 32px;
  margin-left: 6px;
  cursor: pointer;

}
.address-label {
  line-height: 32px;
}
.address-nickname {
  line-height: 32px;
  margin-left: 6px;
  font-weight: bold;
  cursor: pointer;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  vertical-align: middle;
  margin-left: 6px;
  cursor: pointer;
}
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

.btn-small {
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

.btn-small {
  padding: 0px 6px 0px 6px !important;
  font-size: 8px;
  border: 0;
  box-shadow: 0px 0px 0px 0px;
}

.btn-small:hover {
  text-shadow: 2px 2px 6px var(--color-neon-green);
}

</style>