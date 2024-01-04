import { css } from './util';
import { computeBoundaties, toCoords, line } from './util';

const HEIGHT = 40;
const DPI_HEIGHT = HEIGHT * 2;

export function sliderChart(root, data, DPI_WIDTH) {
	const WIDHT = DPI_WIDTH / 2;
	const MIN_WIDTH = WIDHT * 0.05;
	const canvas = root.querySelector('canvas');
	const ctx = canvas.getContext('2d');

	css(canvas, {
		width: WIDHT + 'px',
		height: HEIGHT + 'px',
	});

	const $left = root.querySelector('[data-el="left"]');
	const $window = root.querySelector('[data-el="window"]');
	const $right = root.querySelector('[data-el="right"]');

	const defaultWidth = WIDHT * 0.3;
	setPosition(0, WIDHT - defaultWidth);

	function setPosition(left, right) {
		const windowWith = WIDHT - left - right;
        console.log(left, right);

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
            width: windowWith +"px",
            left: left + "px",
            rigth: right + "px"
        })
		css($left, { width: left + 'px' });
        css($right, { width: right + 'px' });
	}

	canvas.width = DPI_WIDTH;
	canvas.height = DPI_HEIGHT;

	const [yMin, yMax] = computeBoundaties(data);

	const yRatio = DPI_HEIGHT / (yMax - yMin);
	const xRatio = DPI_WIDTH / (data.columns[0].length - 2);

	const yData = data.columns.filter((col) => data.types[col[0]] === 'line');

	yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, -5)).forEach((coords, idx) => {
		const color = data.colors[yData[idx][0]];
		line(ctx, coords, { color });
	});
}
