import cytoscape from 'cytoscape';
import './HtmlNode.css';

// move to sep file
interface interaction {
  influencee: number;
  reciever: number;
  influencer: number;
}

class CyHandler {
  cy!: cytoscape.Core;
  cySet: boolean = false;

  constructor() {}

  SetCy(cy: cytoscape.Core) {
    this.cy = cy;
    this.cySet = true;
  }

  EnableHtmlNode() {
    //return;
    // @ts-ignore
    // registering the htmlnode does not add the extension to core...
    this.cy.htmlnode().createHtmlNode(cytoscape, this.cy, {
      person: {
        query: "[htmlNodeType = 'person']",
        template: [
          {
            zoomRange: [0.0001, 100],
            template: {
              html: `
                <div id="htmlLabel:#{data.id}" class="EdgePadding font">
                  <div class="CenterText bold">
                    #{data.id}
                  </div>

                  <div class="flex">

                    <div class="flex-column">
                      <div class="flex-child">
                        Influencer
                      </div>
                      <div class="flex-child"">
                        Influencee
                      </div> 
                      <div class="flex-child"">
                        Reciever
                      </div> 
                    </div>

                    <div class="flex-column">
                      <div class="flex-child">
                        #{data.influencer}
                      </div>
                      <div class="flex-child"">
                        #{data.influencee}
                      </div> 
                      <div class="flex-child"">
                        #{data.reciever}
                      </div> 
                    </div>

                  </div>
          
                </div>`,
            },
          },
        ],
      }, // end of person

      callEvents: {
        query: "[htmlNodeType = 'callEvents']",
        template: [
          {
            zoomRange: [0.0001, 100],
            template: {
              html: `
                <div id="htmlLabel:#{data.id}" class="EdgePadding font">
                  #{data.totalCount}
                </div>`,
            },
          },
        ],
      }, // end of callEvents

      callEventsDetail: {
        query: "[htmlNodeType = 'callEventsDetail']",
        template: [
          {
            zoomRange: [0.0001, 100],
            template: {
              html: `
                <div id="htmlLabel:#{data.id}" class="EdgePadding font">
                  <div class="flex">

                    <div class="flex-column">
                      <div class="flex-child bold">
                        Name
                      </div>
                      <div class="flex-child"">
                        #{data.nameA}
                      </div> 
                      <div class="flex-child"">
                        #{data.nameB}
                      </div> 
                    </div>

                    <div class="flex-column">
                      <div class="flex-child bold">
                       Caller
                      </div>
                      <div class="flex-child"">
                        #{data.callCountA}
                      </div> 
                      <div class="flex-child"">
                        #{data.callCountB}
                      </div> 
                    </div>

                  </div>

                </div>`,
            },
          },
        ],
      }, // end of callEventsDetail
    });
  }

  AddAndStyle(elements: any) {
    if (this.cy === undefined) return;

    this.cy.add(elements);
    this.cy.remove('#dummyNode');

    this.cy.edges().forEach((edge) => {
      edge.style('width', Math.pow(edge.data('Count'), 0.4) * 1.1);
      edge.style('arrow-scale', Math.pow(edge.data('Count'), 0.2));
      edge.style('line-color', edge.data('randomColor'));
      edge.style('target-arrow-color', edge.data('randomColor'));

      if (edge.data('callType') === 'first') {
        edge.style('line-style', 'dashed');
        edge.style('line-dash-pattern', [6, 3]);
      }
    });
  }

  AddCountData(interactionCount: Map<string, interaction>) {
    if (this.cy === undefined) return;

    this.cy.nodes().forEach((node) => {
      node.data('influencer', interactionCount.get(node.id())?.influencer);
      node.data('influencee', interactionCount.get(node.id())?.influencee);
      node.data('reciever', interactionCount.get(node.id())?.reciever);
    });
  }

  InitOnTap() {
    if (!this.cySet) return;

    this.cy.on('tap', (event) => {
      if (event.target.data('htmlNodeType') == 'callEvents')
        event.target.data('htmlNodeType', 'callEventsDetail');
      else if (event.target.data('htmlNodeType') == 'callEventsDetail')
        event.target.data('htmlNodeType', 'callEvents');
      else return;

      this.cy.add(this.cy.remove(event.target));
      this.RunLayout(true);
    });
  }

  RunLayout(reRun = false) {
    if (!this.cySet) return;

    this.cy
      .layout({
        name: 'fcose',
        // not sure why ts complains as the following functions fine
        // @ts-ignore
        idealEdgeLength: 80,
        nodeRepulsion: (node: any) => 100000,
        randomize: !reRun,
        animationDuration: 300,
        fit: !reRun,
        quality: 'proof',
        numIter: 2500,
      })
      .run();
  }
}

export default CyHandler;
