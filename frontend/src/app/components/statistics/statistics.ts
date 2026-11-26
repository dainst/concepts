import {
  AfterViewInit,
  Component, effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {Statistic, StatisticVar, statisticVars} from 'concepts-common/interfaces/statistic';
import * as d3 from 'd3';
import {
  NgbAlert,
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownMenu,
  NgbDropdownToggle
} from '@ng-bootstrap/ng-bootstrap';
import {NgbDropdownItem} from '@ng-bootstrap/ng-bootstrap/dropdown';
import {rxResource} from '@angular/core/rxjs-interop';
import {BackendService} from '../../services/backend.service';

interface BarDatum {
  category: string;
  subCategory: string;
  count: number;
}

@Component({
  selector: 'app-statistics',
  imports: [
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownButtonItem,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbAlert
  ],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics implements AfterViewInit, OnDestroy {
  @ViewChild('container', {static: true}) container!: ElementRef<HTMLDivElement>;
  private readonly bs = inject(BackendService);

  var1: WritableSignal<StatisticVar> = signal('domain');
  var2: WritableSignal<StatisticVar | null> = signal(null);

  protected readonly data = rxResource({
    params: () => ({var1: this.var1(), var2: this.var2()}),
    stream: ({params}) =>
      this.bs.getStatistic(params.var1, params.var2)
  });

  readonly statisticOptions = statisticVars;

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  private resizeObserver?: ResizeObserver;
  private initialized = false;
  private x0 = d3.scaleBand<string>();
  private x1 = d3.scaleBand<string>();
  private y = d3.scaleLinear();
  private color = d3.scaleOrdinal<string, string>(d3.schemeTableau10);
  private currentData?: Statistic;

  private chart?: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;

  private xAxisGroup?: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;

  private yAxisGroup?: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;

  private readonly margin = {
    top: 20,
    right: 20,
    bottom: 65,
    left: 45
  };

  ngAfterViewInit(): void {
    this.initialize();

    if (this.currentData) {
      this.updateChart(this.currentData);
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.currentData) this.updateChart(this.currentData);
    });
    this.resizeObserver.observe(this.container.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.svg?.remove();
  }

  constructor() {
    effect(() => {
      const data = this.data.value();
      if (data) this.updateChart(data);
    });
  }

  private initialize(): void {
    const element = this.container.nativeElement;

    this.svg = d3.select(element)
      .append('svg');

    this.chart = this.svg
      .append('g')
      .attr('class', 'chart')
      .attr(
        'transform',
        `translate(${this.margin.left},${this.margin.top})`
      );

    this.xAxisGroup = this.chart
      .append('g')
      .attr('class', 'x-axis');

    this.yAxisGroup = this.chart
      .append('g')
      .attr('class', 'y-axis');

    this.chart.append('g')
      .attr('class', 'legend');

    this.initialized = true;
  }

  private updateChart(data: Statistic): void {
    if (!this.svg || !this.chart) return;

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    if (!width || !height) return;

    const innerWidth = width - this.margin.left - this.margin.right;
    const innerHeight = height - this.margin.top - this.margin.bottom;

    const categories = Array
      .from(new Set(data.values.map(d => d.value)));

    const subCategories = Array
      .from(new Set(data.values.map(d => d.value2)))
      .filter(a => typeof a !== 'undefined');

    const maxValue = d3.max(data.values, d => d.count) ?? 0;

    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.x0
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.2);

    this.x1
      .domain(subCategories)
      .range([0, this.x0.bandwidth()])
      .padding(0.05);

    this.y
      .domain([0, maxValue * 1.1 || 1])
      .nice()
      .range([innerHeight, 0]);

    this.color.domain(subCategories);

    const groups = this.chart
      .selectAll<SVGGElement, string>('g.category')
      .data(categories, d => d)
      .join(
        enter => enter
          .append('g')
          .attr('class', 'category'),
        update => update,
        exit => exit.remove()
      )
      .attr(
        'transform',
        d => `translate(${this.x0(d) ?? 0},0)`
      );


    groups.each((category, index, nodes) => {
      const group = d3.select(nodes[index]);

      const barData: BarDatum[] =
        subCategories.length
          ? subCategories
            .map(subCategory => {
              const item = data.values
                .find(d => d.value === category && d.value2 === subCategory);
              return {
                category,
                subCategory,
                count: item?.count ?? 0
              };
            })
          : data.values
            .filter(d => d.value === category)
            .map(d => ({
              category,
              subCategory: '',
              count: d.count
            }));

      const bars = group
        .selectAll<SVGRectElement, BarDatum>('rect.bar')
        .data(
          barData,
          d => d.subCategory
        )
        .join(
          enter => enter
            .append('rect')
            .attr('class', 'bar')
            .attr('rx', 2),

          update => update,

          exit => exit.remove()
        );

      bars
        .attr('x', d => this.x1(d.subCategory) ?? 0)
        .attr('y', d => this.y(d.count))
        .attr('width', this.x1.bandwidth())
        .attr('height', d => Math.max(0, innerHeight - this.y(d.count)))
        .attr('fill', d => this.color(d.subCategory));

      bars
        .selectAll<SVGTitleElement, BarDatum>('title')
        .data(d => [d])
        .join('title')
        .text(d => `${d.category} / ${d.subCategory}: ${d.count}`);

    });

    this.xAxisGroup!
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(this.x0));

    this.yAxisGroup!
      .call(d3.axisLeft(this.y).ticks(5));



    const legendData = subCategories.length
      ? subCategories.map(value => ({
        label: value,
        color: this.color(value)
      }))
      : [{
        label: data.var[0],
        color: '#4e79a7'
      }];

    const legend = this.chart!.select<SVGGElement>('.legend');

    const legendItems = legend
      .selectAll<SVGGElement, typeof legendData[number]>('.legend-item')
      .data(legendData, d => d.label)
      .join(
        enter => {
          const item = enter.append('g')
            .attr('class', 'legend-item');

          item.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2);

          item.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .attr('font-size', 12);

          return item;
        },
        update => update,
        exit => exit.remove()
      );

    legendItems
      .select('rect')
      .attr('fill', d => d.color);

    legendItems
      .select('text')
      .text(d => d.label);


    let legendX = 0;

    legendItems.each(function() {
      d3.select(this)
        .attr('transform', `translate(${legendX},0)`);

      const itemWidth = this.getBBox().width;
      legendX += itemWidth + 15;
    });

    legend
      .attr('transform', `translate(0, ${innerHeight + 35})`);
  }

  select(var1: StatisticVar, var2: StatisticVar | null): void {
    this.var1.set(var1);
    this.var2.set(var2);
    console.log(this.var1(), this.var2());
  }
}
