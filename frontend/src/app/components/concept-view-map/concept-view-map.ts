import {AfterViewInit, Component, effect, signal} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import * as L from 'leaflet';
import {GeographicalExtend} from 'concepts-common/src/interfaces/concept';
import {isGeoJsonObject} from '../../functions/geo-json.typeguards';

@Component({
  selector: 'app-concept-view-map',
  imports: [],
  templateUrl: './concept-view-map.html',
  styleUrl: './concept-view-map.css',
})
export class ConceptViewMap extends ConceptViewComponent implements AfterViewInit {
  private viewInitialized = signal(false);

  private map!: L.Map
  features: L.GeoJSON[] = [];

  constructor() {
    effect(() => {
      if (!this.viewInitialized()) {
        return;
      }
      this.concept().geographicalExtends
        .forEach(ge => this.loadShape(ge));
      this.centerMap();
    });
    super();
  }

  ngAfterViewInit() {
    this.initMap();
    this.viewInitialized.set(true);
    console.log('initt')
  }

  private initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }

  private centerMap() {
    this.map.fitBounds(L.featureGroup(this.features).getBounds());
  }

  private loadShape(ge: GeographicalExtend) {
    console.log(ge);

    try {
      const geometry = JSON.parse(ge.shape ?? ge.center);
      if (!isGeoJsonObject(geometry)) throw new Error(`Invalid GeoJSON: ${ge.shape ?? ge.center}`);
      const f = L.geoJSON(geometry).addTo(this.map)
      this.features.push(f);
    } catch (e) {
      console.error(e);
      // TODO error handling
      return;
    }
  }
}
