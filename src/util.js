export function computeYRatio(height, min, max) {
	return (min - max) / height;
}
export function computeXRatio(width, length) {
	return width / (length - 2);
}

export function toDate(timestamp) {
	const shortMonth = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	// const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const date = new Date(timestamp);
	return `${shortMonth[date.getMonth()]} ${date.getDate()}`;
}

export function isOver(mouse, x, length, dWidth) {
	if (!mouse) {
		return false;
	}

	const width = dWidth / length;

	return Math.abs(x - mouse.x) < width / 2;
}

export function line(ctx, coords, { color, translate }) {
	ctx.beginPath();
	ctx.save()
	ctx.translate(translate, 0)
	ctx.lineWidth = 4;
	ctx.strokeStyle = color;
	for (const [x, y] of coords) {
		ctx.lineTo(x, y);
	}
	ctx.stroke();
	ctx.restore()
	ctx.closePath();
}

export function circle(ctx, [x, y], { color }, cRadius) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.fillStyle = '#fff';
	ctx.arc(x, y, cRadius, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

export function computeBoundaties({ columns, types }) {
	let min;
	let max;

	columns.forEach((col) => {
		if (types[col[0]] !== 'line') {
			return;
		}

		if (typeof min !== 'number') min = col[1];
		if (typeof max !== 'number') max = col[1];

		if (min > col[1]) min = col[1];
		if (max < col[1]) max = col[1];

		for (let i = 2; i < col.length; i++) {
			if (min > col[i]) min = col[i];
			if (max < col[i]) max = col[i];
		}
	});

	return [min, max];
}

export function css(el, style = {}) {
	Object.assign(el.style, style);
}

export function toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin) {
	return (col) =>
		col
			.map((y, i) => [
				Math.floor((i - 1) * xRatio),
				Math.floor(DPI_HEIGHT - PADDING - (y - yMin) / yRatio),
			])
			.filter((_, i) => i !== 0);
}
