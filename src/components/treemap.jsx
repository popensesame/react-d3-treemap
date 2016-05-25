import React from 'react';
import d3 from 'd3';

export default class Treemap extends React.Component {
  constructor(props) {
    super(props);
    this.treemap = d3.layout.treemap()
        .size([props.width, props.height - props.rootHeight])
        .value(props.value)
        .children(props.children);
    this.nodes = this.treemap.nodes(props.root);
    this.state = {
      depth: props.depth,
      grandparent: this.nodes[0],
      grandparentText: props.id(this.nodes[0]),
      parents: this.nodes.filter((d) => d.depth === 1),
      xScale: d3.scale.linear()
        .domain([0, this.props.width])
        .range([0, this.props.width]),
      yScale: d3.scale.linear()
        .domain([0, this.props.height])
        .range([this.props.rootHeight, this.props.height]),
    };
  }

  render() {
    return <svg width={this.props.width} height={this.props.height}>
      <g>
        <g className={'grandparent'}
           onClick={this.zoom.bind(this, this.state.grandparent, 'out')}>
          <rect
            className={'grandparent'}
            width={this.props.width}
            height={this.props.rootHeight}>
          </rect>
          <text x={4} y={6}>{this.state.grandparentText}</text>
        </g>
        <g className={'depth'}>
          { this.state.parents.map( (node) => this.renderNode(node), this) }          
        </g>
      </g>
    </svg>
  }

  renderNode(node) {
    if (node.children) {
      return <g className={'children'} onClick={this.zoom.bind(this, node, 'in')}>
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
        {this.props.id(node)}
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

  zoom(node, direction) {
    if (direction === 'out' && node.parent) {
      node = node.parent;
      this.setState({
        grandparentText: this.state.grandparentText
          .split('.').slice(0, -1).join('.')
      })
    } else if (direction === 'in' && node.parent){
      this.setState({
        grandparentText: this.state.grandparentText
          += '.' + this.props.id(node)
      })
    }
    this.setState({
      depth: this.state.depth + 1,
      grandparent: node,
      parents: node.children ? node.children : this.state.parents,
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
  value: (node) => node.size,
  children: (node) => node.children,
  id: (node) => node.name,
}

Treemap.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  rootHeight: React.PropTypes.number.isRequired,

  value: React.PropTypes.func.isRequired,
  children: React.PropTypes.func.isRequired,
  id: React.PropTypes.func.isRequired,

  _tree: React.PropTypes.object.isRequired,
  root: React.PropTypes.object.isRequired,
}
