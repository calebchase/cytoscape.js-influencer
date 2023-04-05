import cytoscape from 'cytoscape';

class CyHandler {
  cy!: cytoscape.Core;
  cySet: boolean = false;

  constructor() {}

  SetCy(cy: cytoscape.Core) {
    this.cy = cy;
    this.cySet = true;
  }

  AddAndStyle(elements: any) {
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

  RunLayout() {
    if (!this.cySet) return;
    // @ts-ignore
    this.cy.layout({ name: 'fcose', idealEdgeLength: edge => 125, nodeRepulsion: node => 9000 }).run();
  }
}

export default CyHandler;
