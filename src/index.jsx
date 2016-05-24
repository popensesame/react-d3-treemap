import './styles.css'
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

import Treemap from './components/treemap.jsx';

const props = {
  width: 500,
  height: 500,
  depth: 0,
  root: 'beings',
  _tree: require('./data.json')
}

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);
ReactDOM.render(<Treemap {...props} />, mountingPoint);

