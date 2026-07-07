import {AfterViewInit, Component, ElementRef, input, ViewChild} from '@angular/core';

import * as d3 from 'd3';
import {Period, PeriodsMap, TimeLineData, XDomain} from '../../interfaces/timeline';


const dummyPeriod = {
  id: "dummyPeriod",
  number: 0,
  name: "Dummy",
  from: 0,
  earliestFrom: 0,
  to: 2026,
  latestTo: 2026,
  successor: undefined,
  parent: undefined,
  children: [],
  row: 0,
  level: 0,
  colorGroup: 6
};
const dummyPeriod2 = {
  id: "dummyPeriod2",
  number: 0,
  name: "Dummy",
  from: -150,
  earliestFrom: -1050,
  to: 150,
  latestTo: 150,
  successor: undefined,
  parent: undefined,
  children: [],
  row: 1,
  level: 0,
  colorGroup: 5
};
const dummyPeriod3 = {
  id: "dummyPeriod3",
  number: 0,
  name: "Dummy",
  from: -2050,
  earliestFrom: -2050,
  to: -1500,
  latestTo: -150,
  successor: "dummyPeriod2",
  parent: undefined,
  children: [],
  row: 1,
  level: 0,
  colorGroup: 6
};

const timelineData: TimeLineData = {
  periods: [dummyPeriod, dummyPeriod2, dummyPeriod3],
  periodsMap: {dummyPeriod, dummyPeriod2, dummyPeriod3},
  xDomain: [-2100, 2100]
};


@Component({
  selector: 'timeline',
  imports: [],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class Timeline implements AfterViewInit {
  @ViewChild('timeline', { static: true }) tlContainer!: ElementRef;

  readonly selectedPeriodId = input<string | undefined>();
  readonly axisTicks = input<number | undefined>();
  readonly inactive = input<boolean>(false);
  // private readonly periods = input<boolean>(false);

  private readonly margin = 15;
  private readonly maxZoomYears = 5;
  private readonly minStartYear = -10000;
  private readonly maxStartYear = new Date().getFullYear();
  private readonly barHeight = 20;
  private readonly buttonZoomFactor = 0.5;

  private timeline: d3.Selection<SVGSVGElement, Period, HTMLElement, Period>|undefined = undefined;
  private canvas: d3.Selection<SVGSVGElement, Period, HTMLElement, Period>|undefined = undefined;
  private axis:  d3.Axis<d3.NumberValue>|undefined = undefined;
  private axisElement: d3.Selection<SVGSVGElement, Period, HTMLElement, Period>|undefined = undefined;
  private bars: d3.Selection<d3.EnterElement, Period, SVGSVGElement, Period>|undefined = undefined;
  private barPaths: d3.Selection<SVGPathElement, Period, SVGSVGElement, Period>|undefined = undefined;
  private barTexts: d3.Selection<SVGTextElement, Period, SVGSVGElement, Period>|undefined = undefined;
  private tooltip: d3.Selection<HTMLDivElement, Period, HTMLElement, Period>|undefined = undefined;
  private zoom: d3.ZoomBehavior<SVGSVGElement, Period>|undefined = undefined;
  private drag: d3.DragBehavior<SVGSVGElement, Period, Node>|undefined = undefined;
  private x: d3.ScaleLinear<number, number, never>|undefined = undefined;
  private y: d3.ScaleLinear<number, number, never>|undefined = undefined;
  //
  // private readonly timelineData;
  //
  private totalXDomain: XDomain = [NaN, NaN];
  private startXDomain: XDomain = [NaN, NaN];
  private startYDomain: XDomain = [NaN, NaN];

  private initialized: boolean = false;

  private hoverPeriod: Period|undefined = undefined;

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.y = d3.scaleLinear()
      .domain([0, this.barHeight * 20])
      .range([0, height - 30]);

    this.totalXDomain = timelineData.xDomain;

    this.setStartDomains(timelineData.periodsMap);

    this.x = d3.scaleLinear()
      .domain(this.startXDomain)
      .range([0, width]);
    this.y.domain(this.startYDomain);

    this.timeline = d3
      .select<SVGSVGElement, Period>('#timeline')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .classed('timeline', true);

    if (this.inactive()) this.timeline.classed('inactive', true);

    this.canvas = this.timeline.append('svg')
      .attr('width', width)
      .attr('height', height - 30);

    this.axis = d3.axisBottom(this.x)
      .ticks(this.axisTicks)
      .tickSize(10);

    this.axisElement = this.timeline
      .append('svg')
      .attr('y', height - 30)
      .attr('width', width)
      .classed('axis', true)
      .call(this.axis);
    console.log("axis node", this.axisElement.node());
    console.log("ticks", this.axisElement.selectAll(".tick").size());
    console.log("html", this.axisElement.node()?.innerHTML);

    if (!this.inactive()) {
      const minZoom = (this.startXDomain[1] - this.startXDomain[0]) / (this.totalXDomain[1] - this.totalXDomain[0]);
      const maxZoom = (this.startXDomain[1] - this.startXDomain[0]) / this.maxZoomYears;

      this.zoom = d3.zoom<SVGSVGElement, Period>()
        // .x(x) paf
        .scaleExtent([minZoom, maxZoom])
        .on('zoom', () => {
          if (this.axis && this.axisElement) this.axisElement.call(this.axis);
          this.updateBars();
        });

      this.drag = d3.drag<SVGSVGElement, Period, Node>()
        .on('drag', event => {
          if (!this.y) throw new Error("noY!"); // paf
          if (!this.axis) throw new Error("noAxis!"); // paf
          if (!this.axisElement) throw new Error("no axisElement!"); // paf
          const domain = this.y.domain();
          domain[0] -= event.dy;
          domain[1] -= event.dy;
          this.y.domain(domain);
          this.axisElement.call(this.axis);
          this.updateBars();
        });

      this.timeline
        .call(this.zoom)
        .call(this.drag);

      this.tooltip = d3.select<HTMLDivElement, Period>('body')
        .append('div')
        .classed('timeline-tooltip', true);
    }

    this.bars = this.canvas.selectAll('g').data(timelineData.periods).enter();
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

    if (this.selectedPeriodId) {
      this.barPaths
        .filter(d => d.id === this.selectedPeriodId())
        .classed('selected', true);
    }

    this.barTexts = this.canvas.selectAll<SVGTextElement, Period>('g')
      .append('text')
      .classed('text', true)
      .attr('id', d => 'bar-text-') // paf removed tmp + d.id
      .on('click', () => this.showPeriod);

    if (this.inactive()) {
      this.barTexts.classed('inactive', true);
    } else {
      // this.addHoverBehavior(this.barTexts);
    }

    this.updateBars();
    d3.select(window).on('resize', () => this.resize());
    this.initialized = true;
  };

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
    this.barPaths.attr('d', data => this.computeBarPaths(data));

    if (!this.barTexts) throw new Error('no barTexts');
    this.barTexts.attr('x', data => {
      if (!this.x) throw new Error("noX!"); // paf
      return this.x(data.from) + (this.getBarWidth(data)) / 2
    })
      .attr('y', data => {
        if (!this.y) throw new Error("noY!"); // paf
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
    if (!this.x) throw new Error("noX!"); // paf
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
    if (!this.x) throw new Error("noX!"); // paf
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
    if (!this.y) throw new Error("noY!"); // paf
    return this.y(data.row) + data.row * (this.barHeight + 5);
  };

  private getBarWidth(data: Period): number {
    if (!this.x) throw new Error("noX!"); // paf
    return this.x(data.to) - this.x(data.from);
  };

  private doesTextFitInBar(text: string, barWidth: number): boolean {
    return !(this.getApproximatedTextLabelWidth(text) > barWidth);
  };

  private getApproximatedTextLabelWidth(text: string): number {
    return text.length * 7;
  };

  private showPeriod(period: Period) {
    console.log(`SHOW PERIOD`, period);
  };

  private formatTickText(text: string): string {
    text = text.split('.').join('$');
    text = text.split(',').join('.');
    text = text.split('$').join(',');

    if (text.length < 6 || (text.indexOf('-') > -1 && text.length < 7)) {
      text = text.replace('.', '');
    }

    return text;
  };

  private addHoverBehavior(selection: d3.Selection<SVGPathElement, Period, SVGSVGElement, Period>): void {
    selection.on('mouseover', (period: Period) => {
      d3.select('#bar-path-' + period.id).classed('hover', true);
      if (period !== this.hoverPeriod) {
        d3.select('#bar-path-' + period.id).raise();
        d3.select('#bar-text-' + period.id).raise();
        this.hoverPeriod = period;
      }
      if (period.textVisible) return;
      if (!this.tooltip) throw new Error('no this.tooltip'); // paf
      this.tooltip.text(period.name);
      return this.tooltip.style('visibility', 'visible');
    })
      .on('mousemove', event => {
        if (!this.tooltip) throw new Error('no this.tooltip'); // paf

        this.tooltip.style('top', (event.pageY - 10) + 'px');
        const tooltipWidth = 250; // paf removed this tmp this.tooltip.node().getBoundingClientRect().width;
        return tooltipWidth < this.getWidth() - event.pageX
          ? this.tooltip.style('left', (event.pageX + 10) + 'px')
          : this.tooltip.style('left', (event.pageX - tooltipWidth - 10) + 'px');
      })
      .on('mouseout', period => {
        if (!this.tooltip) throw new Error('no this.tooltip'); // paf
        d3.select('#bar-path-' + period.id).classed('hover', false);
        return this.tooltip.style('visibility', 'hidden');
      });
  };

  private setStartDomains(periodsMap: PeriodsMap): void {
    const selectedPeriodId = this.selectedPeriodId();
    if (selectedPeriodId && periodsMap[selectedPeriodId])
      this.setStartDomainsToSelection(periodsMap[selectedPeriodId]);
    else
      this.setStandardStartDomains();
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

  setStandardStartDomains(): void {
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


