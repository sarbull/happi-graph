import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `happi-graph`
 * Happi Graph Web Component using Polymer 3.0
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class HappiGraph extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'happi-graph',
      },
    };
  }
}

window.customElements.define('happi-graph', HappiGraph);
