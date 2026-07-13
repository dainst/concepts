import {AfterViewInit, Component, computed, effect, ElementRef, input, ViewChild, inject} from '@angular/core';
import * as d3 from 'd3';
import {Period, TimeLineData, XDomain} from '../../interfaces/timeline';
import {conceptsToTimelineData} from '../../functions/timeline';
import {TemporalConcept} from 'concepts-common/src/interfaces/concept';
import {Router } from "@angular/router";


@Component({
  selector: 'timeline',
  imports: [],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class Timeline implements AfterViewInit {
  @ViewChild('timeline', { static: true }) tlContainer!: ElementRef;

  private readonly router = inject(Router);

  readonly selectedPeriodId = input<string | undefined>();
  readonly axisTicks = input<number | undefined>();
  readonly inactive = input<boolean>(false);
  readonly concepts = input<TemporalConcept[]>([]);

  private readonly margin = 15;
  private readonly maxZoomYears = 5;
  private readonly minStartYear = -10000;
  private readonly maxStartYear = new Date().getFullYear();
  private readonly barHeight = 20;
  private readonly buttonZoomFactor = 0.5;

  private timeline: d3.Selection<SVGSVGElement, Period, HTMLElement, Period>|undefined = undefined;
  private canvas: d3.Selection<SVGGElement, Period, HTMLElement, Period>|undefined = undefined;
  private axis:  d3.Axis<d3.NumberValue>|undefined = undefined;
  private axisElement: d3.Selection<SVGGElement, Period, HTMLElement, Period>|undefined = undefined;
  private bars: d3.Selection<d3.EnterElement, Period, SVGGElement, Period>|undefined = undefined;
  private barPaths: d3.Selection<SVGPathElement, Period, SVGGElement, Period>|undefined = undefined;
  private barTexts: d3.Selection<SVGTextElement, Period, SVGGElement, Period>|undefined = undefined;
  private tooltip: d3.Selection<HTMLDivElement, Period, HTMLElement, Period>|undefined = undefined;
  private zoom: d3.ZoomBehavior<SVGSVGElement, Period>|undefined = undefined;
  private drag: d3.DragBehavior<SVGSVGElement, Period, Node>|undefined = undefined;
  private baseX: d3.ScaleLinear<number, number, never>|undefined = undefined;
  private x: d3.ScaleLinear<number, number, never>|undefined = undefined;
  private y: d3.ScaleLinear<number, number, never>|undefined = undefined;

  private totalXDomain: XDomain = [NaN, NaN];
  private startXDomain: XDomain = [NaN, NaN];
  private startYDomain: XDomain = [NaN, NaN];

  private initialized: boolean = false;

  private hoverPeriod: Period|undefined = undefined;

  private readonly timelineData = computed(() => conceptsToTimelineData(this.concepts()));

  constructor() {
    effect(() => {
      const tld = this.timelineData();
      const spid = this.selectedPeriodId();
      const inactive = this.inactive();
      if (!this.initialized) return;
      this.updateDomains(tld, spid);
      this.draw(tld);
      this.selectPeriod(spid);
    });
    effect(() => {
      if (!this.initialized) return;
      this.updateAxisTicks(this.axisTicks());
    });
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize(): void {
    const height = this.getHeight();
    const width = this.getWidth();

    this.y = d3.scaleLinear()
      .domain([0, this.barHeight * 20])
      .range([0, height - 30]);

    this.baseX = d3.scaleLinear();
    this.x = this.baseX.copy();

    this.timeline = d3
      .select<SVGSVGElement, Period>('#timeline')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .classed('timeline', true);

    this.canvas = this.timeline!.append('g')
      .attr('width', width)
      .attr('height', height - 30);

    this.axisElement = this.timeline
      .append('g')
      .attr('transform', `translate(0, ${height - 30})`)
      .classed('axis', true)

    this.zoom = d3.zoom<SVGSVGElement, Period>()
      .on('zoom', event => {
        if (this.inactive()) return;
        if (!this.axis) throw new Error("noAxis!");
        if (!this.axisElement) throw new Error("no axisElement!");
        this.x = event.transform.rescaleX(this.baseX);
        this.axis.scale(this.x!);
        this.axisElement.call(this.axis);
        this.updateBars();
      });

    this.drag = d3.drag<SVGSVGElement, Period, Node>()
      .on('drag', event => {
        if (this.inactive()) return;
        if (!this.y) throw new Error("noY!");
        if (!this.axis) throw new Error("noAxis!");
        if (!this.axisElement) throw new Error("no axisElement!");
        const domain = this.y.domain();
        domain[0] -= event.dy;
        domain[1] -= event.dy;
        this.y.domain(domain);
        this.axisElement.call(this.axis);
        this.updateBars();
      });

    this.timeline!
      .call(this.zoom)
      .call(this.drag);

    this.tooltip = d3.select<HTMLDivElement, Period>('body')
      .append('div')
      .classed('timeline-tooltip', true);

    this.initialized = true;
  };

  private selectPeriod(selectedPeriodId: string | undefined): void {
    if (selectedPeriodId) {
      this.barPaths!
        .filter(d => d.id === selectedPeriodId)
        .classed('selected', true);
    }
  }

  private updateDomains(timelineData: TimeLineData, selectedPeriodId: string | undefined) {
    const width = this.getWidth();

    this.totalXDomain = timelineData.xDomain;

    if (selectedPeriodId && timelineData.periodsMap[selectedPeriodId]) {
      this.setStartDomainsToSelection(timelineData.periodsMap[selectedPeriodId]);
    } else {
      this.setStandardStartDomains();
    }

    this.baseX!
      .domain(this.startXDomain)
      .range([0, width]);

    this.x = this.baseX!.copy();

    this.y!.domain(this.startYDomain); // TODO is ! a good choice here?
  }

  private updateAxisTicks(axisTicks: number | undefined) {
    this.axis = d3.axisBottom(this.x!)
      .ticks(axisTicks ?? 10)
      .tickSize(10);

    this.axisElement!
      .call(this.axis);
  }

  private draw(timelineData: TimeLineData) {
    this.timeline!.classed('inactive', this.inactive());

    this.canvas!.selectAll("*").remove();
    this.bars = this.canvas!.selectAll('g')
      .data(timelineData.periods)
      .enter(); // TODO use join

    this.barPaths = this.bars.append('g')
      .attr('id', d=> 'bar-path-' + d.id)
      .attr('class', d => {
        let barClass = 'bar level' + (d.level + 1);
        if (this.inactive()) {
          barClass += ' inactive';
        } else {
          barClass += ' group' + d.colorGroup;
        }
        return barClass;
      })
      .append('path');

    if (!this.inactive()) {
      this.barPaths.on('click', this.showPeriod);
      this.addHoverBehavior(this.barPaths);
    }

    this.barTexts = this.canvas!.selectAll<SVGTextElement, Period>('g')
      .append('text')
      .classed('text', true)
      .attr('id', d => 'bar-text-'+ d.id)
      .on('click', this.showPeriod);

    if (this.inactive()) {
      this.barTexts.classed('inactive', true);
    } else {
      this.addHoverBehavior(this.barTexts);
    }

    const minZoom = (this.startXDomain[1] - this.startXDomain[0]) / (this.totalXDomain[1] - this.totalXDomain[0]);
    const maxZoom = (this.startXDomain[1] - this.startXDomain[0]) / this.maxZoomYears;

    this.zoom!
      .scaleExtent([minZoom, maxZoom]);

    this.updateBars();
    this.updateAxisTicks(this.axisTicks());
    d3.select(window).on('resize', () => this.resize());
  }

  private resize() {
    if (!this.initialized) return;

    const width = this.getWidth();
    const height = this.getHeight();

    if (!this.y) throw new Error('no y');
    if (!this.x) throw new Error('no x');
    if (!this.timeline) throw new Error('no timeline');
    if (!this.canvas) throw new Error('no canvas');
    if (!this.axisElement) throw new Error('no axisElement');
    if (!this.axis) throw new Error('no axis');

    this.y.range([0, height - 30]);
    this.x.range([0, width]);

    this.timeline.attr('width', width)
      .attr('height', height);

    this.canvas.attr('width', width)
      .attr('height', height - 30);

    this.axisElement.attr('y', height - 30);
    this.axisElement.attr('width', width);
    this.axisElement.call(this.axis);

    this.updateBars();
  };

  private getWidth(): number {
    return this.tlContainer.nativeElement.clientWidth - this.margin;
  };

  private getHeight(): number {
    return this.tlContainer.nativeElement.clientHeight - this.margin;
  };

  private updateBars() {
    if (!this.barPaths) throw new Error('no barPaths');
    if (!this.barTexts) throw new Error('no barTexts');

    this.barPaths.attr('d', data => this.computeBarPaths(data));

    this.barTexts
      .attr('x', data => {
        if (!this.x) throw new Error("noX!");
        return this.x(data.from) + (this.getBarWidth(data)) / 2
      })
      .attr('y', data => {
        if (!this.y) throw new Error("noY!");
        return this.y(data.row) + data.row * (this.barHeight + 5) + this.barHeight / 2 + 5
      })
      .text(data => {
        if (this.doesTextFitInBar(data.name, this.getBarWidth(data))) {
          data.textVisible = true;
          return data.name;
        } else {
          data.textVisible = false;
          return '';
        }
      });

    if (!this.axisElement) return;
    this.axisElement.selectAll<SVGTextElement, string>('.tick text')
      .text(p => this.formatTickText(p));
  };

  private computeBarPaths(data: Period): string {
    const topY = this.getPathYPosition(data);
    const bottomY = topY + this.barHeight;
    const edgeRadius = Math.min(Math.floor(this.getBarWidth(data) / 2), 5);

    return this.computeLeftEndPathDefinition(data, topY, bottomY, edgeRadius) + ' '
      + this.computeRightEndPathDefinition(data, topY, bottomY, edgeRadius) + 'Z';
  };

  private computeLeftEndPathDefinition(data: Period, topY: number, bottomY: number, edgeRadius: number): string {
    if (!this.x) throw new Error("noX!");
    if (data.earliestFrom) {
      return 'M'
        + (this.x(data.earliestFrom) + ((this.x(data.from) - this.x(data.earliestFrom)) / 10)) + ' ' + bottomY + ' '
        + 'L' + (this.x(data.from) + + ((this.x(data.from) - this.x(data.earliestFrom)) / 10)) + ' ' + topY;
    } else if (edgeRadius > 0) {
      return 'M' + (this.x(data.from) + edgeRadius) + ' ' + bottomY + ' '
        + 'Q' + this.x(data.from) + ' ' + bottomY + ' ' + this.x(data.from) + ' ' + (bottomY - edgeRadius)
        + 'L' + this.x(data.from) + ' ' + (topY + edgeRadius)
        + 'Q' + this.x(data.from) + ' ' + topY + ' ' + (this.x(data.from) + edgeRadius) + ' ' + topY
    } else {
      return 'M' + this.x(data.from) + ' ' + bottomY + ' '
        + 'L' + this.x(data.from) + ' ' + topY;
    }
  };

  private computeRightEndPathDefinition(data: Period, topY: number, bottomY: number, edgeRadius: number): string {
    if (!this.x) throw new Error("noX!");
    if (data.latestTo || edgeRadius === 0) {
      return 'L' + this.x(data.latestTo || data.to) + ' ' + topY + ' '
        + 'L' + this.x(data.to) + ' ' + bottomY;
    } else {
      return 'L' + (this.x(data.to) - edgeRadius) + ' ' + topY + ' '
        + 'Q' + this.x(data.to) + ' ' + topY + ' ' + this.x(data.to) + ' ' + (topY + edgeRadius)
        + 'L' + this.x(data.to) + ' ' + (bottomY - edgeRadius)
        + 'Q' + this.x(data.to) + ' ' + bottomY + ' ' + (this.x(data.to) - edgeRadius) + ' ' + bottomY;
    }
  };

  private getPathYPosition(data: Period): number {
    if (!this.y) throw new Error("noY!");
    return this.y(data.row) + data.row * (this.barHeight + 5);
  };

  private getBarWidth(data: Period): number {
    if (!this.x) throw new Error("noX!");
    return this.x(data.to) - this.x(data.from);
  };

  private doesTextFitInBar(text: string, barWidth: number): boolean {
    return !(this.getApproximatedTextLabelWidth(text) > barWidth);
  };

  private getApproximatedTextLabelWidth(text: string): number {
    return text.length * 7;
  };

  private showPeriod(event: MouseEvent, period: Period) {
    this.router.navigate(['concept', period.conceptId.type, period.conceptId.id]);
  };

  private formatTickText(text: string | number): string {
    if (typeof text !== 'string') return String(text);

    // TODO do we need this at all?
    text = text.split('.').join('$');
    text = text.split(',').join('.');
    text = text.split('$').join(',');

    if (text.length < 6 || (text.indexOf('-') > -1 && text.length < 7)) {
      text = text.replace('.', '');
    }

    return text;
  };

  private addHoverBehavior<T extends SVGPathElement|SVGTextElement>(selection: d3.Selection<T, Period, SVGGElement, Period>): void {
    selection
      .on('mouseover', (event: MouseEvent, period: Period) => {
        d3.select('#bar-path-' + period.id).classed('hover', true);
        if (period !== this.hoverPeriod) {
          d3.select('#bar-path-' + period.id).raise();
          d3.select('#bar-text-' + period.id).raise();
          this.hoverPeriod = period;
        }
        if (period.textVisible) return;
        if (!this.tooltip) throw new Error('no this.tooltip');
        this.tooltip.text(period.name);
        return this.tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (event: MouseEvent, period: Period) => {
        if (!this.tooltip) throw new Error('no this.tooltip');
        this.tooltip.style('top', (event.pageY - 10) + 'px');
        const tooltipWidth = this.tooltip.node()?.getBoundingClientRect().width ?? 0;
        return tooltipWidth < this.getWidth() - event.pageX
          ? this.tooltip.style('left', (event.pageX + 10) + 'px')
          : this.tooltip.style('left', (event.pageX - tooltipWidth - 10) + 'px');
      })
      .on('mouseout', (event: MouseEvent, period: Period) => {
        if (!this.tooltip) throw new Error('no this.tooltip');
        d3.select('#bar-path-' + period.id).classed('hover', false);
        return this.tooltip.style('visibility', 'hidden');
      });
  };

  private setStartDomainsToSelection(selectedPeriod: Period): void {
    const span = (selectedPeriod.latestTo || selectedPeriod.to) - (selectedPeriod.earliestFrom || selectedPeriod.from);
    const offset = (span < this.maxZoomYears) ? (this.maxZoomYears - span) / 2 : span / 2;
    let from = (selectedPeriod.earliestFrom || selectedPeriod.from) - offset;
    let to = (selectedPeriod.latestTo || selectedPeriod.to) + offset;
    if (from < this.totalXDomain[0]) from = this.totalXDomain[0];
    if (to > this.totalXDomain[1]) to = this.totalXDomain[1];
    this.startXDomain = [from, to];

    let centralRow = selectedPeriod.row;
    if (centralRow < 5) centralRow = 5;
    if (!this.y) throw new Error('no y');
    const yPos = centralRow + this.y.invert(centralRow * (this.barHeight + 5)) - 5;
    this.startYDomain = [yPos - this.barHeight * 10, yPos + this.barHeight * 10];
  };

  private setStandardStartDomains(): void {
    this.startXDomain[0] = this.totalXDomain[0];
    this.startXDomain[1] = this.totalXDomain[1];
    if (this.startXDomain[0] < this.minStartYear)
      this.startXDomain[0] = this.minStartYear;
    if (this.startXDomain[1] > this.maxStartYear)
      this.startXDomain[1] = this.maxStartYear;
    this.startYDomain = [0, this.barHeight * 20];
  };

  protected zoomIn(event: PointerEvent): void {
    // event.target.blur();
    this.zoomFn(true);
  };

  protected zoomOut(event: PointerEvent): void {
    // event.target.blur();
    this.zoomFn(false);
  };

  private zoomFn(zoomIn: boolean): void {
    if (!this.zoom) throw new Error("no zoom");
    if (!this.timeline) throw new Error("no timeline");
    const node = this.timeline.node();
    if (!node) throw new Error("no node");

    const center: [number, number] = [
      this.getWidth() / 2,
      this.getHeight() / 2
    ];

    const transform = d3.zoomTransform(node);
    const targetZoom = transform.k * (1 + this.buttonZoomFactor * (zoomIn ? 1 : -1));
    const extent = this.zoom.scaleExtent();

    if (targetZoom < extent[0] || targetZoom > extent[1]) {
      return;
    }

    const translateX = center[0] - ((center[0] - transform.x) / transform.k) * targetZoom;
    const translateY = center[1] - ((center[1] - transform.y) / transform.k) * targetZoom;

    const targetTransform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(targetZoom);

    this.timeline
      .transition()
      .duration(350)
      .call(this.zoom.transform, targetTransform);
  }
}


