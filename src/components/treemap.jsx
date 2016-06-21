import React from 'react';
import d3 from 'd3';

export default class Treemap extends React.Component {

  // componentWillMount()
  constructor(props) {
    super(props);
    this.treemap = d3.layout.treemap()
        .size([props.width, props.height - props.rootHeight])
        .value(props.value)
        .children(props.children)
        .sort((a, b) => props.value(a) - props.value(b));
    //this.treemap.nodes({children: props.root._children});
    this.layout(props.root);
    this.state = {
      grandparent: props.root,
      grandparentText: props.id(props.root),
      nodes: props.root._children,
      xScale: d3.scale.linear()
        .domain([0, props.width])
        .range([0, props.width]),
      yScale: d3.scale.linear()
        .domain([0, props.height])
        .range([props.rootHeight, props.height + props.rootHeight]),
    };
  }

  layout(node) {
    this.treemap.nodes({ children: node._children });
    node._children.forEach((d) => {
      d.parent = node;
    });
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
            this.state.nodes.map( (node) => this.renderNode(node), this)
          }
        </g>
      </g>
    </svg>
  }

  renderNode(node) {
    if (node._children) {
      return <g
          key={node.OBJECTID}
          className={'children'}
          onClick={this.zoom.bind(this, node)}
        >
        { this.renderRect(node, 'parent') }
        { /* node._children.map( (child) => this.renderRect(child, 'child') ) */ }
        { this.renderText(node) }
      </g>
    } else {
      return <g
          key={node.OBJECTID}
          className={'children'}
        >
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
      key={node.OBJECTID}
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
        grandparentText: this.state.grandparentText
          .split('.').slice(0, -1).join('.'),
      });
    } else {
      this.setState({
        grandparentText: this.state.grandparentText
          += '.' + this.props.id(node)
      });
    }
    this.layout(node);
    this.setState({
      grandparent: node,
      nodes: node._children,
    });
  }
}

Treemap.defaultProps = {
  width: 500,
  height: 500,
  rootHeight: 20,
  value: (d) => d.chart_value,
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
