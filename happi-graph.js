import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import * as d3 from 'd3';

class HappiGraph extends PolymerElement {
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
      nodes: {
        type: Array,
        value: []
      },
      links: {
        type: Array,
        value: []
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.svg = d3.select(this.$.svg);

    this.allGroup =
      this.svg
        .append('g')
        .attr('class', 'all-group');

    this.linksGroup = this.allGroup.append('g').attr('class', 'links-group');
    this.nodesGroup = this.allGroup.append('g').attr('class', 'nodes-group');

    this.zoom =
      d3.zoom()
        .on('zoom', () => {
          this.allGroup.attr('transform', `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${d3.event.transform.k})`)
        });

    this.svg.call(this.zoom);

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
              console.log('DRAG_START', d.id);
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
                  .attr('x2', d3.event.x - 3)
                  .attr('y2', d3.event.y + (100/2));

                _links
                  .filter(function(_d) {
                    return _d.from.id === d.id;
                  })
                  .attr('x1', d3.event.x + 300)
                  .attr('y1', d3.event.y + (100/2));
            })
            .on('end', (d) => {
              console.log('DRAG_END', d.id);
            })
        );

    nodeGroup
      .append('rect')
      .attr('width', 300)
      .attr('height', 100)
      .attr('style', 'fill: #69b3a2')
      .attr('stroke', 'black')
      .attr('rx', 6)
      .attr('ry', 6);

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
      .attr('x1', function(d) { return d.from.x + 300; })
      .attr('y1', function(d) { return d.from.y + (100/2); })
      .attr('x2', function(d) { return d.to.x - 3; })
      .attr('y2', function(d) { return d.to.y + (100/2); });

      let maxW = parseInt(this.svg.style('width'), 10);
      let maxH = parseInt(this.svg.style('height'), 10);

      let currentWidth = this.allGroup.node().getBBox().width;
      let currentHeight = this.allGroup.node().getBBox().height;

      let scaledBy;

      if(currentWidth > currentHeight) {
        scaledBy = (maxW - 100)/currentWidth;
      } else {
        scaledBy = (maxH - 100)/currentHeight;
      }

      console.log(
        'maxW =', maxW,
        'maxH =', maxH,
        'currentWidth =', currentWidth,
        'currentHeight =', currentHeight,
        scaledBy
      );

      this.svg.transition()
        .call(
          this.zoom.transform,
          d3.zoomIdentity
            .translate(
              (maxW/2) - ((currentWidth * scaledBy)/2),
              (maxH/2) - ((currentHeight * scaledBy)/2)
            )
            .scale(scaledBy)
        );
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
