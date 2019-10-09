import Timer from "../../src/components/Timer";

let timer: Timer;

beforeEach(() => {
	timer = new Timer();
});

describe("Testing Timer", () => {
	test("Is initialized to zero", () => {
		expect(timer.getCurrentTime()).toBe(0);
	});

	test("Setting a timer value actually works", () => {
		timer.setTimer(40);
		expect(timer.getCurrentTime()).toBeGreaterThan(0);
	});

	test("Will call callback when finished", done => {
		timer.setTimer(1);
		timer.onEnd(() => {
			done();
		});
		timer.tick();
	});
});
