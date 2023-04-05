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

  //   interactionCount
  // :
  // influencee
  // :
  // 2
  // influencer
  // :
  // 0
  // reciever
  // :
  // 0

  EnableHtmlNode() {
    // @ts-ignore
    // registering the htmlnode does not add the extension to core...
    this.cy.htmlnode().createHtmlNode(cytoscape, this.cy, {
      event: {
        query: 'node',
        template: [
          {
            zoomRange: [0.0001, 100],
            template: {
              html: `
                    <div id="htmlLabel:#{data.id}" class="EdgePadding">
                      <div>
                        #{data.id}
                      </div>
                      <div>
                      Influencer: #{data.influencer}
                      </div>
                      <div>
                      Influencee: #{data.influencee}
                      </div>
                      <div>
                      Reciever: #{data.reciever}
                      </div>
                    </div>`,
            },
          },
        ],
      },
    });
  }

  AddAndStyle(elements: any) {
    if (this.cy === undefined) return;

    this.cy.add(elements);
    this.cy.remove('#dummyNode');

    this.cy.edges().forEach((edge) => {
      edge.style('width', Math.pow(edge.data('Count'), 0.4));
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
      console.log(node.data());
    });
  }

  RunLayout() {
    if (!this.cySet) return;

    this.cy
      .layout({
        name: 'fcose',
        // not sure why ts complains as the following functions fine
        // @ts-ignore
        idealEdgeLength: (edge: any) => 200,
        nodeRepulsion: (node: any) => 90000,
      })
      .run();
  }
}

export default CyHandler;
