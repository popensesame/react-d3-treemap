import './styles.css'
import ReactDOM from 'react-dom';
import React from 'react';
import Treemap from './components/treemap.jsx';
import {makeTreeFromHuc12Data, makeTreeFromHuc8Data} from './core';

const huc12ChartData = require('../data/single_huc12.json').features;
const huc8AllChartLevels = require('../data/huc8_03020104_all_chart_levels.json').features;

const __tree = makeTreeFromHuc8Data(huc8AllChartLevels);

const props = {
  root: __tree,
}

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);
ReactDOM.render(
  <Treemap {...props}/>,
  mountingPoint
)

