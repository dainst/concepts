import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  untracked,
  ViewChild
} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {Backend} from '../../services/backend';
import * as d3 from 'd3';
import {DragBehavior, SubjectPosition} from 'd3';
import {
  GraphColorProfile,
  GraphExpansionProfile,
  GraphInfo,
  GraphLink,
  GraphNode,
  GraphSettings
} from '../../interfaces/graph';
import {stringifyId, stringifyLinkId} from '../../functions/graph-data';
import {from, map, mergeMap, Observable, of, Subscription} from 'rxjs';
import {Concept, ConceptId} from 'concepts-common/interfaces/concept';
import {isLabelledConcept} from 'concepts-common/functions/concept.typeguards';
import {graphColorProfiles, graphExpansionProfiles} from './graph-profiles';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {KeyValuePipe} from '@angular/common';
import {removeSuffices} from '../../functions/title';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-concept-view-graph',
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
    RouterLink
  ],
  templateUrl: './concept-view-graph.html',
  styleUrl: './concept-view-graph.css',
})
export class ConceptViewGraph extends ConceptViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graph', { static: true }) graphContainer!: ElementRef;
  private readonly bs = inject(Backend);
  private readonly fb = inject(FormBuilder);
  private viewInitialized = signal(false); // TODO make obsolete and replace by d3?
  protected settingsPaneOpen = signal(false);
  protected infoPaneOpen = signal(true);


  protected settings: GraphSettings = {
    expand: graphExpansionProfiles["normal"],
    colors: graphColorProfiles["types"],
    linkForce: -500,
    maxNodes: 50
  };
  readonly settingsForm = this.fb.nonNullable.group({
    expand: ['normal'],
    colors: ['types'],
    linkForce: [this.settings.linkForce],
    maxNodes: [this.settings.maxNodes]
  });
  protected readonly profiles: {
    colors: Record<string, GraphColorProfile>;
    expansion: Record<string, GraphExpansionProfile>;
  } = {
    colors: graphColorProfiles,
    expansion: graphExpansionProfiles
  };

  private d3: {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    linksGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
    linkForce: d3.ForceLink<GraphNode, GraphLink>;

    simulation: d3.Simulation<GraphNode, undefined>;
  } | undefined = undefined;

  private resizeObserver!: ResizeObserver;
  private readonly subscriptions: Subscription[] = [];

  private graph = {
    nodes: new Map<string, GraphNode>(),
    links: new Map<string, GraphLink>()
  };

  protected graphInfo = signal<GraphInfo>({
    nodes: {
      classes: new Map(),
      count: 0,
      max: 0,
      classification: 'none'
    },
    profiles: {
      colors: 'types',
      expand: 'full'
    }
  }, {
    equal: () => false // classes can be big and mutating is cheaper than destructure and build map again
  });

  protected readonly hoveredNode = signal<GraphNode|undefined>(undefined);
  protected readonly selectedNode = signal<GraphNode|undefined>(undefined);
  protected selectedNodeSelection: d3.Selection<SVGGElement, unknown, null, undefined>|undefined;

  constructor() {
    super();
    effect(() => {
      const concept = this.concept();
      if (!this.viewInitialized()) return;
      // TODO reset graph
      untracked(() => { // enter the world of D3
        this.loadAdjacentNodes(this.registerConceptRelations(concept, 0));
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions
      .forEach(subscription => subscription.unsubscribe());
    this.resizeObserver?.disconnect();
  }

  ngAfterViewInit() {
    this.initialize();
  }

  private clear(): void {
    this.subscriptions
      .forEach(subscription => subscription.unsubscribe());
    this.resizeObserver?.disconnect();
    if (this.d3) {
      this.d3.simulation.stop();
      this.d3.svg.remove();
    }
    this.d3 = undefined;
    this.graph = {
      nodes: new Map<string, GraphNode>(),
      links: new Map<string, GraphLink>()
    };
    this.graphInfo.set({
      nodes: {
        classes: new Map(),
        count: 0,
        max: 0,
        classification: 'none'
      },
      profiles: {
        colors: this.graphInfo().profiles.colors,
        expand: this.graphInfo().profiles.expand
      }
    });
  }

  private initialize() {
    const width = this.graphContainer.nativeElement.clientWidth;
    const height = this.graphContainer.nativeElement.clientHeight;

    const svg = d3
      .select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const viewport = svg
      .append("g")
      .attr('class', 'graph-zoom-1');

    const linksGroup = viewport.append("g")
      .classed("links", true);

    const nodesGroup = viewport.append("g")
      .classed("nodes", true);

    const linkForce= d3.forceLink<GraphNode, GraphLink>()
      .distance(d => Math.max(100, 20 + d.relation.id.length * 7));
    const simulation = d3.forceSimulation<GraphNode>([]);
    simulation
      .nodes([])
      .force("link", linkForce)
      .force("charge", d3.forceManyBody().strength(this.settings.linkForce))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alpha(1)
      .on("tick", () => {
        if (!this.d3) return;
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
      .scaleExtent([0.1, 4])
      .on("zoom", event => {
        viewport
          .attr("transform", event.transform)
          .attr('class',`graph-zoom-${Math.floor(event.transform.k)}`);
      });
    svg.call(zoom);

    const defs = svg.append("defs");

    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.graphContainer.nativeElement);

    this.d3 = {svg, linksGroup, nodesGroup, linkForce, simulation, zoom};

    this.viewInitialized.set(true);
  }

  private loadAdjacentNodes(nodesDelta: GraphNode[]): void {
    const loadAdjacentNodes = from(nodesDelta)
      .pipe(
        mergeMap((node: GraphNode) => this.getNodeData(node)),
      )
      .subscribe(([node, concept]) => {
        if (!concept) return;

        this.graphInfo().nodes.count = this.graph.nodes.size;
        this.graphInfo().nodes.max = this.settings.maxNodes;
        this.graphInfo().nodes.classification = this.settings.colors.colorizeNodesBy;
        this.graphInfo.set(this.graphInfo()); // update view!

        const nodesDelta = this.registerConceptRelations(concept, node.distance);

        this.draw();
        this.applyConceptData(node, concept);
        this.loadAdjacentNodes(nodesDelta);
      });
    this.subscriptions.push(loadAdjacentNodes);
  }

  private draw(): void {
    if (!this.d3) return;
    const nodes = [...this.graph.nodes.values()];
    const links = [...this.graph.links.values()];

    this.d3.linkForce.links(links);
    this.d3.simulation.nodes(nodes);
    this.d3.simulation.alpha(1).restart();

    // if (!nodes.length) return;

    this.d3.nodesGroup
      .selectAll<SVGCircleElement, GraphNode>("g.node")
      .data(nodes, stringifyId)
      .join(enter => {
        const g = enter
          .append("g")
          .classed("node", true)
          .on("mouseenter", (_, d) => {
            this.hoveredNode.set(d);
          })
          .on("mouseleave", () => {
            this.hoveredNode.set(undefined);
          })
          .on("click", (event, node) => {
            event.stopPropagation();
            if (this.selectedNodeSelection) this.selectedNodeSelection
              .classed("selected", false);

            this.selectedNode.set(node);
            this.selectedNodeSelection = d3.select(event.currentTarget);

            this.selectedNodeSelection
              .classed("selected", true);
          });

        g.append("circle")
          .attr("r", d => (d.distance ? 18 : 36))
          .attr("fill", 'var(--graph-color-loading)');

        g.append("foreignObject")
          .attr("x", d => d.distance ? -18 : -36)
          .attr("y",  d => d.distance ? -18 : -36)
          .attr("width",  d => (d.distance ? 36 : 72))
          .attr("height",  d => (d.distance ? 36 : 72))
          .append("xhtml:div")
          .attr("class", d => `graph-node-label graph-node-size-${d.distance ? 'normal' : 'large'}`)
          .text(d => `#${d.id} `);

        g.call(this.createDrag());

        return g;
      });

    this.d3.linksGroup
      .selectAll<SVGGElement, GraphLink>("g.link")
      .data(links, stringifyLinkId)
      .join(enter => {
        const g = enter
          .append('g')
          .attr("class", d =>`link link-${d.relation.type}`);

        g.append('path')
          .attr("class", "link-path")
          .attr("fill", "none")
          .attr("marker-end", "url(#arrow)")
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
        return of([node, match.concept]);
      } else {
      }
    }

    return this.bs.search({type: node.type, id: node.id, shards: ['title', 'relations']})
      .pipe(map(searchResult => [node, searchResult.results[0]]));
  }

  private applyConceptData(node: GraphNode, concept: Concept): void {
    if (!concept) return;
    if (!this.d3) return;

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
      .attr("r", d => (d.distance ? 18 : 36))
      .attr('fill', d => `var(--${this.getNodeClassColor(d)})`)
    nodeElem
      .select('foreignObject > div')
      .text(d => removeSuffices(d.concept?.title ?? `#${d.id}`));
  }

  private registerConceptRelations(concept: Concept, distance: number): GraphNode[] {
    // note: object reference of concepts have to be kept, because D3 uses them to identify identity!
    const newNodes: GraphNode[] =[];

    const getOrCreateGraphNode = (
      conceptId: ConceptId,
      distance: number,
      concept: Concept | undefined = undefined,
      relation: ConceptId | undefined = undefined,
    ): GraphNode | null => {
      const sid = stringifyId(conceptId);

      const node = this.graph.nodes.get(sid);
      if (node) return node;

      if (this.graph.nodes.size >= this.settings.maxNodes) return null;
      const distanceOkay = !relation || (distance < (this.settings.expand[relation.id] ?? this.settings.expand.__default));
      if (!distanceOkay) return null;

      const newNode: GraphNode = {
        ...conceptId,
        distance,
        concept
      };
      this.graph.nodes.set(sid, newNode);
      newNodes.push(newNode);
      return newNode;
    };

    const protagonist = getOrCreateGraphNode(concept.id, distance, concept);
    if (!protagonist) return [];

    (concept.relations ?? [])
      .flatMap(r => r.objects
        .map(cid => getOrCreateGraphNode(cid, distance + 1, undefined, r.relation))
        .filter(n => !!n)
        .map((target: GraphNode): GraphLink => ({
          source: protagonist,
          relation: r.relation,
          target
        }))
      )
      .forEach(link => {
        this.graph.links.set(stringifyLinkId(link), link);
      });

    return newNodes;
  }

  private createDrag(): DragBehavior<SVGGElement, GraphNode, GraphNode | SubjectPosition> {
    return d3.drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!this.d3) return;
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
        if (!this.d3) return;
        if (!event.active) {
          this.d3.simulation.alphaTarget(0);
        }
      });
  }

  protected toggleSettings(): void {
    this.settingsPaneOpen.set(!this.settingsPaneOpen())
  }

  protected toggleInfo(): void {
    this.infoPaneOpen.set(!this.infoPaneOpen())
  }

  protected changeSettings(): void {
    const settings = this.settingsForm.getRawValue();
    this.settings = {
      ...settings,
      colors: graphColorProfiles[settings.colors] ?? graphColorProfiles['none'],
      expand: graphExpansionProfiles[settings.expand] ?? graphColorProfiles['normal'],
    };
    this.clear();
    this.initialize();
    this.draw();
    this.loadAdjacentNodes(this.registerConceptRelations(this.concept(), 0));
  }

  private getNodeClassColor(node: GraphNode): string {
    const getClassName = (node: GraphNode) => {
      switch (this.settings?.colors?.colorizeNodesBy) {
        case "distance":
          return String(node.distance);
        case "domain":
          return node.concept?.domain ?? '';
        case "type":
          return node.type;
      }
      return 'none';
    }

    if (!node.concept) return 'graph-color-loading';

    const graphInfo = this.graphInfo();

    let className = getClassName(node);
    let entry = graphInfo.nodes.classes.get(className);
    if (entry) {
      entry.count += 1;
      return entry.color;
    }
    const color = `graph-color-${graphInfo.nodes.classes.size}`;
    graphInfo.nodes.classes.set(className, {color, count: 1});
    return color;
  }
}
