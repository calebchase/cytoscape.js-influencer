import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import fcose from 'cytoscape-fcose';
import cytoscape from 'cytoscape';
import CyHandler from './CyHandler';
import Papa from 'papaparse';
import { json } from 'stream/consumers';

function InfluencerGraph() {
  const [jsonArray, setJsonArray] = useState([]);
  const elements = [{ data: { id: 'dummyNode' } }];

  let cyHandler: CyHandler = new CyHandler();

  let added = false;

  cytoscape.use(fcose);

  useEffect(() => {
    NetworkToElements(cyHandler).then((elements) => {
      if (added) return;
      added = true;
      cyHandler.AddAndStyle(elements);
      cyHandler.RunLayout();
    });
  }, []);

  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={[
        {
          selector: 'node',
          style: {
            label: 'data(id)',
            width: 50,
            height: 20,
            shape: 'round-rectangle',
            'text-halign': 'center',
            'text-valign': 'center',
          },
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
          },
        },
      ]}
      // Width and height should be changed, this is a temp solution to a problem with height being 0
      style={{ width: '100%', height: '900px' }}
      cy={(cy) => cyHandler.SetCy(cy)}
    />
  );
}

async function NetworkToElements(cyHandler: CyHandler) {
  let jsonArray = await CsvToJson();
  console.log(jsonArray);
  let elements: any = [];

  jsonArray.data.forEach((callEvent: any) => {
    elements.push(PersonToNode(callEvent.influencer));
    elements.push(PersonToNode(callEvent.influencee));
    elements.push(PersonToNode(callEvent.receiver));
  });

  jsonArray.data.forEach((callEvent: any) => {
    let hexColor = RandomHexColor();
    elements.push(
      PeopleToEdge(
        callEvent.influencer,
        callEvent.influencee,
        callEvent.count,
        'first',
        hexColor
      )
    );
    elements.push(
      PeopleToEdge(
        callEvent.influencee,
        callEvent.receiver,
        callEvent.count,
        'second',
        hexColor
      )
    );
  });

  return elements;
}

function PersonToNode(name: string) {
  return {
    data: { id: name, label: name },
    position: { x: 10 * Math.random(), y: 10 * Math.random() },
  };
}

function PeopleToEdge(
  nameA: string,
  nameB: string,
  count: number,
  callType: string,
  color: string
) {
  return {
    data: {
      source: nameA,
      target: nameB,
      callType: callType,
      count: count,
      label: `${count}`,
      randomColor: color,
    },
  };
}

async function CsvToJson() {
  let jsonArray: any;

  await fetch('/network.csv')
    .then((response) => response.text())
    .then((responseText) => {
      jsonArray = Papa.parse(responseText, { header: true });
    });

  return jsonArray;
}

function componentToHex(c: number) {
  var hex = Math.round(c).toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function RandomHexColor() {
  return rgbToHex(
    Math.random() * 256,
    Math.random() * 256,
    Math.random() * 256
  );
}

export default InfluencerGraph;
