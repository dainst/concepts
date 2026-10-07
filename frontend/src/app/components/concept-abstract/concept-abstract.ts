import {Component} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {TitlePipe} from '../../pipes/title-pipe';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-concept-abstract',
  imports: [
    TitlePipe,
    AsyncPipe
  ],
  templateUrl: './concept-abstract.html',
  styleUrl: './concept-abstract.css'
})
export class ConceptAbstract extends ConceptViewComponent {

}
