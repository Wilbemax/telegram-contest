import './styles.scss';
import data from './data.json';
import { chart } from './chart';

document.addEventListener('DOMContentLoaded', () => {
	const graphSelect = document.getElementById('graphSelect');
	const chartContainer = document.getElementById('chart');
	console.log(graphSelect.value);
	graphSelect.addEventListener('change', () => {
		const selectedGraphIndex = graphSelect.value;

		if (selectedGraphIndex !== '') {
			console.log('f');
			const selectedData = data[selectedGraphIndex];
			const tgChart = chart(chartContainer, selectedData);
			tgChart.init();
		} else {
			console.log('t');
			const selectedData = data[0];
			const tgChart = chart(chartContainer, selectedData);
			tgChart.init();
		}
	});
});
