import {
  AfterViewInit,
  Component,
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
import {stringifyId, stringifyLinkId} from '../../functions/graph-data';
import {delay, from, map, mergeMap, Observable, of, Subscription} from 'rxjs';
import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import {isLabelledConcept} from 'concepts-common/functions/concept.typeguards';

/* STAND
TODO next:
- resize
- pan
- relation types / directions
 */

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

    linksGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
    linkForce: d3.ForceLink<GraphNode, GraphLink>;

    simulation: d3.Simulation<GraphNode, undefined>;
  }

  private readonly subscriptions: Subscription[] = [];

  private graph = {
    nodes: new Map<string, GraphNode>(),
    links: new Map<string, GraphLink>()
  };

  constructor() {
    super();
    effect(() => {
      const concept = this.concept();
      if (!this.viewInitialized()) return;
      this.update(this.registerConceptRelations(concept, 0));
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

    const linksGroup = viewport.append("g")
      .classed("links", true);

    const nodesGroup = viewport.append("g")
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
        this.d3.nodesGroup
          .selectAll<SVGGElement, GraphNode>("g.node")
          .attr("transform", d => `translate(${d.x},${d.y})`);
        this.d3.linksGroup
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

    this.d3 = {svg, linksGroup, nodesGroup, linkForce, simulation, zoom};

    d3.select(window).on('resize', () => this.resize());

    this.viewInitialized.set(true);
  }

  private update(nodesDelta: GraphNode[]): void {
    const allNodes = [...this.graph.nodes.values()];
    const allLinks = [...this.graph.links.values()];

    this.draw(allLinks, allNodes);
    const loadAdjacentNodes = from(nodesDelta)
      .pipe(
        // delay(1500),
        mergeMap((node: GraphNode) => this.getNodeData(node)),
      )
      .subscribe(([node, concept]) => {
        if (!concept) {
          return;
        }
        this.applyConceptData(node, concept);

        if ((node.distance >= 7) || (this.graph.nodes.size >= 100)) {
          return
        }
        const nodesDelta = this.registerConceptRelations(concept, node.distance);
        this.update(nodesDelta);
      });
    this.subscriptions.push(loadAdjacentNodes);
  }

  private draw(links: GraphLink[], nodes: GraphNode[]): void {
    this.d3.linkForce.links(links);
    this.d3.simulation.nodes(nodes);
    this.d3.simulation.alpha(1).restart();

    this.d3.nodesGroup
      .selectAll<SVGCircleElement, GraphNode>("g.node")
      .data(nodes, stringifyId)
      .join(enter => {
        const g = enter
          .append("g")
          .classed("node", true);

        g.append("circle")
          .attr("r", d => (d.distance ?  + 18 : 36));

        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text(d => d.id);

        return g;
      });

    this.d3.linksGroup
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links, stringifyLinkId)
      .join("line");
  }

  private resize(): void {
    if (!this.d3) return;
    const width = this.graphContainer.nativeElement.clientWidth;
    const height = this.graphContainer.nativeElement.clientHeight;
    this.d3.svg
      .attr('width', width)
      .attr('height', height);
  }

  private getNodeData(node: GraphNode): Observable<[GraphNode, Concept]> {
    const match = this.graph.nodes.get(stringifyId(node));
    if (match) {
      if (isLabelledConcept(match.concept)) {
        return of([node, match.concept]);
      } else {
      }
    }
    return this.bs.search({type: node.type, id: node.id, shards: ['labels', 'relations_to']})
      .pipe(map(searchResult => [node, searchResult.results[0]]));
  }

  private applyConceptData(node: GraphNode, concept: Concept): void {
    if (!concept) return;

    const nodeElem: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> = this.d3.nodesGroup
      .selectAll<SVGGElement, GraphNode>("g.node")
      .filter(d => d === node);

    if (nodeElem.empty()) return;

    nodeElem.datum().concept = concept;
    nodeElem
      .attr("class", d => d.concept
        ? `node node-type-${d.concept.id.type} node-domain-${d.concept.domain} node-${d.distance}`
        : `node node-${d.distance}`);
    nodeElem
      .select('circle')
      .attr("r", d => (d.distance ? 18 : 36));
    nodeElem
      .select('text')
      .text(d => d?.concept?.title ?? `#${concept.id.id}`);
  }

  private registerConceptRelations(concept: Concept, distance: number): GraphNode[] {
    // note: object reference of concepts have to be kept, because D3 uses them to identify identity!
    const newNodes: GraphNode[] = [];

    const getGraphNode = (conceptId: ConceptId, distance: number): GraphNode => {
      const sid = stringifyId(conceptId);
      const node = this.graph.nodes.get(sid);
      if (node) return node;
      const newNode = {...conceptId, distance, concept: undefined};
      this.graph.nodes.set(sid, newNode);
      newNodes.push(newNode);
      return newNode;
    }

    const protagonist: GraphNode = getGraphNode(concept.id, distance);

    const links: GraphLink[] = [
      ...(concept.relationsTo ?? [])
        .flatMap(r => r.objects
          .map(target => ({
            source: getGraphNode(target, distance + 1),
            relation: r.relation,
            target: protagonist
          }))
        ),
      ...(concept.relationsFrom ?? [])
        .flatMap(r => r.objects
          .map(target => ({
            source: protagonist,
            relation: r.relation,
            target: getGraphNode(target, distance + 1)
          }))
        ),
    ];
    links
      .forEach(link => {
        this.graph.links.set(stringifyLinkId(link), link);
      });
    return newNodes;
  }
}
