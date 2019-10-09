export default class Timer {
	private hz: number;
	private value: number;
	private onEndCallback?: () => void;
	private intervalID: NodeJS.Timeout | undefined;

	constructor(value: number = 0, onEndCallback?: () => void, hz: number = 60) {
		this.hz = hz;
		this.value = value;
		this.onEndCallback = onEndCallback;
	}

	setTimer(value: number) {
		this.value = value;
	}

	tick() {
		if (--this.value <= 0) {
			this.value = 0;
			if (this.onEndCallback) {
				this.onEndCallback();
			}
		}
	}

	getCurrentTime() {
		return this.value;
	}

	onEnd(callback: () => void) {
		this.onEndCallback = callback;
	}
}
