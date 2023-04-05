import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import fcose from 'cytoscape-fcose';
import cytoscape from 'cytoscape';
import CyHandler from './CyHandler';
import Papa from 'papaparse';
import { register as htmlnode } from 'cytoscape-html-node';

// move to sep file
interface interaction {
  influencee: number;
  reciever: number;
  influencer: number;
}

function InfluencerGraph() {
  const [jsonArray, setJsonArray] = useState([]);
  const elements = [{ data: { id: 'dummyNode' } }];

  let cyHandler: CyHandler = new CyHandler();

  let added = false;

  cytoscape.use(fcose);
  cytoscape.use(htmlnode);

  useEffect(() => {
    NetworkToElements(cyHandler).then(([elements, interactionCount]) => {
      console.log(interactionCount);
      if (added) return;
      added = true;
      cyHandler.AddAndStyle(elements);
      cyHandler.EnableHtmlNode();
      cyHandler.AddCountData(interactionCount);
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
            shape: 'round-rectangle',
            'text-halign': 'center',
            'text-valign': 'center',
            'background-color': 'lightgrey',
          },
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            label: 'data(Count)',
            'text-background-color': 'black',
            'text-background-shape': 'rectangle',
            'text-border-color': 'red',
            'text-border-opacity': 10,
            'control-point-step-size': 30,
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
  let elements: any = [];
  let interactionCount = new Map<string, interaction>();

  jsonArray.data.forEach((callEvent: any) => {
    elements.push(
      PersonToNode(
        callEvent.influencer,
        callEvent.Count,
        'influencer',
        interactionCount
      )
    );
    elements.push(
      PersonToNode(
        callEvent.influencee,
        callEvent.Count,
        'influencee',
        interactionCount
      )
    );
    elements.push(
      PersonToNode(
        callEvent.reciever,
        callEvent.Count,
        'reciever',
        interactionCount
      )
    );
  });

  jsonArray.data.forEach((callEvent: any) => {
    let hexColor = RandomHexColor();
    elements.push(
      PeopleToEdge(
        callEvent.influencer,
        callEvent.influencee,
        callEvent.Count,
        'first',
        hexColor
      )
    );
    elements.push(
      PeopleToEdge(
        callEvent.influencee,
        callEvent.reciever,
        callEvent.Count,
        'second',
        hexColor
      )
    );
  });

  return [elements, interactionCount];
}

function AddCount(
  name: string,
  count: number,
  interactionType: keyof interaction,
  interactionCount: Map<string, interaction>
) {
  if (!interactionCount.has(name)) {
    interactionCount.set(name, {
      influencee: 0,
      influencer: 0,
      reciever: 0,
    });
  }

  interactionCount.get(name)![interactionType] += Number(count);
}

function PersonToNode(
  name: string,
  count: number,
  interactionType: keyof interaction,
  interactionCount: Map<string, interaction>
) {
  AddCount(name, count, interactionType, interactionCount);

  return {
    data: { id: name, label: name },
    position: { x: 10 * Math.random(), y: 10 * Math.random() },
  };
}

function PeopleToEdge(
  nameA: string,
  nameB: string,
  Count: number,
  callType: string,
  color: string
) {
  return {
    data: {
      source: nameA,
      target: nameB,
      callType: callType,
      Count: Count,
      label: `${Count}`,
      randomColor: color,
    },
  };
}

async function CsvToJson() {
  let jsonArray: any;

  await fetch('/network2.csv')
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
