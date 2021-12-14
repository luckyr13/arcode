<template>
<div class="arcode-console-tab" @click="toggleConsole()">
	<Icon icon="codicon:terminal" /> <span>Console</span>
</div>
<div id="arcode-console-container" :class="{ active: showConsole }"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

var terminal = new Terminal({cursorBlink: true});
const fitAddon = new FitAddon();
const showConsole = ref(false);

const initConsole = () => {
	const containerElement = document.getElementById('arcode-console-container');
	const lineData = '';
	terminal.loadAddon(fitAddon);
	terminal.open(containerElement);
	fitConsole();
	terminal.write('$ ');
	window.addEventListener('resize', fitConsole);
	terminal.onKey(e => {
		terminal.write(e.key);
		if (e.key == '\r') {
			terminal.write('\n$ ');
		} else if (e.key == '\u007F') {
			terminal.write('\b \b');
		} else if (e.key == '\n') {
			terminal.write('$ ');
		}
	})
	terminal.onData(data => {
		// alert(data)
	})
	terminal.onLineFeed(data => {
		// alert('line feed' + data)
	})
};
const fitConsole = () => {
	//terminal.loadAddon(fitAddon);
	fitAddon.fit();
};
onMounted(() => {
  initConsole();
})
onUnmounted(() => {
  window.removeEventListener('resize', fitConsole);
})
const toggleConsole = () => {
	showConsole.value = !showConsole.value;
	window.setTimeout(() => {
		fitConsole();
	}, 10)
};

</script>

<style scoped lang="scss">
	
.arcode-console-tab {
	height: 24px;
	line-height: 24px;
	padding-left: 20px;
	cursor: pointer;
}
.arcode-console-tab .iconify {
	font-size: 12px;

}
.arcode-console-tab span {
	font-size: 10px;
	margin-left: 2px;
	line-height: 24px;
}

#arcode-console-container {
	height: 220px;
	padding: 0;
	width: 100%;
	padding: 0;
	display: none;
}

#arcode-console-container.active {
	display: block;
}
</style>