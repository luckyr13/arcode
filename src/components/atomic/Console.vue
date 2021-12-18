<template>
<div class="side-resize" v-if="showConsole" @mousedown="resize($event)">
</div>
<div class="arcode-console-tab" @click="toggleConsole()">
	<Icon icon="codicon:terminal" /> <span>Console</span>
</div>
<transition name="fade" >
		<div 
				id="arcode-console-container" 
				v-show="showConsole" 
				:style="{ height: `${sideContainerHeight}px` }"></div>
</transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

var terminal = new Terminal({cursorBlink: true});
const fitAddon = new FitAddon();
const showConsole = ref(true);

const initConsole = () => {
	const lineData = '';
	terminal.loadAddon(fitAddon);
	const containerElement = document.getElementById('arcode-console-container');
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
	}, 100)
};

const initialContainerHeight = 160;
const sideContainerHeight = ref(initialContainerHeight);
const resize = () => {
	const doResize = (event: MouseEvent) => {
		const containerElement = document.getElementById('arcode-console-container');
		var offset = containerElement.getBoundingClientRect();
		var top = offset.top;
		var newHeight = top - event.clientY;
		sideContainerHeight.value += newHeight - 24;
		fitConsole();
	};

	const stopResize = () => {
		document.documentElement.removeEventListener('mousemove', doResize, false);
		document.documentElement.removeEventListener('mouseup', stopResize, false);
		window.setTimeout(() => {
			fitConsole();
		}, 100)
		
	};
	document.documentElement.addEventListener('mouseup', stopResize, false);
	document.documentElement.addEventListener('mousemove', doResize, false);
};

</script>

<style scoped lang="scss">
	
.arcode-console-tab {
	height: 24px;
	line-height: 24px;
	padding-left: 20px;
	cursor: pointer;
	z-index: 10;
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
	padding: 0;
	width: 100%;
	padding: 0;
}

#arcode-console-container.active {
	display: block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


.side-resize {
	width: 100%;
	line-height: 24px;
	height: 4px;
	z-index: 20;
}

.side-resize:hover {
	height: 5px;
	cursor: row-resize;
}


</style>