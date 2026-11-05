import {Component} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {TitlePipe} from '../../pipes/title-pipe';
import {AsyncPipe} from '@angular/common';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-concept-abstract',
  imports: [
    TitlePipe,
    AsyncPipe,
    NgbAlert,
    RouterLink
  ],
  templateUrl: './concept-abstract.html',
  styleUrl: './concept-abstract.css'
})
export class ConceptAbstract extends ConceptViewComponent {

}
