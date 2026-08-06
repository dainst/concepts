import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {Backend} from '../../services/backend';
import * as d3 from 'd3';
import {GraphLink, GraphNode} from '../../interfaces/graph';
import {prepareGraphData} from '../../functions/graph-data';
import {delay, from, map, mergeMap, Observable, of, Subscription, switchMap} from 'rxjs';
import {Concept} from 'concepts-common/interfaces/concept';
import {isLabelledConcept} from 'concepts-common/functions/concept.typeguards';

@Component({
  selector: 'app-concept-view-graph',
  imports: [],
  templateUrl: './concept-view-graph.html',
  styleUrl: './concept-view-graph.css',
})
export class ConceptViewGraph extends ConceptViewComponent implements AfterViewInit, OnDestroy {
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

  private readonly subscriptions: Subscription[] = [];

  private readonly data = computed(() => prepareGraphData(this.concept()));

  constructor() {
    super();
    effect(() => {
      const data = this.data();
      if (!this.viewInitialized()) return;
      this.update(data.links, data.nodes);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions
      .forEach(subscription => subscription.unsubscribe());
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

    const loadNodes = from(nodes)
      .pipe(
        delay(500),
        mergeMap((node: GraphNode) => this.getNodeData(node))
      )
      .subscribe(concept => {
        this.applyData(concept);
      });
    this.subscriptions.push(loadNodes);
  }

  private getNodeData(node: GraphNode): Observable<Concept> {
    console.log('> getNodeData', node.id);
    const match = this.data().nodes
      .find(n => node.id === n.id && node.type === n.type);
    if (match) {
      console.log('already here', match, isLabelledConcept(match.concept))
      if (isLabelledConcept(match.concept)) return of(match.concept);
    }
    console.log('> getConcept', node.id);
    return this.bs.getConcept(node.type, node.id);
  }

  private applyData(concept: Concept): void {
    const node = this.d3.nodes
      .selectAll<SVGCircleElement, GraphNode>("g.node")
      .filter(t => t.id === concept.id.id && t.type === concept.id.type);
    node.datum().concept = concept;
    node
      .attr("class", d => d.concept ? `node node-type-${d.concept.id.type} node-domain-${d.concept.domain}` : 'node');
    node
      .select('text')
      .text(d => d?.concept?.title ?? `#${concept.id.id}`);
  }

  // private getRelated(con)
}
