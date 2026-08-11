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
import {GraphLink, GraphNode, GraphSettings, RelativeNodePosition} from '../../interfaces/graph';
import {stringifyId, stringifyLinkId} from '../../functions/graph-data';
import {from, map, mergeMap, Observable, of, Subscription} from 'rxjs';
import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import {isLabelledConcept} from 'concepts-common/functions/concept.typeguards';
import {DragBehavior, SubjectPosition} from 'd3';
import {SearchShard} from 'concepts-common/interfaces/search';

const settings: GraphSettings = {
  expand: {
    backward: {
      hasPeriodType: 1,
      broader: 0
    },
    forward: {
      hasPeriodType: 1
    },
    default: {
      forward: 5,
      backward: 5
    }
  },
  linkForce: -1000
}




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
      this.update(this.registerConceptRelations(concept, 0, 'o'));
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
      .force("charge", d3.forceManyBody().strength(settings.linkForce))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alpha(1)
      .on("tick", () => {
        this.d3.nodesGroup
          .selectAll<SVGGElement, GraphNode>("g.node")
          .attr("transform", d => `translate(${d.x},${d.y})`);
        this.d3.linksGroup
          .selectAll<SVGPathElement, GraphLink>("path")
          .attr("d", d => `
            M ${(d.source as GraphNode).x} ${(d.source as GraphNode).y}
            L ${(d.target as GraphNode).x} ${(d.target as GraphNode).y}
          `);
      })
    .restart();

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", event => {
        viewport.attr("transform", event.transform);
      });
    svg.call(zoom);

    const defs = svg.append("defs");

    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

    d3.select(window).on('resize', () => this.resize());

    this.d3 = {svg, linksGroup, nodesGroup, linkForce, simulation, zoom};

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

        if (this.graph.nodes.size >= 100) {
          return
        }

        const nodesDelta = this.registerConceptRelations(concept, node.distance, node.relativePosition);
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

        g.call(this.createDrag());

        return g;
      });

    this.d3.linksGroup
      .selectAll<SVGPathElement, GraphLink>("g.link")
      .data(links, stringifyLinkId)
      .join(enter => {
        const g = enter
          .append('g')
          .attr("class", d =>`link link-${d.relation.type} link${d.direction}`);

        g.append('path')
          .attr("class", "link-path")
          .attr("fill", "none")
          .attr("marker-end", d => d.direction === "→" ? "url(#arrow)" : null)
          .attr("marker-start", d => d.direction === "←" ? "url(#arrow)" : null)
          .attr("id", d => `link-path-${stringifyLinkId(d)}`);

        g.append('text')
          .attr("dy", "-0.35em")
          .append("textPath")
          .attr("href", d => `#link-path-${stringifyLinkId(d)}`)
          .attr("text-anchor", "middle")
          .attr("startOffset", "50%")
          .text(d => d.relation.id); // TODO label

        return g;
      });
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
        console.log(`[GET] ${node.type}/${node.id} : ALLREADY THERE`);
        return of([node, match.concept]);
      } else {
      }
    }

    const shards: SearchShard[] = [node.relativePosition === '→' ? 'relations_to' : 'relations_from'];

    console.log(`[GET] ${node.type}/${node.id} : ${shards.join('|')}`)

    return this.bs.search({type: node.type, id: node.id, shards})
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

  private registerConceptRelations(concept: Concept, distance: number, relativePosition: RelativeNodePosition): GraphNode[] {
    // note: object reference of concepts have to be kept, because D3 uses them to identify identity!
    const newNodes: GraphNode[] =[];

    const dub = !concept ? '(·)' : `→ ${concept.relationsTo?.length} / ← ${concept.relationsFrom?.length}`;

    const getGraphNode = (
      conceptId: ConceptId,
      distance: number,
      relativePosition: RelativeNodePosition,
      concept: Concept|undefined = undefined,
    ): GraphNode => {
      const sid = stringifyId(conceptId);

      const node = this.graph.nodes.get(sid);
      if (node) {
        console.log(`R ${relativePosition} ${sid} OK ${dub}`);
        return node;
      }
      const newNode: GraphNode = {
        ...conceptId,
        distance,
        concept,
        relativePosition
      };
      this.graph.nodes.set(sid, newNode);
      newNodes.push(newNode);
      console.log(`R ${relativePosition} ${sid} NEW ${dub}`);
      return newNode;
    }

    const protagonist: GraphNode = getGraphNode(concept.id, distance, relativePosition, concept);

    const links: GraphLink[] = [
      ...(concept.relationsTo ?? [])
        .filter(r =>
          distance < (r.relation.id in settings.expand.forward
            ? settings.expand.forward[r.relation.id]
            : settings.expand.default.forward
          )
        )
        .flatMap(r => r.objects
          .map((target: ConceptId): GraphLink => ({
            source: protagonist,
            relation: r.relation,
            target: getGraphNode(target, distance + 1, '→'),
            direction: '→'
          }))
        ),
      ...(concept.relationsFrom ?? [])
        .filter(r =>
          distance < (r.relation.id in settings.expand.forward
            ? settings.expand.backward[r.relation.id]
            : settings.expand.default.backward
          )
        )
        .flatMap(r => r.objects
          .map((target: ConceptId): GraphLink => ({
            source: protagonist,
            relation: r.relation,
            target: getGraphNode(target, distance + 1, '←'),
            direction: '←'
          }))
        ),
    ];
    links
      .forEach(link => {
        this.graph.links.set(stringifyLinkId(link), link);
      });
    return newNodes;
  }

  private createDrag(): DragBehavior<SVGGElement, GraphNode, GraphNode | SubjectPosition> {
    return d3.drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) {
          this.d3.simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", event => {
        if (!event.active) {
          this.d3.simulation.alphaTarget(0);
        }
      });
  }
}
