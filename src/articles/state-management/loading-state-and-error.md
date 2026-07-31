---
title: "სთეითში მოლოდინის რეჟიმისა და ერორის ასახვა"
---

# სთეითში მოლოდინის რეჟიმისა და ერორის ასახვა

API-სთან დაკავშირებულ ოპერაციებს რაღაც დრო სჭირდებათ, ამიტომ კარგი იქნება, თუ
მომხმარებელს ვაცნობებთ, რომ რაღაც მოლოდინის პროცესი მიმდინარეობს. ამისთვის
სერვისში დავამატოთ სიგნალი `_loading`. ეს იქნება ბულიანი.

აუცილებელია გავითვალისწინოთ, რომ შესაძლებელია მოხდეს რაიმე ერორი. ამიტომ
მისი მესიჯის შესახებ ინფორმაციაც სადმე უნდა შევინახოთ. ამისთვის შევქმნათ
`_error` სიგნალი, სადაც ან ერორის ტექსტი იქნება, ან `null`, თუ ერორი არ არსებობს.

```ts
private readonly _loading = signal(false);
private readonly _error = signal<string | null>(null);

readonly loading = this._loading.asReadonly();
readonly error = this._error.asReadonly();
```

ახლა თითოეულ მოთხოვნას უნდა დავამატოთ სამი რამ: მოთხოვნის დაწყებამდე
`loading`-ის ჩართვა, წარმატების შემთხვევაში მისი გამორთვა, ხოლო ერორის
შემთხვევაში — ერორის შენახვა.

`init` მეთოდი ასე გამოიყურება:

```ts
  init() {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<TodoItem[]>(this.url).subscribe({
      next: (todos) => {
        this._todos.set(todos);
        this._loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this._error.set(error.message);
        this._loading.set(false);
      },
    });
  }
```

`subscribe`-ს ერთი ქოლბექის ნაცვლად ობიექტს ვაწვდით, სადაც `next` წარმატებულ
პასუხს ამუშავებს, ხოლო `error` — ერორს. ეს `HttpClient`-ის ჩვეულებრივი
შესაძლებლობაა და დამატებით RxJS ოპერატორებს არ საჭიროებს.

## გამეორება ცუდი ნიშანია

თუ ამავე სამ ხაზს `addItem`-შიც ჩავწერთ, კოდი გამეორება მოგვიწევს — და
ყოველ ახალ მეთოდზე ეს გამეორეორებები ერთიმეორეს დაემატება. გამოვყოთ ეს საერთო ლოგიკა
ერთ პრივატულ მეთოდში:

```ts
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Service, signal } from "@angular/core";
import { Observable } from "rxjs";

export interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

@Service()
export class TodoService {
  private url = "http://localhost:3000/todos";
  private http = inject(HttpClient);

  private readonly _todos = signal<TodoItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly todos = this._todos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  init() {
    this.request(this.http.get<TodoItem[]>(this.url), (todos) => {
      this._todos.set(todos);
    });
  }

  addItem(title: string) {
    const itemToAdd = { title, done: false };

    this.request(this.http.post<TodoItem>(this.url, itemToAdd), (newItem) => {
      this._todos.update((todos) => [...todos, newItem]);
    });
  }

  /** ყოველი მოთხოვნის საერთო ლოგიკა: loading, error და შედეგის დამუშავება. */
  private request<T>(request$: Observable<T>, onSuccess: (value: T) => void) {
    this._loading.set(true);
    this._error.set(null);

    request$.subscribe({
      next: (value) => {
        onSuccess(value);
        this._loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this._error.set(error.message);
        this._loading.set(false);
      },
    });
  }
}
```

`request` მეთოდი ორ არგუმენტს იღებს: თვითონ მოთხოვნას და ფუნქციას, რომელიც
წარმატებული პასუხის შემთხვევაში უნდა გაეშვას. ის generic-ია (`<T>`), ამიტომ
ტიპები არ იკარგება — `init`-ში `todos` იქნება `TodoItem[]`, ხოლო
`addItem`-ში `newItem` იქნება `TodoItem`.

ახლა თითოეული მეთოდი მხოლოდ იმაზე პასუხობს, რაც მისთვის უნიკალურია:
"რა მოთხოვნა უნდა გავგზავნო" და "პასუხი როგორ ჩავსვა სთეითში".

## თემფლეითში

კომპონენტს არაფრის დამატება არ სჭირდება — სერვისი უკვე დაინჯექთებულია და
ახალი სიგნალები იქ უკვე გამოიყენება:

```html
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
      [disabled]="!newItemTitle()"
      (click)="addItem()"
    >
      @if (todoService.loading()) {
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      } @else {
        <span>Add</span>
      }
    </button>
  </div>

  @if (todoService.error(); as error) {
    <div class="card text-bg-danger">
      <div class="card-body">
        <p>Error: {{ error }}</p>
      </div>
    </div>
  }

  <ul class="list-group">
    @if (isEmpty()) {
      <p>Your list will show here...</p>
    }
    @for (item of todoService.todos(); track item.id) {
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <input type="checkbox" [checked]="item.done" />
          <span class="ms-2">{{ item.title }}</span>
        </div>
      </li>
    }
  </ul>
</div>
```

`@if (todoService.error(); as error)` — `as` სინტაქსით სიგნალის მნიშვნელობას
ლოკალურ ცვლადში ვინახავთ, რომ იქვე გამოვსახოთ. ეს იმავეს აკეთებს, რასაც
`@if (x) { {{ x() }} }`, უბრალოდ სიგნალს ორჯერ არ კითხულობს.

ახლა [წაშლასა და მონიშვნას მივხედოთ](./update-and-delete.html).
