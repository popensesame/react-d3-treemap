import React from 'react';
import d3 from 'd3';

const VAL_PRECISION = 3;

export default class Treemap extends React.Component {

  // componentWillMount()
  constructor(props) {
    super(props);
    this.treemap = d3.layout.treemap()
        .size([props.width, props.height - props.rootHeight])
        .value(props.value)
        .children(props.children);
    this.treemap.sort((a, b) => {
      return this.treemap.value(b) - this.treemap.value(a);
    })
    this.nodes = this.treemap.nodes(props.root);
    this.state = {
      depth: props.depth,
      grandparent: this.nodes[0],
      grandparentText: props.id(this.nodes[0]),
      parents: props.children(this.nodes[0]),
      xScale: d3.scale.linear()
        .domain([0, props.width])
        .range([0, props.width]),
      yScale: d3.scale.linear()
        .domain([0, props.height])
        .range([props.rootHeight, props.height + props.rootHeight]),
    };
  }

  render() {
    return <svg width={this.props.width} height={this.props.height}>
      <g>
        <g
          className={'grandparent'}
          onClick={
            this.state.grandparent.parent ?
            this.zoom.bind(this, this.state.grandparent) : null
          }>
          <rect
            className={'grandparent'}
            width={this.props.width}
            height={this.props.rootHeight}>
          </rect>
          <text x={4} y={6}>{this.state.grandparentText}</text>
        </g>
        <g className={'depth'}>
          {
            this.state.parents.map( (node) => {
              if (this.props.value(node) > 0) { return this.renderNode(node) }
            }, this)
          }          
        </g>
      </g>
    </svg>
  }

  renderNode(node) {
    if (node.children) {
      return <g className={'children'} onClick={this.zoom.bind(this, node)}>
        { this.renderRect(node, 'parent') }
        { node.children.map( (child) => this.renderRect(child, 'child') ) }
        { this.renderText(node) }
      </g>
    } else {
      return <g className={'children'}>
        { this.renderRect(node, 'leaf') }
        { this.renderText(node) }
      </g>
    }
  }

  renderText(node) {
    return <text
      x={this.state.xScale(node.x) + 4}
      y={this.state.yScale(node.y) - 2}
      dy={'.75em'}>
        { this.props.id(node) + ': ' + this.props.value(node) }
    </text>
  }

  renderRect(node, relation) {
    return <rect
      className={relation}
      x={this.state.xScale(node.x)}
      y={this.state.yScale(node.y)}
      width={this.state.xScale(node.dx) - this.state.xScale(0)}
      height={this.state.yScale(node.dy) - this.state.yScale(0)}>
    </rect>
  }

  zoom(node) {
    if (node === this.state.grandparent) {
      node = node.parent;
      this.setState({
        depth: this.state.depth -= 1,
        grandparentText: this.state.grandparentText
          .split('.').slice(0, -1).join('.')
      });
    } else {
      this.setState({
        depth: this.state.depth += 1,
        grandparentText: this.state.grandparentText
          += '.' + this.props.id(node)
      });
    }
    this.setState({
      grandparent: node,
      parents: node.children,
      xScale: d3.scale.linear()
        .domain([node.x, node.x + node.dx])
        .range([0, this.props.width])
      ,
      yScale: d3.scale.linear()
        .domain([node.y, node.y + node.dy])
        .range([this.props.rootHeight, this.props.height])
      ,
    });
  }
}

Treemap.defaultProps = {
  width: 500,
  height: 500,
  rootHeight: 20,
  value: (d) => (1*d.chart_value).toFixed(3),
  children: (d) => d.children,
  id: (d) => {
    if (d.chart_level > 1) return d.chart_level_label;
    if (d.geography_level > 2) return d.ID.slice(-4);
    return d.ID;
  },
}

Treemap.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  rootHeight: React.PropTypes.number.isRequired,
  value: React.PropTypes.func.isRequired,
  children: React.PropTypes.func.isRequired,
  id: React.PropTypes.func.isRequired,

  root: React.PropTypes.object.isRequired,
}
