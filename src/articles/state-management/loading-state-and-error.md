---
title: "სთეითში მოლოდინის რეჟიმისა და ერორის ასახვა"
---

# სთეითში მოლოდინის რეჟიმისა და ერორის ასახვა

API-სთან დაკავშირებულ ოპერაციებს რაღაც დრო სჭირდებათ, ამიტომ კარგი იქნება, თუ
მომხმარებელს ვაცნობებთ, რომ რაღაც მოლოდინის პროცესი მიმდინარეობს. ამისთვის სერვისში
დავამატოთ `BehaviorSubject` რომელსაც ერქმევა `todosLoading$`. ეს იქნება ბულიანი.

აუცილებელია გავითვალისწინოთ, რომ შესაძლებელია მოხდეს რაიმე ერორი. ამიტომ
მისი მესიჯის შესახებ ინფორმაციაც სადმე უნდა შევინახოთ.
ერორის არსებობის შემთხვევაში ჩვენ შეგვიძლია შევქმნათ `error$` `BehaviorSubject` და
მანდ დავანექსთოთ ამ ერორის ობიექტი ან `null`, იმ შემთხვევაში თუ ერორი არ არსებობს.

```ts
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, of, tap } from "rxjs";

export interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

@Injectable({ providedIn: "root" })
export class TodoService {
  private url = "http://localhost:3000/todos";

  private todos$ = new BehaviorSubject<TodoItem[]>([]);
  private todosLoading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<HttpErrorResponse | null>(null);

  private http = inject(HttpClient);

  get error() {
    return (
      this.error$
        .asObservable()
        // If error has emitted a value, loading has finished
        .pipe(tap(() => this.todosLoading$.next(false)))
    );
  }

  get loading() {
    return (
      this.todosLoading$
        .asObservable()
        // If loading state is retriggered, reset the error stream
        .pipe(tap((loading) => loading && this.error$.next(null)))
    );
  }

  get todos() {
    return (
      this.todos$
        .asObservable()
        // Every time this observable emits value, it means that loading has finished
        .pipe(tap(() => this.todosLoading$.next(false)))
    );
  }

  public init() {
    this.todosLoading$.next(true);

    this.http
      .get<TodoItem[]>(this.url)
      .pipe(
        tap((todos) => {
          this.todos$.next(todos);
        }),
        catchError((error: HttpErrorResponse) => {
          this.error$.next(error);
          return of(null);
        })
      )
      .subscribe();
  }

  public addItem(title: string) {
    this.todosLoading$.next(true);

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    const itemToAdd = {
      title: title,
      done: false,
    };

    this.http
      .post<{ id: number }>(this.url, itemToAdd, {
        headers,
      })
      .pipe(
        tap((response) => {
          const newItem = {
            id: response.id,
            ...itemToAdd,
          };
          this.todos$.next([...this.todos$.value, newItem]);
        }),
        catchError((error: HttpErrorResponse) => {
          this.error$.next(error);
          return of(null);
        })
      )
      .subscribe();
  }
}
```

თითოეული საბჯექთისთვის ვქმნით გეთერებს, სადაც ამ საბჯექთებს, როგორც observable-ებს
ვაბრუნებთ. მათზე აქვე ფაიფით ეფექტებს ვამატებთ `tap` ოპერატორით, რომელიც გააქტიურდება
ყოველ ჯერზე, როცა ამ საბჯექთებზე `next` მეთოდს დავუძახებთ. ეს შემდეგი ეფექტებია:

- `get error`-ში: როცა ერორი მნიშვნელობას დააემითებს, ეს ნიშნავს, რომ მოთხოვნა დასრულდა
  და ესეიგი მოლოდინის რეჟიმში აღარ ვართ, ამიტომ `todosLoading$`-ში ეს ახალი მდგომარეობა
  უნდა გავცეთ.
- `get loading`-ში: თუ მოლოდინის რეჟიმი აქტიურდება, ესეიგი მოთხოვნა ხელახლა იგზავნება,
  რაც იმას ნიშნავს, რომ წინა ერორის ობიექტი (თუ ის აქამდე არსებობდა) ახლა უნდა გაქრეს,
  რათა თუ ამ სტრიმიდან მესიჯს გამოვსახავთ, ისიც გაუჩინარდეს.
- `get todos`-ში: თუ ეს სტრიმი მნიშვნელობას აემითებს, ესეიგი პასუხი მივიღეთ, და მოლდონის
  რეჟიმი შეგვიძლია გამოვრთოთ, ანუ `todosLoading$` სტრიმში გავცეთ `false`.

ყოველი მოთხოვნის გაგზავნის წინ, ჩვენ გავცემთ `todosLoading$` სტრიმში `true`-ს.

თუთოეულ HTTP მოთხოვნას ასევე ვამატებთ `catchError` ოპერატორს. ეს ოპერატორი
დაიჭერს სტრიმში არსებულ ერორებს და მასზე წვდომას მოგვცემს. ეს ერორები იქნება
`HttpErrorResponse` ტიპის და ჩვენ მას გადავცემთ `error$` სტრიმს, `next` მეთოდით.
ამ ოპერატორში აუცილებელია რომ რაღაც დავაბრუნოთ, რადგან ოპერაცია წარუმატებალია,
თუ ეს ოპერატორი გააქტიურდა, მაშინ შეგვიძლია უბრალოდ `null` დავაბრუნოთ, რომელსაც
`of` ოპერატორით observable-ად ვაქცევთ. ეს საჭიროა რადგან `catchError` თვითონ
შედეგს სტრიმის ფორმით არ აბრუნებს. ეს ოპერატორი გათვლილია იმაზე, რომ ერორის
შემთხვევაში სანაცვლოდ დავვაბრუნოთ ახალი სტრიმი, მაგალითად HTTP მოთხოვნა ალტერნატიულ
ენდფოინთზე, თუმცა ჩვენ ეს არ გვჭირდება.

ახლა შეგვიძლია ეს ყელაფერი თემფლეითში გავიტანოთ. `App`-ში შევქმნათ
`loading$` და `error$` თვისებები, სადაც სათანადო სერვისის სტრიმებს შევინახავთ.
თემფლეითში რომ ისინი პირდაპირ გავიტანოთ, მოგვიწევს ბევრგან `async` ფაიფის გამოყენება.
ეს ყოველთვის პრობლემური არ არის, მაგრამ ხშირად გავრცელებული პრაქტიკაა ისეთი
სტრიმების, რომლებიც თემფლეითში გამოიყენება, ერთ სტრიმად გაერთიანება და მხოლოდ
ამ უკანასკნელზე დასუბსქრაიბება.

```ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { combineLatest, map } from "rxjs";
import { TodoItem, TodoService } from "./todo.service";

@Component({
  selector: "app-root",
  imports: [FormsModule],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private todoService = inject(TodoService);

  newItemTitle = "";

  todos$ = this.todoService.todos;
  loading$ = this.todoService.loading;
  error$ = this.todoService.error;

  vm$ = combineLatest([this.todos$, this.loading$, this.error$]).pipe(
    map(([todos, loading, error]) => ({ todos, loading, error }))
  );

  ngOnInit(): void {
    this.todoService.init();
  }

  addItem() {
    this.todoService.addItem(this.newItemTitle);
    this.newItemTitle = "";
  }
}
```

აქ ჩვენ სწორედ ამიტომ ვიყენებთ `combineLatest` ოპერატორს, სადაც მასივში გადავცემთ
ჩვენ კომპონენტში არსებულ სტრიმებს. ეს ოპერატორი აერთიანებს მიღებული სტრიმების
უკანასკნელ მნიშვნელობებს და აბრუნებს ერთ სტრიმს, სადაც მასივის სახით ინახება
გაერთიანებული სტრიმების უკანასკნელი მნიშვნელობები. ჩვენ მსაზე `pipe`-ს ვუძახებთ
და ვიყენებთ `map` ოპერატორს, რათა ქოლბექიდან ავიღოთ ეს მასივი, მსაზე დესტრუქტურიზაცია
მოვახდინოთ და დავაბრუნოთ ობიექტი, რომელიც თითოეული სტრიმის მნიშვნელობას შეინახავს
ჩვენთვის სასურველი სახელის ქვეშ. აქ გაითვალისწინეთ, რომ რა ინდექსზეც მივაწოდეთ
თითოეული სტრიმი `combineLatests`-ს, იმ ინდექსზე მივიღებთ ამ სტრიმების მნიშვნელობებს
`map`-ის ქოლბექში.

შედეგად ვიღებთ ერთ დიდ სტრიმს სახელად `vm$` რომელიც არის "View Model"-ის
აბრივიაცია. ეს მთელი ჩვენი კომპონენტის გამოსახვადი მონაცემების მოდელია.

გაითვალისწინეთ, რომ `combineLatest` მნიშვნელობას იქამდე არ დააემითებს, სანამ
ყველა მასში არსებული სტრიმი არ გასცემს, სულ მცირე ერთხელ, მნიშვნელობას. ჩვენ
შემთხვევაში ეს პრობლემა არ არის, რადგან `BehaviorSubject`-ები ყოველთვის აბრუნებენ
უკანასკნელ მნიშვნელობას.

ახლა თემფლეითში ყველაზე ზედა დონის კონტეინერზე ვასუბსქრაიბებთ მხოლოდ ამ `vm$` სტრიმზე:

```html
@if (vm$ | async; as vm) {
<div class="container" style="max-width: 500px">
  <h1>Your List:</h1>
  <div class="row mb-2 gap-2 p-2">
    <input
      type="text"
      placeholder="Add a new item..."
      [(ngModel)]="newItemTitle"
      class="col-12"
    />
    <button
      class="btn btn-primary col-12"
      [disabled]="!newItemTitle"
      (click)="addItem()"
    >
      @if (!vm.loading) {
        <span>Add</span>
      } @else {
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      }
    </button>
  </div>
  <ul class="list-group">
    @if (vm.error) {
      <div class="card text-bg-danger">
        <div class="card-body">
          <p>Error: {{ vm.error.message }}</p>
        </div>
      </div>
    }
    @if (vm.todos.length === 0) {
      <p>Your list will show here...</p>
    }
    @for (item of vm.todos; track item.id) {
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <input type="checkbox" [checked]="item.done" />
          <span class="ms-2">{{ item.title }}</span>
        </div>
      </li>
    }
  </ul>
</div>
}
```

შედეგს ვინახავთ როგორც `vm` ობიექტს, და ამ ობიექტიდან ვიღებთ სათანადო თვისებებს:

- ნივთის დამატების ღილაკის შიგნით გამოვაჩინოთ ტექსტი, თუ `vm.loading` არის მცდარი.
- იმავე ღილაკის შიგნით გამოვაჩინოთ (ბუტსტრაპის) სპინერი, თუ `vm.loading` არის ჭეშმარიტი.
- სიის თავში, ბუტსტრაპის ბარათში გამოვაჩნიოთ ერორის მესიჯი, თუკი ის არსებობს.
- თუ `vm.todos` ცარიელი მასივია, მაშინ გამოვაჩინოთ მინიშნების ტექსტი.
- და ბოლოს `vm.todos`-ზე ლუპით გამოვსახოთ თითოეული ნივთი.

გადავამოწმოთ, რომ აპლიკაცია მუშაობს. ახლა ჩატვირთვის სპინერი ყოველი მოთხოვნის დროს
უნდა აქტიურდებოდეს და ყოველი მოთხოვნის დასრულების შემდეგ ქრებოდეს. ასევე, თუ
ჩვენ ერორს გამოვიწვევთ (მაგალითად სერვისში არასწორი URL-ის გამოყენებით), ჩატვირთვის
სპინერის გაქრობასთან ერთად შედეგად გამოგვიჩნდება ერორის მესიჯი. რა თქმა უნდა, ეს
მომხმარებლისთვის მარტივად გასაგები მესიჯი არ არის, თუმცა ჯერჯერობით ესეც საკმარისია.

ახლა დროა [მონაცემების განახლებასა და წაშლაზე](./update-and-delete.html) ვიზრუნოთ.
