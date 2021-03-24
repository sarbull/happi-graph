import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import * as d3 from 'd3';
import { compute } from './happi-graph-algorithms';

class HappiGraph extends PolymerElement {
  constructor() {
    super();

    this.zooming = this.zooming.bind(this);
  }

  static get properties() {
    return {
      iconsMap: {
        type: Object,
        value: null
      },
      propertiesMap: {
        type: Object,
        value: null
      },
      svg: {
        type: Object,
        value: null
      },
      zoom: {
        type: Object,
        value: null
      },
      allGroup: {
        type: Object,
        value: null
      },
      nodesGroup: {
        type: Object,
        value: null
      },
      linksGroup: {
        type: Object,
        value: null
      },
      graphDirection: {
        type: String,
        value: ''
      },
      nodes: {
        type: Array,
        value: []
      },
      links: {
        type: Array,
        value: []
      },
      data: {
        type: Object,
        value: null,
        observer: '_dataUpdate'
      }
    };
  }

  _dataUpdate(newData) {
    console.log('_dataUpdate()');

    if(newData && newData.nodes.length > 0 && newData.links.length > 0) {
      this.removeData();

      this.graphDirection = newData.graphDirection;

      this.nodes = newData.nodes.map(n => {
        let keys = Object.keys(n.properties ? n.properties : {});

        let props = keys.map(k => {
          let camelCased = k.charAt(0).toUpperCase() + k.slice(1);

          return {
            value: n.properties[k],
            label: k,
            icon: this.propertiesMap[camelCased] ? this.propertiesMap[camelCased].icon : 'simple-square',
            groupName: camelCased
          }
        });

        let result = {
          id: n.id,
          type: this.propertiesMap[n.group] ? this.propertiesMap[n.group].icon : 'simple-square',
          value: n.label ? n.label : 'N/A',
          label: n.group ? n.group : 'N/A',
          selected: n.id === newData.selectedNodeId,
          properties: [
            ...props
          ]
        };

        this.links = newData.links.map(e => {
          return {
            id: `${e.from}-${e.to}`,
            label: e.label,
            from: e.from,
            to: e.to,
            connectionFrom: e.connectionFrom ? e.connectionFrom : false,
            connectionTo: e.connectionTo ? e.connectionTo : true
          };
        });

        return result;
      });

      let selectedNode = this.nodes.filter(n => n.selected === true).pop();

      this.nodes = [ ...compute(selectedNode.id, this.nodes, this.links, newData.graphDirection) ];

      this.links = [
        ...this.links.map(e => {
          return {
            id: `${e.from}-${e.to}`,
            label: e.label,
            from: this.nodes.find(n => n.id === e.from),
            to: this.nodes.find(n => n.id === e.to),
            connectionFrom: e.connectionFrom,
            connectionTo: e.connectionTo
          };
        })
      ];

      this.initGraph();
      this.addNodes();
      this.addLinks();
      this.centerGraph();
    } else {
      console.log('NEW_DATA_EMPTY');
    }
  }

  removeData() {
    this.nodes = [];
    this.links = [];
    this.data = null;

    this.allGroup ? this.allGroup.remove() : console.log('ALL_GROUP_EMPTY');
  }

  initGraph() {
    this.svg = d3.select(this.$.svg);

    this.allGroup =
      this.svg
        .append('g')
        .attr('class', 'all-group');

    this.linksGroup = this.allGroup.append('g').attr('class', 'links-group');
    this.nodesGroup = this.allGroup.append('g').attr('class', 'nodes-group');

    this.zoom =
      d3.zoom()
        .on('zoom', this.zooming);

    this.svg.call(this.zoom);
  }

  addNodes() {
    let self = this;

    let nodesGroup = this.nodesGroup.selectAll()
      .data(this.nodes)
      .enter();

    let nodeGroup =
      nodesGroup
        .append('g')
        .classed('node-group', true)
        .attr('id', (d) => d.id)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .call(
          d3.drag()
            .on('start', (d) => {
              console.log('DRAG_START', d);
            })
            .on('drag', function(d) {
              d.x = d3.event.x;
              d.y = d3.event.y;

              d3.select(this)
                .attr('transform', `translate(${d3.event.x}, ${d3.event.y})`);

                let _links =
                  d3.select(
                    d3.select(this)
                      .node()
                      .parentNode
                      .parentNode
                  )
                  .selectAll('.links-group')
                  .selectAll('line');

                _links
                  .filter(function(_d) {
                    return _d.to.id === d.id;
                  })
                  .attr('x2', () => self.graphDirection === 'HORIZONTAL' ? d3.event.x - 3 : d3.event.x + (100/2))
                  .attr('y2', () => self.graphDirection === 'HORIZONTAL' ? d3.event.y + (50/2) : d3.event.y + (100 /2));

                _links
                  .filter(function(_d) {
                    return _d.from.id === d.id;
                  })
                  .attr('x1', () => self.graphDirection === 'HORIZONTAL' ? d3.event.x + 100 : d3.event.x + (100/2))
                  .attr('y1', () => self.graphDirection === 'HORIZONTAL' ? d3.event.y + (50/2) : d3.event.y);
            })
            .on('end', (d) => {
              console.log('DRAG_END', d);
            })
        );

    nodeGroup
      .append('rect')
      .attr('width', 100)
      .attr('height', 50)
      .attr('style', 'fill: #69b3a2')
      .attr('stroke', 'black')
      .attr('rx', 6)
      .attr('ry', 6);
  }

  addLinks() {
    let self = this;

    let linksGroup = this.linksGroup.selectAll()
      .data(this.links)
      .enter();

    linksGroup
      .append('line')
      .style('stroke', 'black')
      .style('stroke-width', 2)
      .attr('marker-start', (d) => (d.connectionFrom) ? 'url(#arrow-start)' : '')
      .attr('marker-end', (d) => (d.connectionTo) ? 'url(#arrow-end)' : '')
      .attr('from', function(d) { return d.from.id; })
      .attr('to', function(d) { return d.to.id; })
      .attr('x1', (d) => self.graphDirection === 'HORIZONTAL' ? d.from.x + 100 : d.from.x + (100/2))
      .attr('y1', (d) => self.graphDirection === 'HORIZONTAL' ? d.from.y + (50/2) : d.from.y)
      .attr('x2', (d) => self.graphDirection === 'HORIZONTAL' ? d.to.x - 3 : d.to.x + (100/2))
      .attr('y2', (d) => self.graphDirection === 'HORIZONTAL' ? d.to.y + (50/2) : d.to.y + (100/2));
  }

  zooming() {
    this.allGroup.attr('transform', d3.event.transform);
  }

  customZoom(value) {
    if (value > 0) {
      this.zoom.scaleBy(this.svg.transition(), 1.3);
    } else {
      this.zoom.scaleBy(this.svg.transition(), 0.7);
    }
  }

  customZoomIn() {
    this.customZoom(1);
  }

  customZoomOut() {
    this.customZoom(-1);
  }

  centerGraph() {
    let self = this;

    let svgWidth = parseInt(this.svg.style('width'));
    let svgHeight = parseInt(this.svg.style('height'));

    let graphBBox = this.allGroup.node().getBBox();

    let scaledBy = Math.min(
      (svgWidth - 50) / graphBBox.width,
      (svgHeight - 50) / graphBBox.height,
      1
    );

    let svgCenter = {
      x: svgWidth / 2,
      y: svgHeight / 2
    };

    this.svg.transition()
      .call(
        self.zoom.transform,
        d3.zoomIdentity
          .translate(
            svgCenter.x - ((graphBBox.x * scaledBy) + (graphBBox.width * scaledBy) / 2),
            svgCenter.y - ((graphBBox.y * scaledBy) + (graphBBox.height * scaledBy) / 2)
          )
          .scale(scaledBy)
      )
  }

  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          flex-grow: 1;
          width: 100%;
          height: 100%;
        }
      </style>

      <svg id="svg" width="100%" height="100%">
        <defs>
          <marker id="arrow-start"
                  markerWidth="10"
                  markerHeight="10"
                  refx="0"
                  refy="3"
                  orient="auto"
                  markerUnits="strokeWidth">
            <path d="M9,0 L9,6 L0,3 z" fill="#000" />
          </marker>

          <marker id="arrow-end"
                  markerWidth="10"
                  markerHeight="10"
                  refx="7"
                  refy="3"
                  orient="auto"
                  markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#000" />
          </marker>
        </defs>
      </svg>
    `;
  }
}

window.customElements.define('happi-graph', HappiGraph);
