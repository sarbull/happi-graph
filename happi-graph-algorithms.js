/*
let nodes = [
  { id: 4, value: "Node 4" },
  { id: 2, value: "Node 2" },
  { id: 1, value: "Node 1" },
  { id: 3, value: "Node 3" },
  { id: 5, value: "Node 5" },
  { id: 6, value: "Node 6" },
  { id: 7, value: "Node 7" },
  { id: 8, value: "Node 8" }
];

let edges = [
  { from: 4, to: 5 },
  { from: 3, to: 4 },
  { from: 1, to: 4 },
  { from: 2, to: 4 },
  { from: 5, to: 6 },
  { from: 5, to: 7 },
  { from: 5, to: 8 },
];

// */

function mapped(_data) {
  let result = {};

  _data.nodes.forEach(n => {
    result[n.id] = {
      ...n,
      linksTo: [
        ..._data.links.filter(e => e.from === n.id).map(e => {
          return e.to
        })
      ],
      linksFrom: [
        ..._data.links.filter(e => e.to === n.id).map(e => {
          return e.from
        })
      ],
      visited: false
    }
  });

  return result;
}

function initializeCoords(currentNode, orientation, linksCount, side) {
  let coords = {};

  if(orientation === 'HORIZONTAL') {
    coords = {
      ww: side > 0 ? currentNode.w - 1 : currentNode.w + 1,
      hh: currentNode.h - parseInt(linksCount / 2)
    }
  } else if(orientation === 'VERTICAL') {
    coords = {
      ww: currentNode.w - parseInt(linksCount / 2),
      hh: side > 0 ? currentNode.h + 1 : currentNode.h - 1
    }
  }

  return coords;
}

function incrementCoords(coords, orientation, linksCount) {
  if(linksCount === 2) {
    if(orientation === 'HORIZONTAL') {
      coords.hh++;
      coords.hh++;
    } else if(orientation === 'VERTICAL') {
      coords.ww++;
      coords.ww++;
    }
  } else {
    if(orientation === 'HORIZONTAL') {
      coords.hh++;
    } else if(orientation === 'VERTICAL') {
      coords.ww++;
    }
  }

  return coords;
}

function calc(_startNode, _data, orientation) {
  _startNode = { ..._startNode, visited: true, w: 0, h: 0 };

  _data = {
    ..._data,
    [_startNode.id]: {
      ..._startNode
    }
  }

  // linksFrom

  let linksFromExplore = [_startNode];

  while (linksFromExplore.length > 0) {
    let currentNode = linksFromExplore.shift();

    let linksCount = currentNode.linksFrom.length;

    if (linksCount > 0) {
      let coords = initializeCoords(currentNode, orientation, linksCount, 1);

      currentNode.linksFrom.forEach(linkedNode => {
        _data = {
          ..._data,
          [linkedNode]: { ..._data[linkedNode], visited: true, w: coords.ww, h: coords.hh }
        };

        coords = incrementCoords(coords, orientation, linksCount);

        // if (!_data[linkedNode].visited) {
        linksFromExplore.push(_data[linkedNode]);
        // }
      });
    }

    // linksTo

    let linksToExplore = [_startNode];

    while (linksToExplore.length > 0) {
      let currentNode = linksToExplore.shift();

      let linksCount = currentNode.linksTo.length;

      if (linksCount > 0) {
        let coords = initializeCoords(currentNode, orientation, linksCount, -1);

        currentNode.linksTo.forEach(linkedNode => {
          _data = {
            ..._data,
            [linkedNode]: { ..._data[linkedNode], visited: true, w: coords.ww, h: coords.hh }
          };

          coords = incrementCoords(coords, orientation, linksCount);

          // if (!_data[linkedNode].visited) {
          linksToExplore.push(_data[linkedNode]);
          // }
        });
      }
    }
  }

  return _data;
}

export const compute = (_startNodeId, _nodes, _links, orientation) => {
    let mappedData = mapped({nodes: _nodes, links: _links});

    let startNode = mappedData[_startNodeId];

    let computed = calc(startNode, mappedData, orientation);

    let result = [];

    Object.keys(computed).forEach(k => {
      result.push(computed[k]);
    });

    result = result.map(n => {
      let result = {
        ...n,
        x: n.w ? n.w * 150 : 0, // TODO: calculate these coordinates so that
        y: n.h ? n.h * 150 : 0, //       all nodes are centered
      };

      return result;
    })

    return result;
};