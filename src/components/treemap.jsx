import React from 'react';
import d3 from 'd3';

const _tree = require('../data.json');

const color = d3.scale.category20c()

const renderNode = (c, i) => {
  return <rect
            x={c.x}
            y={c.y}
            width={c.dx}
            height={c.dy}
            fill={color(c.name)}>
          </rect>
}

export default (props) => {
  const treemap = d3.layout.treemap()
    .size([props.width, props.height])
    .value((d) => d.size);

  const tree = treemap(_tree);
  console.log(tree);

  return <svg {...props}>
    { tree.map(renderNode) }
  </svg>
}


