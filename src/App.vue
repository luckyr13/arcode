<template>
  <router-view/>
</template>

<script setup lang="ts">
import 'mosha-vue-toastify/dist/style.css'
import 'tippy.js/dist/tippy.css';
import '@vscode/codicons/dist/codicon.css';
</script>

<style lang="scss">

#app {
  font-family: 'Open Sans', sans-serif;
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}


button {
  font-family: 'Open Sans', sans-serif;
}

.tippy-box {
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
}
/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/*
  Loader
*/
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.lds-ring-small {
  width: 32px !important;
  height: 32px !important;
}
.lds-ring-small div {
  width: 20px !important;
  height: 20px !important;
  margin: 4px !important;
  border: 4px solid !important;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.modal-button {
  display: inline;
  margin-top: 1rem;
  padding: 10px;
  background-color: rgba(55, 55, 55, 1);
  color: #FFF;
  border: 0;
  margin-left: 8px;
  cursor: pointer;
  border-radius: 4px;
}
.modal-button:hover {
  cursor: pointer;
  background-color: rgba(55, 55, 55, 0.5);
}
.modal-btn-icon {
  font-size: 15px;
  margin-left: 4px;
}
.modal-button span {
  margin-left: 4px;
}
.modal-button-primary {
  background-color: var(--app-toolbar-panel-title-bgcolor);
  color:  var(--app-toolbar-panel-title-color);
}
.modal-button-primary:hover {
  background-color: #000;
  color: #FFF;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-footer {
  width: 100%;
}
.form-radio {
  padding: 10px;
}
.form-radio label {
  font-size: 12px;
  margin-bottom: 4px;
  display: block;
}
.form-radio input
 {
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--app-background-color);
  background: inherit;
  color: inherit;
}

.form-input {
  padding: 10px;
}
.form-input input,
.form-input select,
.form-input textarea
 {
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--app-background-color);
  background: inherit;
  color: inherit;
}
.form-input option
 {
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--app-background-color);
  background: inherit;
  color: #000;
}

.form-input label {
  font-size: 12px;
  margin-bottom: 4px;
  display: block;
}

.title-icon {
  float: left;
  line-height: 32px;
  font-size: 32px !important;
}
.small-txt {
  font-size: 12px;
}
.small-txt a {
  color: inherit;
}
</style>
