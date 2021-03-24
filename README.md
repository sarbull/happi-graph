# happi-graph component

Happi Graph Component using Polymer 3.0.

## Demo

```html
<button id="zoom-in">+</button>
<button id="zoom-out">-</button>
<button id="center-graph">center-graph</button>
<button id="remove-data">remove-data</button>
<button id="add-data">add-data</button>

<happi-graph id="happi-graph"></happi-graph>
```

```js
let propertiesMap = {
  SimpleSquare: 'simple-square'
};

let iconsMap = {
  'simple-square': `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H20V20H0V0Z" fill="white"/></svg>`,
};

let happiGraphInstance = document.querySelector('#happi-graph');

let data = {
  nodes: [
    {id: 0, x: 0, y: 200},
    {id: 1, x: 600, y: 0},
    {id: 2, x: 600, y: 200},
    {id: 3, x: 600, y: 400},
  ],
  links: []
};

data.links = [
  { from: data.nodes[0], to: data.nodes[1], connectionFrom: false, connectionTo: true },
  { from: data.nodes[0], to: data.nodes[2], connectionFrom: false, connectionTo: true },
  { from: data.nodes[0], to: data.nodes[3], connectionFrom: false, connectionTo: true }
];

happiGraphInstance.data = { ...data };
happiGraphInstance.iconsMap = iconsMap;
happiGraphInstance.propertiesMap = propertiesMap;

zoomIn.addEventListener('click', () => {
  happiGraphInstance.customZoomIn();
});

zoomOut.addEventListener('click', () => {
  happiGraphInstance.customZoomOut();
});

centerGraph.addEventListener('click', () => {
  happiGraphInstance.centerGraph();
});

document.querySelector('#remove-data').addEventListener('click', () => {
  happiGraphInstance.removeData();
});

document.querySelector('#add-data').addEventListener('click', () => {
  happiGraphInstance.data = { ...data };
});
```

## Example

![3 nodes graph example](./docs/print-screen-happi-graph-3-nodes.png?raw=true "3 nodes graph example")
