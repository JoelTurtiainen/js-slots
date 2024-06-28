// ★ Credits for youtube@CodeJos for the roll And rollAll ★

// ## Setup for reels
let indexes = [0, 0, 0, 0];
const numIcons = 6;
const timePerIcon = 100;
const iconHeight = 100;
const fruits = [
	{ name: 'pear', mult: 4 },
	{ name: 'banana', mult: 7 },
	{ name: 'seven', mult: 10 },
	{ name: 'melon', mult: 5 },
	{ name: 'apple', mult: 6 },
	{ name: 'cherry', mult: 3 },
];

// ## Dom Cache

const [displayBet, displayWin, displayCredits] = document.querySelectorAll('.display-bet, .display-win, .display-credits');
const [panel, rollBtn] = document.querySelectorAll('.btn-panel, .roll');
const [betUp, betDown] = document.querySelector('.bet-actions').children;
const lockBtns = document.querySelectorAll('.toggle-btn');
const reelList = document.querySelectorAll('.reel-container > .reel');

// ## Constructor

class Progress {
	#credits = 20;
	#bet = 1;
	#win = 0;

	set bet(val) {
		// HACK: Make lock buttons unavailable if bet changes
		enableLockBtns(false);
		if (val > 0) {
			this.#bet = val;
		}
		this.updateDom();
	}

	get bet() {
		return this.#bet;
	}

	set credits(val) {
		const result = val - this.#credits;
		this.#win = result > 0 ? result : 0;
		this.#credits = val;
		this.updateDom();
	}

	get credits() {
		return this.#credits;
	}

	updateDom() {
		displayBet.firstElementChild.textContent = this.#bet;
		displayWin.firstElementChild.textContent = this.#win;
		displayCredits.firstElementChild.textContent = this.#credits;

		betDown.disabled = this.#bet <= 1;
		betUp.disabled = this.#bet >= this.#credits;
		rollBtn.disabled = this.#bet > this.#credits;
	}
}

// ## Slot Reel Functionality

const roll = (reel, offset = 0) => {
	const delta = (offset + 2) * numIcons + Math.round(Math.random() * numIcons);
	const style = getComputedStyle(reel);
	const backgroundPositionY = parseFloat(style['background-position-y']);
	const targetBackgroundPositionY = backgroundPositionY + delta * iconHeight;
	const normTargetBackgroundPositionY = targetBackgroundPositionY % (numIcons * iconHeight);

	return new Promise((resolve, reject) => {
		reel.style.transition = `background-position-y ${8 + delta * timePerIcon}ms`;
		reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;

		setTimeout(() => {
			// Normalize image position so it doesnt go to the moon
			reel.style.transition = 'none';
			reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;

			resolve(delta % numIcons);
		}, 8 + delta * timePerIcon);
	});
};

function rollAll() {
	const promises = Array.from(reelList, (reel, i) => (lockBtns[i].ariaPressed === 'true' ? Promise.resolve(0) : roll(reel, i)));

	// Disable for duration of promise
	enableActionButtons(false);

	Promise.all(promises).then((deltas) => {
		deltas.forEach((delta, i) => (indexes[i] = (indexes[i] + delta) % numIcons));

		reelList.forEach((reel, i) => (reel.ariaLabel = fruits[indexes[i]].name));

		const result = checkWin();

		if (result > 0) {
			panel.classList.add('blink');
			setTimeout(() => panel.classList.remove('blink'), 2000);
			progress.credits += result;
			enableLockBtns(false);
		} else {
			enableLockBtns(true);
		}

		enableActionButtons(true);
		progress.updateDom();
	});
}

function checkWin() {
	const counts = {};
	// Turn into object with counts
	indexes.forEach((index) => {
		counts[index] = counts[index] ? counts[index] + 1 : 1;
	});

	const hasThree = Object.values(counts).some((count) => count === 3);
	const hasFour = Object.values(counts).some((count) => count === 4);

	if (hasFour) {
		const winningIndex = Object.keys(counts).find((index) => counts[index] === 4);
		return fruits[winningIndex].mult * progress.bet;
	} else if (hasThree) {
		// index '2' is for Seven
		if (counts['2'] === 3) {
			return fruits[2].mult * (progress.bet / 2);
		}
	}
	return 0;
}

// ## Button Logic

function enableActionButtons(bool) {
	const btns = [rollBtn, betUp, betDown];
	if (bool) {
		btns.forEach((btn) => (btn.disabled = false));
		panel.removeAttribute('style');
	} else {
		btns.forEach((btn) => (btn.disabled = true));
		panel.style.pointerEvents = 'none';
	}
}

function enableLockBtns(bool) {
	const rerolled = [...lockBtns].some((element) => element.ariaPressed === 'true');

	// Uncheck 'Lock' Buttons
	lockBtns.forEach((element) => toggleButtons(element, true));

	// Disable / Enable 'Lock' buttons
	if (bool === false || rerolled) {
		lockBtns.forEach((element) => (element.disabled = true));
	} else {
		lockBtns.forEach((element) => (element.disabled = false));
	}
}

// ## Events

function onClick(e) {
	const classes = e.target.classList;
	// console.log(classes);
	if (classes.contains('toggle-btn')) {
		toggleButtons(e.target);
	} else if (classes.contains('roll') && progress.bet <= progress.credits) {
		progress.credits -= progress.bet;
		rollAll();
	} else if (classes.contains('bet-up')) {
		progress.bet += 1;
	} else if (classes.contains('bet-down')) {
		progress.bet -= 1;
	}
}

function toggleButtons(element, override = false) {
	const isPressed = element.getAttribute('aria-pressed') === 'true' || override;
	element.setAttribute('aria-pressed', String(!isPressed));
	element.textContent = isPressed ? 'Lock' : 'Locked'; // Toggle button text
}

// ## Init

function init() {
	document.querySelector('.btn-panel').addEventListener('click', onClick);
	return new Progress();
}

const progress = init();
progress.updateDom();
