import {AfterViewInit, Component, computed, effect, ElementRef, input, ViewChild, inject, untracked} from '@angular/core';
import * as d3 from 'd3';
import {Period, TimeLineData, Domain} from '../../interfaces/timeline';
import {prepareTimelineData} from '../../functions/timeline-data';
import {TemporalConcept} from 'concepts-common/src/interfaces/concept';
import {Router } from "@angular/router";
import {D3ZoomEvent} from 'd3-zoom';


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

  private readonly timelineData = computed(() => prepareTimelineData(this.concepts()));

  private readonly settings = {
    margin: 15,
    maxZoomYears: 5,
    minStartYear: -10000,
    maxStartYear: new Date().getFullYear(),
    barHeight : 20,
    buttonZoomFactor : 0.5,
  };

  private d3!: {
    timeline: d3.Selection<SVGSVGElement, Period, HTMLElement, Period>;
    canvas: d3.Selection<SVGGElement, Period, HTMLElement, Period>;
    axis:  d3.Axis<d3.NumberValue>;
    axisElement: d3.Selection<SVGGElement, Period, HTMLElement, Period>;
    tooltip: d3.Selection<HTMLDivElement, Period, HTMLElement, Period>;
    zoom: d3.ZoomBehavior<SVGSVGElement, Period>;
    baseX: d3.ScaleLinear<number, number, never>;
    baseY: d3.ScaleLinear<number, number, never>;
    x: d3.ScaleLinear<number, number, never>;
    y: d3.ScaleLinear<number, number, never>,
    totalXDomain: Domain;
    startXDomain: Domain;
    startYDomain: Domain;
    hoverPeriod: Period | undefined;
  }

  private bars!: {
    elems: d3.Selection<d3.EnterElement, Period, SVGGElement, Period>;
    paths: d3.Selection<SVGPathElement, Period, SVGGElement, Period>;
    texts: d3.Selection<SVGTextElement, Period, SVGGElement, Period>;
  }

  constructor() {
    effect(() => {
      const tld = this.timelineData();

      if (!this.d3) return;

      const spid = untracked(() => this.selectedPeriodId());
      this.updateDomains(tld, spid);
      this.draw(tld);
    });
    effect(() => {
      const spid = this.selectedPeriodId();

      if (!this.d3 || !this.bars) return;

      this.selectPeriod(spid);
      const tld = untracked(() => this.timelineData());
      this.updateDomains(tld, this.selectedPeriodId());
      this.setZoomExtend();
      this.zoomFn(true);
    });
    effect(() => {
      const at = this.axisTicks();

      if (!this.d3) return;

      this.updateAxisTicks(at);
    });
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize(): void {
    const height = this.getHeight();
    const width = this.getWidth();

    const baseY = d3.scaleLinear()
      .domain([0, this.settings.barHeight * 20])
      .range([0, height - 30]);
    const y = baseY.copy();

    const baseX = d3.scaleLinear();
    const x = baseX.copy();

    const timeline = d3
      .select<SVGSVGElement, Period>('#timeline')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .classed('timeline', true);

    const canvas = timeline
      .append('g')
      .attr('width', width)
      .attr('height', height - 30);

    const axisElement = timeline
      .append('g')
      .attr('transform', `translate(0, ${height - 30})`)
      .classed('axis', true)

    const zoom = d3.zoom<SVGSVGElement, Period>()
      .on('zoom', this.zoomCallback.bind(this));

    timeline
      .call(zoom)

    const tooltip = d3.select<HTMLDivElement, Period>('body')
      .append('div')
      .classed('timeline-tooltip', true);

    d3.select(window).on('resize', () => this.resize());

    const axis = d3.axisBottom(x);

    this.d3 = {
      axis,
      axisElement,
      baseX,
      baseY,
      canvas,
      timeline,
      tooltip,
      x,
      y,
      zoom,
      hoverPeriod: undefined,
      startXDomain: [0, 0],
      startYDomain: [0, 0],
      totalXDomain: [0, 0]
    }
  };

  private zoomCallback(event: d3.D3ZoomEvent<SVGSVGElement, Period>): void {
    this.d3.x = event.transform.rescaleX(this.d3.baseX);
    this.d3.axis.scale(this.d3.x);
    this.d3.axisElement!.call(this.d3.axis);

    const start = this.d3.baseY.domain();
    const pixelsPerDomain = (this.d3.baseY.range()[1] - this.d3.baseY.range()[0]) / (start[1] - start[0]);
    const offset = event.transform.y / pixelsPerDomain;
    this.d3.y.domain([
      start[0] - offset,
      start[1] - offset
    ]);

    this.updateBars();
  }

  private selectPeriod(selectedPeriodId: string | undefined): void {
    this.bars.paths
      .classed('selected', d => d.id === selectedPeriodId);
  }

  private updateDomains(timelineData: TimeLineData, spid: string | undefined): void {
    const width = this.getWidth();

    this.d3.totalXDomain = timelineData.xDomain;

    if (spid && timelineData.periodsMap[spid]) {
      this.setStartDomainsToSelection(timelineData.periodsMap[spid]);
    } else {
      this.setStandardStartDomains();
    }

    this.d3.baseX
      .domain(this.d3.startXDomain)
      .range([0, width]);
    this.d3.x = this.d3.baseX.copy();

    this.d3.y
      .domain(this.d3.startYDomain);
  }

  private updateAxisTicks(axisTicks: number | undefined): void {
    this.d3.axis = d3.axisBottom(this.d3.x)
      .ticks(axisTicks ?? 10)
      .tickSize(10);

    this.d3.axisElement
      .call(this.d3.axis);
  }

  private draw(timelineData: TimeLineData) {
    this.d3.timeline.classed('inactive', this.inactive());

    this.d3.canvas.selectAll("*").remove();
    const elems = this.d3.canvas
      .selectAll('g')
      .data(timelineData.periods)
      .enter(); // TODO use join

    const paths = elems
      .append('g')
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
      paths.on('click', this.showPeriod.bind(this));
      this.addHoverBehavior(paths);
    }

    const texts = this.d3.canvas
      .selectAll<SVGTextElement, Period>('g')
      .append('text')
      .classed('text', true)
      .attr('id', d => 'bar-text-'+ d.id)
      .on('click', this.showPeriod.bind(this));

    if (this.inactive()) {
      texts
        .classed('inactive', true);
    } else {
      this.addHoverBehavior(texts);
    }

    this.bars = {elems, paths, texts};
    this.updateBars();
    this.updateAxisTicks(this.axisTicks());
    this.setStandardStartDomains();
    this.setZoomExtend();
  }

  private setZoomExtend(): void {
    const minZoom = (this.d3.startXDomain[1] - this.d3.startXDomain[0]) / (this.d3.totalXDomain[1] - this.d3.totalXDomain[0]);
    const maxZoom = (this.d3.startXDomain[1] - this.d3.startXDomain[0]) / this.settings.maxZoomYears;
    this.d3.zoom
      .scaleExtent([minZoom, maxZoom]);
  }

  private resize(): void {
    if (!this.d3) return;

    const width = this.getWidth();
    const height = this.getHeight();

    this.d3.y.range([0, height - 30]);
    this.d3.x.range([0, width]);

    this.d3.timeline
      .attr('width', width)
      .attr('height', height);

    this.d3.canvas
      .attr('width', width)
      .attr('height', height - 30);

    this.d3.axisElement.attr('y', height - 30);
    this.d3.axisElement.attr('width', width);
    this.d3.axisElement.call(this.d3.axis);

    this.updateBars();
  };

  private getWidth(): number {
    return this.tlContainer.nativeElement.clientWidth - this.settings.margin;
  };

  private getHeight(): number {
    return this.tlContainer.nativeElement.clientHeight - this.settings.margin;
  };

  private updateBars(): void {
    this.bars.paths
      .attr('d', data => this.computeBarPaths(data));

    this.bars.texts
      .attr('x', data => this.d3.x(data.from) + (this.getBarWidth(data)) / 2)
      .attr('y', data => this.d3.y(data.row) + data.row * (this.settings.barHeight + 5) + this.settings.barHeight / 2 + 5)
      .text(data => {
        if (this.doesTextFitInBar(data.name, this.getBarWidth(data))) {
          data.textVisible = true;
          return data.name;
        } else {
          data.textVisible = false;
          return '';
        }
      });

    this.d3.axisElement.selectAll<SVGTextElement, string>('.tick text')
      .text(p => this.formatTickText(p));
  };

  private computeBarPaths(data: Period): string {
    const topY = this.getPathYPosition(data);
    const bottomY = topY + this.settings.barHeight;
    const edgeRadius = Math.min(Math.floor(this.getBarWidth(data) / 2), 5);

    return this.computeLeftEndPathDefinition(data, topY, bottomY, edgeRadius) + ' '
      + this.computeRightEndPathDefinition(data, topY, bottomY, edgeRadius) + 'Z';
  };

  private computeLeftEndPathDefinition(data: Period, topY: number, bottomY: number, edgeRadius: number): string {
    if (data.earliestFrom) {
      return 'M'
        + (this.d3.x(data.earliestFrom) + ((this.d3.x(data.from) - this.d3.x(data.earliestFrom)) / 10)) + ' ' + bottomY + ' '
        + 'L' + (this.d3.x(data.from) + + ((this.d3.x(data.from) - this.d3.x(data.earliestFrom)) / 10)) + ' ' + topY;
    } else if (edgeRadius > 0) {
      return 'M' + (this.d3.x(data.from) + edgeRadius) + ' ' + bottomY + ' '
        + 'Q' + this.d3.x(data.from) + ' ' + bottomY + ' ' + this.d3.x(data.from) + ' ' + (bottomY - edgeRadius)
        + 'L' + this.d3.x(data.from) + ' ' + (topY + edgeRadius)
        + 'Q' + this.d3.x(data.from) + ' ' + topY + ' ' + (this.d3.x(data.from) + edgeRadius) + ' ' + topY
    } else {
      return 'M' + this.d3.x(data.from) + ' ' + bottomY + ' '
        + 'L' + this.d3.x(data.from) + ' ' + topY;
    }
  };

  private computeRightEndPathDefinition(data: Period, topY: number, bottomY: number, edgeRadius: number): string {
    if (data.latestTo || edgeRadius === 0) {
      return 'L' + this.d3.x(data.latestTo || data.to) + ' ' + topY + ' '
        + 'L' + this.d3.x(data.to) + ' ' + bottomY;
    } else {
      return 'L' + (this.d3.x(data.to) - edgeRadius) + ' ' + topY + ' '
        + 'Q' + this.d3.x(data.to) + ' ' + topY + ' ' + this.d3.x(data.to) + ' ' + (topY + edgeRadius)
        + 'L' + this.d3.x(data.to) + ' ' + (bottomY - edgeRadius)
        + 'Q' + this.d3.x(data.to) + ' ' + bottomY + ' ' + (this.d3.x(data.to) - edgeRadius) + ' ' + bottomY;
    }
  };

  private getPathYPosition(data: Period): number {
    return this.d3.y(data.row) + data.row * (this.settings.barHeight + 5);
  };

  private getBarWidth(data: Period): number {
    return this.d3.x(data.to) - this.d3.x(data.from);
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
        if (period !== this.d3.hoverPeriod) {
          d3.select('#bar-path-' + period.id).raise();
          d3.select('#bar-text-' + period.id).raise();
          this.d3.hoverPeriod = period;
        }
        if (period.textVisible) return;
        this.d3.tooltip.text(period.name);
        return this.d3.tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (event: MouseEvent, period: Period) => {
        this.d3.tooltip.style('top', (event.pageY - 10) + 'px');
        const tooltipWidth = this.d3.tooltip.node()?.getBoundingClientRect().width ?? 0;
        return tooltipWidth < this.getWidth() - event.pageX
          ? this.d3.tooltip.style('left', (event.pageX + 10) + 'px')
          : this.d3.tooltip.style('left', (event.pageX - tooltipWidth - 10) + 'px');
      })
      .on('mouseout', (event: MouseEvent, period: Period) => {
        d3.select('#bar-path-' + period.id).classed('hover', false);
        return this.d3.tooltip.style('visibility', 'hidden');
      });
  };

  private setStartDomainsToSelection(selectedPeriod: Period): void {
    const span = (selectedPeriod.latestTo || selectedPeriod.to) - (selectedPeriod.earliestFrom || selectedPeriod.from);
    const offset = (span < this.settings.maxZoomYears) ? (this.settings.maxZoomYears - span) / 2 : span / 2;
    let from = (selectedPeriod.earliestFrom || selectedPeriod.from) - offset;
    let to = (selectedPeriod.latestTo || selectedPeriod.to) + offset;
    if (from < this.d3.totalXDomain[0]) from = this.d3.totalXDomain[0];
    if (to > this.d3.totalXDomain[1]) to = this.d3.totalXDomain[1];
    this.d3.startXDomain = [from, to];

    let centralRow = selectedPeriod.row;
    if (centralRow < 5) centralRow = 5;

    const rowHeight = this.settings.barHeight + 5;
    const center = centralRow * rowHeight + this.settings.barHeight / 2;
    const visibleHeight = 20 * rowHeight;

    this.d3.startYDomain = [
      center - visibleHeight / 2,
      center + visibleHeight / 2
    ];
  };

  private setStandardStartDomains(): void {
    this.d3.startXDomain[0] = this.d3.totalXDomain[0];
    this.d3.startXDomain[1] = this.d3.totalXDomain[1];
    if (this.d3.startXDomain[0] < this.settings.minStartYear) this.d3.startXDomain[0] = this.settings.minStartYear;
    if (this.d3.startXDomain[1] > this.settings.maxStartYear) this.d3.startXDomain[1] = this.settings.maxStartYear;
    this.d3.startYDomain = [0, this.settings.barHeight * 20];
  };

  protected zoomIn(event: PointerEvent): void {
    this.zoomFn(true);
  };

  protected zoomOut(event: PointerEvent): void {
    this.zoomFn(false);
  };

  private zoomFn(zoomIn: boolean): void {
    const node = this.d3.timeline.node();
    if (!node) return;

    const center: [number, number] = [
      this.getWidth() / 2,
      this.getHeight() / 2
    ];

    const transform = d3.zoomTransform(node);
    const targetZoom = transform.k * (1 + this.settings.buttonZoomFactor * (zoomIn ? 1 : -1));
    const extent = this.d3.zoom.scaleExtent();

    if (targetZoom < extent[0] || targetZoom > extent[1]) {
      return;
    }

    const translateX = center[0] - ((center[0] - transform.x) / transform.k) * targetZoom;
    const translateY = center[1] - ((center[1] - transform.y) / transform.k) * targetZoom;

    const targetTransform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(targetZoom);

    this.d3.timeline
      .transition()
      .duration(350)
      .call(this.d3.zoom.transform, targetTransform);
  }
}


