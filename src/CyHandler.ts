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
      edge.style('width', Math.pow(edge.data('count'), 0.3));
      edge.style('line-color', edge.data('randomColor'));
      edge.style('target-arrow-color', edge.data('randomColor'));

      if (edge.data('callType') === 'first') {
        edge.style('line-style', 'dashed');
        edge.style('line-dash-pattern', [6, 3]);
        console.log('hhehehe');
      }
    });
  }

  RunLayout() {
    if (!this.cySet) return;
    this.cy.layout({ name: 'fcose' }).run();
  }
}

export default CyHandler;
