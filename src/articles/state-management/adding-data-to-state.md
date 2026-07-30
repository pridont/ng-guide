---
title: "სთეითში მონაცემების დამატება"
---

# სთეითში მონაცემების დამატება

მონაცემების დასამატებლად დაგვჭირდება სერვისში სათანადო ლოგიკის შემოტანა:

```ts
  addItem(title: string) {
    const itemToAdd = { title, done: false };

    this.http.post<TodoItem>(this.url, itemToAdd).subscribe((newItem) => {
      this._todos.update((todos) => [...todos, newItem]);
    });
  }
```

ჩვენ პარამეტრში მივიღებთ ახალი ნივთის აღწერას. მისგან ვქმნით ობიექტს,
რომელსაც ექნება სათაური და done, რომელიც თავიდან მცდარი უნდა იყოს.
`id` თვისებას `json-server` თავისით მიანიჭებს უნიკალური მნიშვნელობით
და პასუხში სრულ ობიექტს დაგვიბრუნებს.

`Content-Type` ჰედერის ხელით მითითება არ გვჭირდება — `HttpClient` ობიექტს
ავტომატურად გარდაქმნის JSON-ად და სათანადო ჰედერს თვითონ დააყენებს.

## `set` თუ `update`?

ინიციალიზაციისას `set`-ს ვიყენებდით, აქ კი `update`-ს. განსხვავება ასეთია:

- `set(value)` — მნიშვნელობას **მთლიანად ცვლის**. მაშინ ვიყენებთ, როცა
  ახალი მნიშვნელობა წინაზე არ არის დამოკიდებული (სერვერიდან სრული სია მოვიდა).
- `update(fn)` — ქოლბექში **წინა მნიშვნელობას** ვიღებთ და ახალს ვაბრუნებთ.
  მაშინ ვიყენებთ, როცა არსებულს რაღაცას ვამატებთ ან ვაკლებთ.

ჩვენ შემთხვევაში ახალი სია არის "ძველი სია + ახალი ნივთი", ამიტომ
`update` სწორი არჩევანია.

## ახალი მასივი, და არა `push`

ყურადღება მიაქციეთ, რომ ჩვენ **ახალ მასივს ვქმნით** სპრედ ოპერატორით:

```ts
this._todos.update((todos) => [...todos, newItem]);
```

და არა ასე:

```ts
// ❌ არ იმუშავებს
this._todos.update((todos) => {
  todos.push(newItem);
  return todos;
});
```

მიზეზი ისაა, რომ სიგნალი მნიშვნელობებს ნაგულისხმევად `Object.is`-ით ადარებს.
თუ იმავე მასივს დავაბრუნებთ, სიგნალისთვის რეფერენსი არ შეცვლილა, ესეიგი
ცვლილებაც არ მომხდარა — და თემფლეითი არ განახლდება. ეს ერთ-ერთი ყველაზე
ხშირი შეცდომაა სიგნალებთან მუშაობისას.

**წესი:** სიგნალში მოთავსებულ ობიექტს ან მასივს არასდროს ვცვლით ადგილზე —
ყოველთვის ახალს ვქმნით.

## კომპონენტში

კომპონენტის კლასში შემოვიტანოთ სიგნალი `newItemTitle` სადაც შეყვანილ ტექსტს
შევინახავთ და `addItem` მეთოდი, რომლითაც დავუძახებთ სერვისზე დამატების მეთოდს
და მას შეყვანილ ტექსტს გავატანთ. ამის შემდეგ ტექსტს ვაცარიელებთ.

```ts
import { Component, computed, inject, OnInit, signal } from "@angular/core";
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

  protected newItemTitle = signal("");

  protected isEmpty = computed(() => this.todoService.todos().length === 0);

  ngOnInit(): void {
    this.todoService.init();
  }

  addItem() {
    this.todoService.addItem(this.newItemTitle());
    this.newItemTitle.set("");
  }
}
```

თემფლეითში `ul` ელემენტამდე ჩავსვათ კონტეინერი, სადაც მოვათავსებთ `input`-სა
და ღილაკს. `input` დავაკავშიროთ სიგნალთან `NgModel`-ით, ხოლო ღილაკზე
დაკლიკების მოვლენა მივაბათ `addItem` მეთოდს. ღილაკი გაუქმებული იქნება, თუ
`newItemTitle` ცარიელი სტრინგია.

```html
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
    <span>Add</span>
  </button>
</div>
```

`[(ngModel)]` პირდაპირ სიგნალთან მუშაობს: ბაინდინგში ფრჩხილებს **არ** ვწერთ
(`[(ngModel)]="newItemTitle"`), რადგან two-way ბაინდინგს თვითონ სიგნალი
სჭირდება და არა მისი მნიშვნელობა. სამაგიეროდ, სადაც მნიშვნელობა გვჭირდება —
`[disabled]`-ში — ფრჩხილები აუცილებელია: `!newItemTitle()`.

ტექსტის შეყვანა და ღილაკზე დაკლიკება სერვისზე მეთოდს გააქტიურებს რაც HTTP
მოთხოვნას განახორციელებს და სთეითს განაახლებს ახალი დამატებული ნივთით.
ვინაიდან თემფლეითი ამ სიგნალს კითხულობს, შედეგი მაშინვე გამოჩნდება.

ახლა [სთეითში მოლოდინის რეჟიმისა და ერორების ასახვაზე](./loading-state-and-error.html) გადავინაცვლოთ.
