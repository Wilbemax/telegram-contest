
import {  computeXRatio, css, computeBoundaties, toCoords, line, computeYRatio } from './util';

function noop() { }

const HEIGHT = 40;
const DPI_HEIGHT = HEIGHT * 2;

export function sliderChart(root, data, DPI_WIDTH) {
	const WIDHT = DPI_WIDTH / 2;
	const MIN_WIDTH = WIDHT * 0.05;
	let nextFn = noop;
	const canvas = root.querySelector('canvas');
	const ctx = canvas.getContext('2d');

	css(canvas, {
		width: WIDHT + 'px',
		height: HEIGHT + 'px',
	});

	const $left = root.querySelector('[data-el="left"]');
	const $window = root.querySelector('[data-el="window"]');
	const $right = root.querySelector('[data-el="right"]');

	function next() {
		nextFn(getPosition());
	}

	function mousedown(event) {
		const type = event.target.dataset.type;
		const dimensions = {
			left: parseInt($window.style.left),
			right: parseInt($window.style.right),
			width: parseInt($window.style.width),
		};

		if (type === 'window') {
			const startX = event.pageX;
			document.onmousemove = (e) => {
				const delta = startX - e.pageX;
				if (delta === 0) return;

				const left = dimensions.left - delta;
				const rifht = WIDHT - left - dimensions.width;

				setPosition(left, rifht);
				next();
			};
		} else if (type === 'left' || type === 'right') {
			const startX = event.pageX;

			document.onmousemove = (e) => {
				const delta = startX - e.pageX;
				if (delta === 0) return;

				if (type === 'left') {
					const left = WIDHT - (dimensions.width + delta) - dimensions.right;
					setPosition(left, dimensions.right);
				} else {
					const right = WIDHT - (dimensions.width - delta) - dimensions.left;
					setPosition(dimensions.left, right);
				}
				next();
			};
		}
	}

	function mouseup() {
		document.onmousemove = null;
	}

	root.addEventListener('mousedown', mousedown);
	document.addEventListener('mouseup', mouseup);

	const defaultWidth = WIDHT * 0.3;
	setPosition(0, WIDHT - defaultWidth);

	function setPosition(left, right) {
		const windowWith = WIDHT - left - right;

		if (windowWith < MIN_WIDTH) {
			css($window, { width: MIN_WIDTH + 'px' });
			return;
		}

		if (left < 0) {
			css($window, { left: '0px' });
			css($left, { width: '0px' });
			return;
		}

		if (right < 0) {
			css($window, { rigth: '0px' });
			css($right, { width: '0px' });
			return;
		}

		css($window, {
			width: windowWith + 'px',
			left: left + 'px',
			right: right + 'px',
		});
		css($left, { width: left + 'px' });
		css($right, { width: right + 'px' });
	}

	function getPosition() {
		const left = parseInt($left.style.width);
		const right = WIDHT - parseInt($right.style.width);
		return [(left * 100) / WIDHT, (right * 100) / WIDHT];
	}

	canvas.width = DPI_WIDTH;
	canvas.height = DPI_HEIGHT;

	const [yMin, yMax] = computeBoundaties(data);

	

	const yRatio = computeYRatio(DPI_HEIGHT, yMax, yMin)
	const xRatio = computeXRatio(DPI_WIDTH, data.columns[0].length)


	const yData = data.columns.filter((col) => data.types[col[0]] === 'line');

	yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, 0, yMin)).forEach((coords, idx) => {
		const color = data.colors[yData[idx][0]];
		line(ctx, coords, { color });
	});

	return {
		subscribe(fn) {
			nextFn = fn
			fn(getPosition());
		},
	};
}
