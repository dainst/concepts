import {AfterViewInit, Component, computed, effect, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {Backend} from '../../services/backend';
import * as d3 from 'd3';
import {GraphLink, GraphNode} from '../../interfaces/graph';
import {prepareGraphData} from '../../functions/graph-data';
import {from, map, mergeMap} from 'rxjs';

@Component({
  selector: 'app-concept-view-graph',
  imports: [],
  templateUrl: './concept-view-graph.html',
  styleUrl: './concept-view-graph.css',
})
export class ConceptViewGraph extends ConceptViewComponent implements AfterViewInit {
  @ViewChild('graph', { static: true }) graphContainer!: ElementRef;
  private readonly bs = inject(Backend);
  private viewInitialized = signal(false);

  private d3!: {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    links: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodes: d3.Selection<SVGGElement, unknown, null, undefined>;

    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
    linkForce: d3.ForceLink<GraphNode, GraphLink>;

    simulation: d3.Simulation<GraphNode, undefined>;
  }

  private readonly data = computed(() => prepareGraphData(this.concept()));

  constructor() {
    super();
    effect(() => {
      const data = this.data();
      if (!this.viewInitialized()) return;
      this.update(data.links, data.nodes);
    });
  }

  ngAfterViewInit() {
    this.initialize();
  }

  private initialize() {
    const width = this.graphContainer.nativeElement.clientWidth;
    const height = this.graphContainer.nativeElement.clientHeight;

    const svg = d3
      .select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const viewport = svg.append("g");

    const links = viewport.append("g")
      .classed("links", true);

    const nodes = viewport.append("g")
      .classed("nodes", true);



    const linkForce= d3.forceLink<GraphNode, GraphLink>();
    const simulation = d3.forceSimulation<GraphNode>([]);
    simulation
      .nodes([])
      .force("link", linkForce)
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alpha(1)
      .on("tick", () => {
        const nodeGroups = nodes
          .selectAll<SVGGElement, GraphNode>("g.node");
        nodeGroups.attr("transform", d =>
          `translate(${d.x},${d.y})`
        );
        this.d3.links
          .selectAll<SVGLineElement, GraphLink>("line")
          .attr("x1", d => (d.source as GraphNode).x!)
          .attr("y1", d => (d.source as GraphNode).y!)
          .attr("x2", d => (d.target as GraphNode).x!)
          .attr("y2", d => (d.target as GraphNode).y!);
      })
    .restart();

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", event => {
        viewport.attr("transform", event.transform);
      });
    svg.call(zoom);

    this.d3 = {svg, links, nodes, linkForce, simulation, zoom};

    this.viewInitialized.set(true);
  }

  private update(links: GraphLink[], nodes: GraphNode[]) {
    console.log('update', {links, nodes})
    this.d3.linkForce.links(links);
    this.d3.simulation.nodes(nodes);
    this.d3.simulation.alpha(1).restart();

    const nodeSelection = this.d3.nodes
      .selectAll<SVGCircleElement, GraphNode>("g.node")
      .data(nodes, d => d.id);

    nodeSelection.exit().remove();

    const nodeGroups = nodeSelection.enter()
      .append("g")
      .classed("node", true);
    const circles = nodeGroups
      .append("circle")
      .attr("r", 18);
    const texts = nodeGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d.id);

    const linkSelection = this.d3.links
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links);

    linkSelection.exit().remove();

    linkSelection.enter()
      .append("line");

    // TODO sich selbst nicht noch mal laden bitte
    // TODO load next relations as well
    from(nodes).pipe(
      mergeMap(node =>
        this.bs.getConcept(node.type, node.id)
          .pipe(
            map(label => ({ node, label }))
          )
      )
    )
      .subscribe(labelUpdate => {
        texts
          .filter(t => t.id === labelUpdate.label.id.id && t.type === labelUpdate.label.id.type)
          .text(labelUpdate.label.title ?? labelUpdate.label.id.id)
      })
  }
}
