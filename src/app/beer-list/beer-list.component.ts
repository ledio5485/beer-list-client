import {Component, OnInit} from '@angular/core';
import {BeerService} from '../shared';
import {Beer} from '../shared/beer/beer';

@Component({
  selector: 'app-beer-list',
  templateUrl: './beer-list.component.html',
  styleUrls: ['./beer-list.component.css'],
  providers: [BeerService]
})
export class BeerListComponent implements OnInit {
  beers: Array<Beer>;

  constructor(private beerService: BeerService) {
  }

  ngOnInit() {
    this.beerService.getAll().subscribe(
      data => this.beers = data,
      error => console.log(error)
    );
  }

  delete(beerId: Number): void {
    this.beerService.delete(beerId).subscribe(
      () => this.beers = this.beers.filter(beer => beer.id !== beerId),
      error => console.log(error)
    );
  }
}
