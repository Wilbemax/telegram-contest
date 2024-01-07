import './styles.scss'
import  data from './data.json';
import { chart } from './chart';

const tgChart = chart(document.getElementById('chart'), data[4]);
tgChart.init();

