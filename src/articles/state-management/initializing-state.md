---
title: "სთეითში მონაცემების ინიციალიზაცია"
---

# სთეითში მონაცემების ინიციალიზაცია

ჯერ შევქმნათ სერვისი `todo-service.ts`, რომელიც გასაკეთებელი საქმეების სიის მენეჯმენტზე
იზრუნებს, ისევე როგორც ბექენდიდან ამ სიის მიღება-მოდიფიკაციაზე. მივხედოთ სთეითის
ინიციალიზაციის ლოგიკას. ანუ ჩვენ გვინდა, რომ როცა აპლიკაცია გაიხსნება, ჩაიტვირთოს
გასაკეთებელი საქმეები.

```ts
import { HttpClient } from "@angular/common/http";
import { inject, Service, signal } from "@angular/core";

export interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

@Service()
export class TodoService {
  private url = "http://localhost:3000/todos";
  private http = inject(HttpClient);

  // შიდა, მოდიფიცირებადი სთეითი
  private readonly _todos = signal<TodoItem[]>([]);

  // გარეთ გამოტანილი, მხოლოდ წასაკითხი
  readonly todos = this._todos.asReadonly();

  init() {
    this.http.get<TodoItem[]>(this.url).subscribe((todos) => {
      this._todos.set(todos);
    });
  }
}
```

ჩვენ აქვე ვქმნით TodoItem-ის ინტერფეისს, რომელიც იმ ტიპს შეესაბამება,
რა ტიპის ობიექტებიც დავამატეთ `database.json`-ში.

სერვისში ვინახავთ მისამართს, რომელიც ენდფოინთის მიხედვით აცნობებს
`json-server`-ს JSON ფაილში რომელი თვისებიდან ამოიღოს ინფორმაცია.
კლასში შემოგვაქვს `HttpClient` რომლითაც მოთხოვნებს განვახორციელებთ.

## ორი თვისება ერთი სთეითისთვის

ყურადღება მიაქციეთ ამ ორ ხაზს:

```ts
private readonly _todos = signal<TodoItem[]>([]);
readonly todos = this._todos.asReadonly();
```

ეს ერთი და იმავე სთეითის ორი "სახეა":

- `_todos` არის `WritableSignal` — მასზე `set` და `update` მეთოდები არსებობს.
  ის `private`-ია, ანუ მისი შეცვლა მხოლოდ ამ სერვისიდან შეიძლება.
  ხაზგასმისთვის სახელს ქვედა ტირეს ვუწერთ.
- `todos` არის იმავე სიგნალის მხოლოდ წასაკითხი ვერსია, რომელსაც
  [`asReadonly()`](/signals/) გვაძლევს. სწორედ მას იყენებენ კომპონენტები.

რატომ ვაკეთებთ ამას? იმისთვის, რომ სთეითის შეცვლა **ერთ ადგილას** მოხდეს.
თუ `_todos`-ს პირდაპირ გავიტანდით, ნებისმიერ კომპონენტს შეეძლებოდა მასზე
`set`-ის დაძახება, და რაღაც ეტაპზე ვეღარ გავიგებდით, სთეითი სად და რატომ
შეიცვალა. ახლა კი პასუხი ყოველთვის ერთია: სერვისის რომელიღაც მეთოდში.

`readonly` (ტაიპსკრიპტის კეივორდი) აქვე იმას უზრუნველყოფს, რომ თვითონ
თვისებას სხვა სიგნალით არ ჩავანაცვლოთ.

## init მეთოდი

ჩვენ ვქმნით `init` მეთოდს, რომელსაც შეგვიძლია კომპონენტიდან დავუძახოთ.
ის HTTP მოთხოვნით მიიღებს მონაცემებს და მათ `_todos` სიგნალში ჩასვამს
`set` მეთოდით. მოთხოვნაზე ვასუბსქრაიბებთ, რადგან სხვა შემთხვევაში ის
საერთოდ არ გაიგზავნება. `unsubscribe` აქ არ დაგვჭირდება, რადგან ამას
`HttpClient` აგვარებს.

აქ ერთი მნიშვნელოვანი დეტალია: `subscribe`-ის ქოლბექს **სთეითის განახლების
გარდა სხვა არაფერი აქვს გასაკეთებელი**. ვინ დაინახავს ამ ცვლილებას და როგორ
დარენდერდება — ეს უკვე სიგნალის საზრუნავია.

## კომპონენტში გამოყენება

ახლა `App`-ში გამოვიყენოთ ეს სერვისი:

```ts
import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TodoService } from "./todo-service";

@Component({
  selector: "app-root",
  imports: [FormsModule],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  protected todoService = inject(TodoService);

  ngOnInit(): void {
    this.todoService.init();
  }
}
```

სულ ეს არის. კომპონენტი სთეითს **არ იმეორებს** — ის სერვისს პირდაპირ
თემფლეითში კითხულობს. `protected` იმიტომ, რომ თემფლეითიდან წვდომა
გვჭირდება, მაგრამ კლასის გარედან — არა.

აპლიკაციის ინიციალიზაციისას სერვისზე ვეძახით `init` მეთოდს.

```html
<div class="container" style="max-width: 500px">
  <h1>Your List:</h1>
  <ul class="list-group">
    @if (todoService.todos().length === 0) {
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

ჩვენ `@for` ბლოკით ვლუპავთ სიგნალის მნიშვნელობაზე — გაითვალისწინეთ
ფრჩხილები: `todoService.todos()`. ჩვენ ვქმნით ჩექბოქსს ყოველი ნივთისთვის,
რომელიც მონიშნული იქნება, თუ მისი `done` თვისება ჭეშმარიტია. თუ მასივი
ცარიელია, ჩვენ ტექსტით ამაზე მივანიშნებთ.

არც `async` ფაიფი გვჭირდება, არც `subscribe` თემფლეითში, არც `unsubscribe`.
როცა `_todos` შეიცვლება, ანგულარი **ზუსტად იმ ადგილს** გადაარენდერებს,
სადაც ეს სიგნალი იკითხება.

## ოდნავ უფრო სუფთად: `computed`

`todoService.todos()` თემფლეითში ორჯერ იკითხება. ეს არაფრით არ არის ცუდი
(სიგნალის წაკითხვა იაფია), მაგრამ თუ პირობა უფრო რთული გახდება, ჯობია მას
სახელი დავარქვათ:

```ts
export class App implements OnInit {
  protected todoService = inject(TodoService);

  protected isEmpty = computed(() => this.todoService.todos().length === 0);

  ngOnInit(): void {
    this.todoService.init();
  }
}
```

```html
@if (isEmpty()) {
  <p>Your list will show here...</p>
}
```

`computed` ავტომატურად გადაითვლება, როცა `todos` შეიცვლება.

**შენიშვნა `OnPush`-ზე:** თუ ძველ მასალას ნახავთ, იქ ასეთ კომპონენტებზე
`changeDetection: ChangeDetectionStrategy.OnPush` ეწერება. ანგულარის
22-ე ვერსიიდან `OnPush` **ნაგულისხმევი სტრატეგიაა**, ამიტომ მისი ხელით
ჩაწერა აღარ არის საჭირო.

თუ ბრაუზერს შევხედავთ, ნივთების სია უნდა გამოისახოს.
ახლა [ახალი ნივთების დამატებას მივხედოთ](./adding-data-to-state.html).
