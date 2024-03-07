import './styles.scss'
import  data from './data.json';
import { chart } from './chart';
//есть разные data[0]; data[1]; data[2]; data[3]
const tgChart = chart(document.getElementById('chart'), data[4]);
tgChart.init();

