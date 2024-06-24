// ★ Credits for youtube@CodeJos for the main functionality ★
const red = '\x1b[31m',
	green = '\x1b[32m',
	yellow = '\x1b[33m';

class Progress {
	#credits = 10;
	#bet = 1;

	set bet(val) {
		// HACK: Make lock buttons unavailable if bet changes
		toggleBtns(true);

		if (val > 0) {
			this.#bet = val;

			console.debug(`NEW BET: ${val} mk`);
			document.querySelector('.bet').textContent = this.#bet;
		}
	}

	get bet() {
		return this.#bet;
	}

	set credits(val) {
		const old = this.#credits;
		this.#credits = val;
		document.querySelector('.credits').textContent = this.#credits;

		if (this.#credits > old) console.debug(`${green}ADDED: ${this.credits - old} mk`);
		else console.debug(`${red}REMOVED: ${this.credits - old} mk`);
	}

	get credits() {
		document.querySelector('.credits').textContent = this.#credits;
		return this.#credits;
	}
}

const iconWidth = 96,
	iconHeight = 96,
	numIcons = 6,
	timePerIcon = 100,
	fruits = [
		{ name: 'pear', mult: 4 },
		{ name: 'banana', mult: 7 },
		{ name: 'seven', mult: 10 },
		{ name: 'melon', mult: 5 },
		{ name: 'apple', mult: 6 },
		{ name: 'cherry', mult: 3 },
	];

// TODO: Make this constant before release
let indexes = [0, 0, 0, 0];

const roll = (reel, offset = 0) => {
	const delta = (offset + 2) * numIcons + Math.round(Math.random() * numIcons);
	const style = getComputedStyle(reel),
		backgroundPositionY = parseFloat(style['background-position-y']),
		targetBackgroundPositionY = backgroundPositionY + delta * iconHeight,
		normTargetBackgroundPositionY = targetBackgroundPositionY % (numIcons * iconHeight);

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
	const checkboxes = document.querySelectorAll('.button-container > input[type=checkbox]');
	const rerolled = [...checkboxes].some((element) => element.checked);
	const reelList = document.querySelectorAll('.reel-container > .reel');
	const promises = Array.from(reelList, (reel, i) =>
		checkboxes[i].checked ? Promise.resolve(0) : roll(reel, i),
	);

	// Disable for duration of the roll
	document.querySelector('.roll').setAttribute('disabled', true);

	Promise.all(promises).then((deltas) => {
		deltas.forEach((delta, i) => (indexes[i] = (indexes[i] + delta) % numIcons));

		// Enable Roll button again
		document.querySelector('.roll').removeAttribute('disabled');

		const result = checkWin();

		if (result > 0) {
			document.querySelector('.button-container').classList.add('blink');
			setTimeout(() => document.querySelector('.button-container').classList.remove('blink'), 2000);
			progress.credits += result;
		}
		toggleBtns(rerolled, result);
	});
}

function toggleBtns(rerolled = false, result = 0) {
	const btns = document.querySelectorAll('.button-container > input[type=checkbox]');
	// Disable / Enable 'Lock' buttons
	if (rerolled || result > 0) {
		btns.forEach((btn) => btn.setAttribute('disabled', true));
	} else {
		btns.forEach((btn) => btn.removeAttribute('disabled'));
	}
	// Uncheck 'Lock' Buttons
	document.querySelectorAll('input:checked').forEach((input) => (input.checked = false));
}

function checkWin() {
	let result = 0;
	const counts = {};
	// Turn into dict with counts
	indexes.forEach((index) => {
		counts[index] = counts[index] ? counts[index] + 1 : 1;
	});

	if (Object.values(counts).includes(4)) {
		result = Number(fruits[Object.keys(counts)[0]].mult * progress.bet);
	} else if (counts['2'] === 3) {
		result = Number(fruits[2].mult * (progress.bet / 2));
	}
	return result;
}

function onClick(e) {
	const classes = e.target.classList;
	// console.log(classes);

	if (classes.contains('roll') && progress.bet <= progress.credits) {
		progress.credits -= progress.bet;
		rollAll();
	} else if (e.target.id === 'betUp') {
		progress.bet += 1;
	} else if (e.target.id === 'betDown') {
		progress.bet -= 1;
	}
}

function init() {
	const slots = document.querySelector('body');
	slots.addEventListener('click', onClick);

	return new Progress();
}

const progress = init();

addEventListener('keydown', (e) => {
	switch (e.key) {
		case 'q':
			fruits.forEach((icon, i) => console.log(i, icon));
			//Object.entries(iconMap).forEach(([key, value], index) => console.log(index, key, value));
			break;
		case 'e':
			console.clear();
			break;
	}
});
