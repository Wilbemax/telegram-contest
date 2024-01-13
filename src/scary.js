import {
	css,
	toDate,
	isOver,
	line,
	circle,
	computeBoundaties,
	toCoords,
	computeXRatio,
	computeYRatio,
} from './util';
import { tooltip } from './tooltip';
import { sliderChart } from './slider';

let lastPaintCall;

const WIDHT = 600;
const PADDING = 40;
const HEIGHT = 200;
const DPI_WIDTH = WIDHT * 2;
const DPI_HEIGHT = HEIGHT * 2;
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2;
const ROWS_COUNT = 5;
const VIEW_WIDTH = DPI_WIDTH;
const CIRCLE_RADIUS = 10;
const SPEED = 1000;

export function chart(root, data) {
	//console.log(data);
	const canvas = root.querySelector('[data-el="main"');
	const tip = tooltip(root.querySelector('[data-el="tooltip"]'), WIDHT);
	const slider = sliderChart(
		root.querySelector('[data-el="slider"]'),
		data,
		DPI_WIDTH
	);
	let raf;
	let prevMax;
	const ctx = canvas.getContext('2d');

	css(canvas, {
		width: WIDHT + 'px',
		height: HEIGHT + 'px',
	});

	canvas.width = DPI_WIDTH;
	canvas.height = DPI_HEIGHT;

	const proxy = new Proxy(
		{},
		{
			set(...args) {
				const result = Reflect.set(...args);
				raf = requestAnimationFrame(paint);
				return result;
			},
		}
	);

	function mousemove({ clientX, clientY }) {
		const { left, top } = canvas.getBoundingClientRect();

		proxy.mouse = {
			x: (clientX - left) * 2,
			tooltip: {
				left: clientX - left,
				top: clientY - top,
			},
		};
	}

	slider.subscribe((pos) => {
		proxy.pos = pos;
	});

	function mouseleave() {
		proxy.mouse = null;
		tip.hiden();
	}

	canvas.addEventListener('mousemove', mousemove);
	canvas.addEventListener('mouseleave', mouseleave);

	function clear() {
		ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT);
	}


	//проблема в функции getMax, здесь я пытаюсь отрисовывать так чтобы была какя-то анимцмя, на увелечении работает нормально, да и на уменьшении тоже все хорошо до момента когда график становиться меньше чем default там начинаеться какая-то ваканалия, продебажил ничегоне понимаю почему так получаеться...


	function getMax(yMax) {

		const diff = yMax - proxy.max;
	  
		if(proxy.max === 0 && diff < 0) {
		  return 0;
		}
	  
		const step = diff / SPEED ; 
	  
		if(proxy.max < yMax) {
		  proxy.max += step;
		} else {
		  proxy.max -= step; 
		}
	  
		return proxy.max;
	  
	  }

	function translateX(lenhtg, xRatio, left) {
		return -1 * Math.round((left * xRatio * lenhtg) / 100);
	}

	let throttledPaint = throttle(paint, 16);

  function loop() {
    throttledPaint();
    requestAnimationFrame(loop);
  }


function throttle(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

	function paint() {

	const now = Date.now();

    if (lastPaintCall && now - lastPaintCall < 16) {
      return;
    }

    lastPaintCall = now;
		clear();
		const length = data.columns[0].length;
		const leftIndex = Math.max(Math.min(Math.round((proxy.pos[0] * length) / 100), length - 1), 0);
const rightIndex = Math.max(Math.min(Math.round((proxy.pos[1] * length) / 100), length - 1), 0);

		const columns = data.columns.map((col) => {
			const res = col.slice(leftIndex, rightIndex	);
			if (typeof res[0] !== 'string') {
				res.unshift(col[0]);
			}
			return res;
		});

		const [yMin, yMax] = computeBoundaties({ columns, types: data.types });

		if (!prevMax) {
			prevMax = yMax;
			proxy.max = yMax;
		}
		const max = getMax(yMax);
		const trnaslate = translateX(data.columns[0].length, xRatio, proxy.pos[0]);
		console.log(`max: ${proxy.max}`, `yMax: ${yMax}`, `prevMax: ${prevMax}`);

		const yRatio = computeYRatio(VIEW_HEIGHT, max, yMin);
		const xRatio = computeXRatio(VIEW_WIDTH, columns[0].length);

		const yData = columns.filter((col) => data.types[col[0]] === 'line');
		const xData = columns.filter((col) => data.types[col[0]] !== 'line')[0];

		//рисование
		yAxis(yMin, max);
		xAxis(xData, yData, xRatio);

		yData
			.map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin))
			.forEach((coords, idx) => {
				const color = data.colors[yData[idx][0]];
				line(ctx, coords, { color, trnaslate });

				for (const [x, y] of coords) {
					if (isOver(proxy.mouse, x, coords.length, DPI_WIDTH)) {
						circle(ctx, [x, y], { color }, CIRCLE_RADIUS);
					}
				}
			});
	}

	function xAxis(xData, yData, xRatio) {
		const colsCount = 6;
		const step = Math.round(xData.length / colsCount);

		ctx.beginPath();
		for (let i = 1; i < xData.length; i++) {
			const x = i * xRatio;
			if (i % step === 0) {
				const text = toDate(xData[i]);
				ctx.fillText(text.toString(), x, DPI_HEIGHT - 10);
			}

			if (isOver(proxy.mouse, x, xData.length, DPI_WIDTH)) {
				ctx.save();

				ctx.moveTo(x, PADDING);
				ctx.lineTo(x, DPI_HEIGHT - PADDING);

				tip.show(proxy.mouse.tooltip, {
					title: toDate(xData[i]),
					items: yData.map((col) => ({
						color: data.colors[col[0]],
						name: data.names[col[0]],
						value: col[i + 1],
					})),
				});

				ctx.restore();
			}
		}
		ctx.stroke();
		ctx.closePath();
	}

	function yAxis(yMin, yMax) {
		const step = VIEW_HEIGHT / ROWS_COUNT;
		const textStep = (yMax - yMin) / ROWS_COUNT;

		ctx.beginPath();
		ctx.strokeStyle = '#bbb';
		ctx.font = 'normal 20px Helvetica, sans-serif';
		ctx.fillStyle = '#96a2aa';

		for (let i = 1; i <= ROWS_COUNT; i++) {
			const y = step * i;
			ctx.lineWidth = 1;
			const text = Math.round(yMax - textStep * i);
			ctx.fillText(text.toString(), 5, y + PADDING - 10);
			ctx.moveTo(0, y + PADDING);
			ctx.lineTo(DPI_WIDTH, y + PADDING);
		}
		ctx.stroke();
		ctx.closePath();
	}

	return {
		init() {
			paint();
		},
		destroy() {
			cancelAnimationFrame(rfa);
			canvas.removeEventListener('mousemove', mousemove);
			canvas.removeEventListener('mouseleave', mouseleave);
		},
	};


	// return {
	// 	init() {
	// 	  loop();
	// 	},
	// 	destroy() {
	// 	  //
	// 	}
	//   };
}