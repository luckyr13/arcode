<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div
        :class="{
            'modal-container': true,
            'modal-container-big': modalSize === 'big',
            'modal-container-medium': modalSize === 'medium'  
          } ">
        <div class="modal-header">
          <slot name="header">
            default header
          </slot>
        </div>
        <div class="modal-body">
          <slot name="body">
            default body
          </slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button class="modal-button" @click="$emit('close')">
              Close
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line
const props = defineProps({
  modalSize: String
});
</script>

<style scoped lang="scss">
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 400px;
  max-height: 600px;
  overflow-y: auto;
  margin: 0px auto;
  padding: 20px 20px;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  font-family: Helvetica, Arial, sans-serif;
}

.modal-container-big {
  max-width: 800px !important;

}
.modal-container-medium {
  max-width: 600px !important;

}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
  max-height: 400px;
  overflow-y: auto;
}

.modal-button {
  display: block;
  margin-top: 1rem;
  padding: 10px;
  background-color: #000;
  color: #FFF;
  border: 0;
  cursor: pointer;
}
.modal-button:hover {
  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.5);
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.5s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>