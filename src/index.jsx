import './styles.css'
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

import Treemap from './components/treemap.jsx';

const _tree = require('./data.json');

const props = {
  _tree: _tree,
  root: _tree,
}

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);
ReactDOM.render(<Treemap {...props} />, mountingPoint);

