import React from 'react';
import d3 from 'd3';

const TOOLTIP_WIDTH = 170;
const TOOLTIP_HEIGHT = 32;

export default class Treemap extends React.Component {

  // componentWillMount()
  constructor(props) {
    super(props);
    this.treemap = d3.layout.treemap()
        .size([props.width, props.height - props.rootHeight])
        .value(props.value)
        .children(props.children)
        .sort((a, b) => props.value(a) - props.value(b))
        .ratio(1);
    //this.treemap.nodes({children: props.root._children});
    this.layout(props.root);
    this.state = {
      grandparent: props.root,
      grandparentText: props.id(props.root),
      nodes: props.root._children,
      tooltip: null,
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
          { this.state.nodes.map( (node) => this.renderNode(node), this) }
        </g>
        { this.renderTooltip() }
      </g>
    </svg>
  }

  renderNode(node) {
    return <g
        key={node.OBJECTID}
        className={'children'}
        // <text> element should not be wider than the width of the child <rect>
        // or else this <g> element will be too wide and trigger the mouse event
        // even when the cursor is not visiting the rect element.
        onMouseEnter={ this.setTooltip.bind(this, node) }
        onClick={ node._children ? this.zoom.bind(this, node) : null }
      >
      { this.renderRect(node, node._children ? 'parent' : 'leaf') }
      { /* node._children.map( (child) => this.renderRect(child, 'child') ) */ }
      { this.renderText(node) }
    </g>
    
    /*
    if (node._children) {
      return <g
          key={node.OBJECTID}
          className={'children'}
          onClick={this.zoom.bind(this, node)}
        >
        { this.renderRect(node, 'parent') }
        { node._children.map( (child) => this.renderRect(child, 'child') )  }
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
    */
  }

  renderText(node) {
    return <text
      x={this.state.xScale(node.x) + 4}
      y={this.state.yScale(node.y) - 2}
      dy={'.75em'}>
        { this.props.id(node) }
    </text>
  }

  renderRect(node, relation) {
    return <rect
      key={node.OBJECTID}
      className={relation}
      x={this.state.xScale(node.x)}
      y={this.state.yScale(node.y)}
      width={this.state.xScale(node.dx) - this.state.xScale(0)}
      height={this.state.yScale(node.dy) - this.state.yScale(0)}
    ></rect>
  }

  renderTooltip() {
    if (this.state.tooltip) {
      return <g key={'tooltip.' + this.state.tooltip.OBJECTID}>
        <rect
          className={'tooltip'}
          x={ this.state.tooltip.x }
          y={ this.state.tooltip.y }
          width={TOOLTIP_WIDTH}
          height={TOOLTIP_HEIGHT}
        ></rect>
        <text
          x={ this.state.tooltip.x + 4}
          y={ this.state.tooltip.y }
          dy={5}
        >
          { 'id: ' + this.state.tooltip.id }
        </text>
        <text
          x={ this.state.tooltip.x + 4 }
          y={ this.state.tooltip.y }
          dy={20}
        >
          { 'value: ' + this.state.tooltip.value }
        </text>
      </g>
    }
  }

  setTooltip(node, event) {
    this.setState({
      tooltip: {
        value: this.props.value(node),
        id: this.props.id(node),
        x: event.clientX,
        y: event.clientY,
      },
    });
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
      tooltip: null,
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
