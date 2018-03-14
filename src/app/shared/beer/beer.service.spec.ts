import { async, inject, TestBed } from '@angular/core/testing';

import { BeerService } from './beer.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import {Beer} from './beer';

describe('BeerService', () => {
  let beerService: BeerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BeerService]
    });

    beerService = TestBed.get(BeerService);
    httpMock    = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([BeerService], (service: BeerService) => {
    expect(service).toBeTruthy();
  }));

  describe('getAll', function () {
    it('should return an Observable when getAll called', async(() => {
      expect(TestBed.get(BeerService).getAll()).toEqual(jasmine.any(Observable));
    }));

    it('should resolve to list of Beers when getAll called', async(() => {

      const expectedBeers: Array<Beer> = [
        {id: 1, name: 'Kronen'},
        {id: 2, name: 'Hovels'},
        {id: 3, name: 'Brinkhoff'},
      ];

      let actualBeers: Beer[] = [];
      beerService.getAll().subscribe((beers: Beer[]) => {
        actualBeers = beers;
      });

      httpMock.expectOne('http://localhost:3000/good-beers').flush(expectedBeers);

      expect(actualBeers).toEqual(expectedBeers);
    }));
  });
});
