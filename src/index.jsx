import './styles.css'
import ReactDOM from 'react-dom';
import React from 'react';
import Treemap from './components/treemap.jsx';
import {makeTreeFromHuc12Data, makeTreeFromHuc8Data} from './core';

const huc12ChartData = require('../data/single_huc12.json').features;
const allHuc12sInOneHuc8Data = require('../data/huc8_03020104.json').features;

const __tree = makeTreeFromHuc8Data(allHuc12sInOneHuc8Data);

const props = {
  root: __tree,
  value: (d) => d.chart_value,
  id: (d) => d.chart_level_label,
}

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);
ReactDOM.render(
  <Treemap {...props}/>,
  mountingPoint
)

