import { Component } from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-concept-view-raw',
  imports: [
    JsonPipe
  ],
  templateUrl: './concept-view-raw.html',
  styleUrl: './concept-view-raw.css',
})
export class ConceptViewRaw extends ConceptViewComponent {

}
