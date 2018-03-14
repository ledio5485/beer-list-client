# Create a Web Application with Angular CLI
Good tools make application development quicker and easier to maintain than if you did everything by hand.  

The [Angular CLI][angular-cli] is a _command line interface_ tool that can create a project, add files, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

The goal in this guide is to build and run a simple [Angular][angular] application in [TypeScript][typescript], using the [Angular CLI][angular-cli] while adhering to the [Style Guide][angular-style-guide] recommendations that benefit every [Angular][angular] project.

## Set up the Development Environment
To create an [Angular][angular] project, make sure you have already installed:
- latest LTS Version of [Node.js][node-js] (recommended for most users)

```bash
sudo apt-get install nodejs
```

Verify that you are running at least [node][node-js] 6.9.x and [npm][npm] 3.x.x (older versions produce errors, but newer versions are fine):

```bash
$ node -v
$ npm -v
```

- latest [Angular CLI][angular-cli-package] 

```bash
$ npm install -g @angular/cli@latest
```

Verify that [Angular CLI][angular-cli-package] was installed successfully:

```bash
$ ng -v
```

## Create a new project
It can be either from terminal or from IntelliJ IDEA:
* From __terminal__: Open a terminal window and generate a new project and skeleton application by running the following command:

```bash
$ ng new beer-list-client
```

This will create a new _beer-list-client_ directory.

* From __IntelliJ IDEA__: if you’d rather not use the command line and have IntelliJ IDEA (or WebStorm) installed, you can create a new Static Web Project and select Angular CLI. (File -> New -> Project ... Static Web -> Angular CLI)

## Code scaffolding
To generate a new component you just have to run the following command:

```bash
$ ng generate component component-name
```

You can also use:

```bash
$ ng generate directive|pipe|service|class|guard|interface|enum|module
```

### Hint
There is a shortcut for creating a component or a service by using:

```bash
$ ng g c|s compnent-or-service-name
```

## Create a BeerListComponent
Create a <beer-list> component by running the following command:

```bash
$ ng g c beer-list
```

## Create a BeerService
Create a __beer__ service by running the following command:

```bash
$ ng g s shared/beer/beer
```

Create a file `src/app/shared/index.ts`:

```bash
$ touch src/app/shared/index.ts
```

and export the __BeerService__. 

```typescript
export * from './beer/beer.service';
```

_Note: The reason for this file is so you can export multiple classes and import them in one line rather than multiple._

Modify `beer.service.ts` to call the __good-beers__ API service:

```typescript
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class BeerService {
  constructor(private http: HttpClient) {
  }

  getAll(): Observable<any> {
    return this.http.get('http://localhost:3000/good-beers');
  }
}
```

Open `src/app/app.module.ts` and add __HttpClientModule__ as an import:

```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  ...
  imports: [BrowserModule, HttpClientModule],
  ...
})
```

### Create a Beer Model
Create a __Beer__ model in `src/app/shared/beer/beer.ts` to hold the result(s):

```bash
$ ng g i shared/beer/beer
```

```typescript
export interface Beer {
  id:   Number;
  name: String;
}
```

### Fix broken tests and add the new ones
Modify `src/app/shared/beer/beer.service.spec.ts` as following:

```typescript
import { async, inject, TestBed } from '@angular/core/testing';

import { BeerService } from './beer.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import { Beer } from './beer';

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
        {id: 3, name: 'Brinkhoff'}
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
```

## Use BeerService
Modify `src/app/beer-list/beer-list.component.ts` to use the __BeerService__ and store the results in a local variable:
* Add a `beerService` parameter of type `BeerService` to the constructor.
* Add a field `beers` of type `Array<Beer>` to store the results.
* Implement `ngOnInit` to fetch the data from `beerService` and store them to `beers`.  
_Notice that you need to add the service as a provider in the __@Component__ definition or you will see an error._

```typescript
import { Component, OnInit } from '@angular/core';
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

  constructor(private beerService: BeerService) { }

  ngOnInit() {
    this.beerService.getAll().subscribe(
      data => this.beers = data,
      error => console.log(error)
    );
  }
}
```

## Rendering the Beers
Modify `src/app/beer-list/beer-list.component.html` so it renders the list of beers:

```html
<h2>Beer List</h2>

<ul *ngFor="let beer of beers">
  <li>{{beer.name}}</li>
</ul>
```

Update `src/app/app.component.html` to have the __BeerListComponent__ rendered when you’re opening the root page:

```html
<app-beer-list></app-beer-list>
```

## Fake the api server
Create a folder __.json-server__

```bash
$ mkdir .json-server
```

and put these two files:

```bash
$ touch .json-server/json-server.js
```

```javascript
// json-server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const port = 3000;

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  console.log('JSON Server is running on http://localhost:' + port);
});
```

```bash
$ touch .json-server/db.json
```

```json
{
  "good-beers": [
    {"id": 1, "name": "Hovels"},
    {"id": 2, "name": "Kronen"},
    {"id": 3, "name": "Brinkhoff"},
    {"id": 4, "name": "DAB"},
    {"id": 5, "name": "Jever"},
    {"id": 6, "name": "Bergmann"},
    {"id": 7, "name": "Hansa"}
  ]
}
```

Add __json-server__ library as a dev dependency:

```bash
$ npm install json-server@latest --save-dev
```

Modify __package.json__:
- add `"api-server": "node .json-server/json-server.js"` under `scripts`
- modify `start` script as follows: `"start": "npm run api-server | ng serve --open"`
(the `--open` flag opens a browser to [http://localhost:4200/][app])

_Note_: another approach to emulate CRUD operations over a RESTy API is using Angular [in-memory-web-api][in-memory-web-api]

## We Are Done
(Optional)Change the name of the application in the __AppComponent__ `src/app/app.component.ts`:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Beer List App';
}
```

Run the application:

```bash
$ npm start
```

You should see the app running in your browser.

* check that [api-server][api-server] is up and running 
* check that [application][app] is already opened on your favorite browser and running

## Add Angular Material
We’ll use [Angular Material’s components][angular-material-components] to make the UI look better, especially on mobile phones.  
Install [Angular Material][angular-material], cdk and animations libraries, which [Angular Material’s components][angular-material-components] sometimes leverages:

```bash
$ npm install --save @angular/material @angular/cdk @angular/animations
```

Modify `src/styles.css` to specify the default theme and icons:

```css
@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';
```

Import __MatToolbarModule__, __MatListModule__, __MatIconModule__ in `src/app/app.module.ts`:

```typescript
@NgModule({
  ...
  imports: [
    ...
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    ...
  ],
  ...
})
export class AppModule {
}

```

Change `src/app/beer-list/beer-list.component.html`:

```html
<mat-list>
  <h1 mat-subheader>Beer List</h1>
  <mat-list-item *ngFor="let beer of beers">
    <mat-icon mat-list-icon>filter_{{beer.id}}</mat-icon>
    <h4 mat-line>{{beer.name | uppercase}}</h4>
  </mat-list-item>
</mat-list>
```

Change `src/app/app.component.html` as following:

```html
<mat-toolbar color="primary">
  <span>Welcome to {{title}}!</span>
</mat-toolbar>

<app-beer-list></app-beer-list>
```

Visit [Angular Material][angular-material] and [Material Icons][material-icons] for a full list of components and icons.

## Remove a beer

Implement `delete(beerId)` in __BeerService__ `src/app/shared/beer/beer.service.ts`:

```typescript
delete(id: Number): Observable<any> {
  return this.http.delete(`http://localhost:3000/good-beers/${id}`);
}
```

Implement `delete(beerId)` in __BeerListComponent__ `src/app/beer-list/beer-list.component.ts`:

```typescript
delete(beerId: Number): void {
  this.beerService.delete(beerId).subscribe(
    () => this.beers = this.beers.filter(beer => beer.id !== beerId),
    error => console.log(error)
  );
}
```

Add an icon and associate the `click` event to it on `src/app/beer-list/beer-list.component.html`: 

```html
<mat-list>
  <h1 mat-subheader>Beer List</h1>
  <mat-list-item *ngFor="let beer of beers">
    <mat-icon mat-list-icon>filter_{{beer.id}}</mat-icon>
    <h4 mat-line>{{beer.name | uppercase}}</h4>
    <mat-icon mat-list-icon (click)="delete(beer.id)" [style.cursor]="'pointer'">delete</mat-icon>
  </mat-list-item>
</mat-list>
```

# CONGRATULATIONS
That's all folks! Let's grab a __Beer__!

---

[angular]: https://angular.io
[angular-cli]: https://cli.angular.io
[angular-cli-package]: https://www.npmjs.com/package/@angular/cli
[angular-style-guide]: https://angular.io/guide/styleguide
[in-memory-web-api]: https://github.com/angular/in-memory-web-api

[angular-material]: https://material.angular.io
[angular-material-components]: https://material.angular.io/components
[material-icons]: https://material.io/icons

[typescript]: https://www.typescriptlang.org

[node-js]: https://nodejs.org/en/download
[npm]: https://www.npmjs.com

[api-server]: http://localhost:3000
[app]: http://localhost:4200
