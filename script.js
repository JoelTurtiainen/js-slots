// ★ Credits for youtube@CodeJos for the main functionality ★
const red = '\x1b[31m',
	green = '\x1b[32m',
	yellow = '\x1b[33m';

class Progress {
	#credits = 10;
	#round = 0;
	#bet = 1;

	set bet(val) {
		if (val > 0) {
			this.#bet = val;

			console.debug(`NEW BET: ${val} mk`);
			document.querySelector('.bet').innerHTML = this.#bet;
		}
	}

	get bet() {
		return this.#bet;
	}

	set credits(val) {
		const old = this.#credits;
		this.#credits = val;
		document.querySelector('.credits').innerHTML = this.#credits;

		if (this.#credits > old) console.debug(`${green}ADDED: ${this.credits - old} mk`);
		else console.debug(`${red}REMOVED: ${this.credits - old} mk`);
	}

	get credits() {
		document.querySelector('.credits').innerHTML = this.#credits;
		return this.#credits;
	}

	set round(val) {
		console.debug;
		if (val > 1) {
			this.#round = 0;
		} else {
			this.#round = val;
		}
		console.debug(`ROUND: ${this.#round}`);
	}

	get round() {
		return this.#round;
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
	const reelList = document.querySelectorAll('.reel-container > .reel');
	const promises = Array.from(reelList, (reel, i) =>
		checkboxes[i].checked ? Promise.resolve(0) : roll(reel, i),
	);

	document.querySelector('.roll').setAttribute('disabled', true);

	Promise.all(promises).then((deltas) => {
		deltas.forEach((delta, i) => (indexes[i] = (indexes[i] + delta) % numIcons));
		checkWin();
		toggleBtns(checkboxes);
	});
}

function toggleBtns(btnList, result = false) {
	// Enable
	document.querySelector('.roll').removeAttribute('disabled');

	// Unselect buttons
	document.querySelectorAll('input:checked').forEach((input) => (input.checked = false));

	// Disable Buttons
	if (progress.round > 0 && result === false) {
		btnList.forEach((btn) => btn.removeAttribute('disabled'));
	} else {
		btnList.forEach((btn) => btn.setAttribute('disabled', true));
	}
}

function checkWin() {
	// check win conditions
	const counts = {};

	console.debug(indexes.map((i) => `${fruits[i].name}`));

	indexes.forEach((index) => {
		counts[index] = counts[index] ? counts[index] + 1 : 1;
		// counts[fruits[index].name] = counts[fruits[index].name] ? counts[fruits[index].name] + 1 : 1;
	});

	if (Object.values(counts).includes(4)) {
		progress.credits += Number(fruits[Object.keys(counts)[0]].mult * progress.bet);
	} else if (counts['2'] === 3) {
		progress.credits += Number(fruits[2].mult * (progress.bet / 2));
	} else {
		progress.round++;
		return;
	}

	document.querySelector('.button-container').classList.add('blink');
	setTimeout(() => document.querySelector('.button-container').classList.remove('blink'), 2000);
	progress.round = 0;
	return;
}

function onClick(e) {
	const classes = e.target.classList;
	// console.log(classes);

	if (classes.contains('roll')) {
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

// addEventListener('keydown', (e) => {
// 	switch (e.key) {
// 		case 'q':
// 			iconMap.forEach((icon, i) => console.log(i, icon));
// 			//Object.entries(iconMap).forEach(([key, value], index) => console.log(index, key, value));
// 			break;
// 		case 'w':
// 			indexes.forEach((index) => console.log(iconMap[index]));
// 			break;
// 		case 'e':
// 			console.clear();
// 	}
// });
