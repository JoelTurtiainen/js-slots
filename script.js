// ★ Credits for youtube@CodeJos for the main functionality ★

class Progress {
	#credits = 10;
	#round = 0;

	get credits() {
		return this.#credits;
	}

	get round() {
		console.log(this.#round);
		return this.#round;
	}

	addCredits(x) {
		this.#credits += x;
	}

	removeCredits(x) {
		this.#credits -= x;
	}

	addRound() {
		if (this.#round >= 1) {
			this.#round = 0;
		} else {
			this.#round++;
		}
	}
}

const iconWidth = 96,
	iconHeight = 96,
	numIcons = 6,
	timePerIcon = 100,
	indexes = [0, 0, 0, 0],
	iconMap = ['pear', 'banana', 'melon', 'apple', 'cherry'];

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
	const reelList = [...document.querySelectorAll('.reel-container > .reel')].filter(
		(reel, i) => checkboxes[i].checked === false,
	);

	document.querySelector('.roll').setAttribute('disabled', true);

	Promise.all([...reelList].map((reel, i) => roll(reel, i))).then((deltas) => {
		deltas.forEach((delta, i) => (indexes[i] = (indexes[i] + delta) % numIcons));
		const result = checkWin();
		toggleBtns(checkboxes, result);
	});
}

function toggleBtns(btnList, result) {
	// uncheck
	document.querySelectorAll('input:checked').forEach((input) => (input.checked = false));
	document.querySelector('.roll').removeAttribute('disabled');

	// lock buttons
	if (progress.round > 0 && result === false) {
		btnList.forEach((btn) => btn.removeAttribute('disabled'));
	} else {
		btnList.forEach((btn) => btn.setAttribute('disabled', true));
	}
}

function checkWin() {
	// check win conditions
	const counts = {};
	indexes.forEach((index) => {
		counts[iconMap[index]] = counts[iconMap[index]] ? counts[iconMap[index]] + 1 : 1;
	});
	const result = Object.values(counts).includes(3);

	if (result) {
		document.querySelector('.button-container').classList.add('blink');
		setTimeout(() => document.querySelector('.button-container').classList.remove('blink'), 2000);
	}
	progress.addRound();
	return result;
}

function onClick(e) {
	const classes = e.target.classList;
	console.log(classes);

	if (classes.contains('roll')) {
		progress.removeCredits(1);
		rollAll();
	}

	creditsDisplay();
}

function creditsDisplay() {
	document.querySelector('.credits').innerHTML = progress.credits;
}

function init() {
	const slots = document.querySelector('body');
	slots.addEventListener('click', onClick);

	return new Progress();
}

const progress = init();
creditsDisplay();
