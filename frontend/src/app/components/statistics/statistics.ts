import {AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild} from '@angular/core';
import {Statistic, statisticVars} from 'concepts-common/interfaces/statistic';
import * as d3 from 'd3';
import {NgbDropdown, NgbDropdownButtonItem, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap';
import {NgbDropdownItem} from '@ng-bootstrap/ng-bootstrap/dropdown';

@Component({
  selector: 'app-statistics',
  imports: [
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownButtonItem,
    NgbDropdownMenu,
    NgbDropdownItem
  ],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class Statistics implements AfterViewInit, OnDestroy {
  @ViewChild('container', {static: true})
  container!: ElementRef<HTMLDivElement>;

  data = signal<Statistic>({
    values: [
      {value: 'on', value2: 'red', count: 5},
      {value: 'on', value2: 'blue', count: 9},
      {value: 'on', value2: 'green', count: 70},
      {value: 'off', value2: 'red', count: 15},
      {value: 'off', value2: 'blue', count: 1}
    ],
    var: ['status', 'domain']
  });

  readonly statisticOptions = statisticVars;

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  ngAfterViewInit(): void {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.svg?.remove();
  }

  private initialize(): void {
    const element = this.container.nativeElement;

    const width = element.clientWidth;
    const height = element.clientHeight;

    d3.select(element).selectAll('svg').remove();

    const margin = {
      top: 20,
      right: 20,
      bottom: 40,
      left: 45
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const categories = Array.from(
      new Set(this.data().values.map(d => d.value))
    );

    const subCategories = Array.from(
      new Set(this.data().values.map(d => d.value2 ?? ''))
    );

    const maxValue = d3.max(
      this.data().values,
      d => d.count
    ) ?? 0;

    const x0 = d3.scaleBand<string>()
      .domain(categories)
      .range([0, innerWidth])
      .padding(0.2);

    const x1 = d3.scaleBand<string>()
      .domain(subCategories)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1 || 1])
      .nice()
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal<string>()
      .domain(subCategories)
      .range(d3.schemeTableau10);

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const chart = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`
      );

    const groups = chart.selectAll('.category')
      .data(categories)
      .join('g')
      .attr('class', 'category')
      .attr('transform', d => `translate(${x0(d)},0)`);

    groups
      .each((category, index, nodes) => {
        const group = d3.select(nodes[index]);

        subCategories
          .forEach(subCategory => {
            const item = this.data().values.find(
              d => d.value === category && d.value2 === subCategory
            );

            const value = item?.count ?? 0;

            group.append('rect')
              .attr('x', x1(subCategory)!)
              .attr('y', y(value))
              .attr('width', x1.bandwidth())
              .attr('height', innerHeight - y(value))
              .attr('fill', color(subCategory))
              .attr('rx', 2)
              .append('title')
              .text(`${category} / ${subCategory}: ${value}`);
          });
    });

    chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0));

    chart.append('g')
      .call(d3.axisLeft(y).ticks(5));
  }
}
