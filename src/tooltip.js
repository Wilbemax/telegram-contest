import { css } from './util';

const template = (data) => `
    <div class='tooltip-title '>${data.title}</div>
    <ul class='tooltip-list'>
    ${data.items
			.map((item) => {
				return `<li class="tooltip-list-item">
                    <div class='value' style='color:${item.color}'>${item.value}</div>\
                    <div class='name' style='color:${item.color}'>${item.name}</div>
                        </li>`;
			})
			.join('\n')}
    
    </ul>`;

export function tooltip(el, WIDHT) {
	const clear = () => (el.innerHTML = '');
	return {
		show({ left, top }, data) {
			clear();
			const { height, width } = el.getBoundingClientRect();
			if (left < WIDHT / 2) {
				console.log(true);
				css(el, {
					display: 'block',
					top: top - height + 'px',
					left: left + width / 2 + 'px',
				});
			} else {
				console.log(false);
				css(el, {
					display: 'block',
					top: top - height + 'px',
					left: left - width * 1.5 + 'px',
				});
			}

			el.insertAdjacentHTML('afterbegin', template(data));
		},
		hiden() {
			css(el, { display: 'none ' });
		},
	};
}
