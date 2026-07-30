---
title: "სთეითში მონაცემების დამატება"
---

# სთეითში მონაცემების დამატება

მონაცემების დასამატებლად დაგვჭირდება სერვისში სათანადო ლოგიკის შემოტანა:

```ts
  public addItem(title: string) {
    const itemToAdd = {
      title: title,
      done: false,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

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
        })
      )
      .subscribe();
  }
```

ჩვენ პარამეტრში მივიღებთ ახალი ნივთის აღწერას. მისგან ვქმნით ობიექტს,
რომელსაც ექნება სათაური და done, რომელიც თავიდან მცდარი უნდა იყოს.
`id` თვისებას `json-server` თავისით მიანიჭებს უნიკალური მნიშვნელობით.

აქვე ვქმნით `HttpHeaders`-ის ინსტანციას, სადაც საჭიროა რომ მივუთითოთ
`Content-Type` როგორც `application/json` რათა მოთხხოვნამ მონაცემები
მიიღოს (ეს `json-server`-ის სპეციფიკური საჭიროებაა). მოღხოვნას ვაგზავნით
და ვაწვდით ახალ ნივთს (რომელიც სტრინგად ავტომატურად დაკონვერტირდება).
მესამე არგუმენტად ვაწოდებთ ობიექტში (შემოკლებულად) headers თვისებაში ჩვენი
`HttpHeaders`-ის ინსტანციას.

საპასუხოდ სერვერი გვიბრუნებს ობიექტს, სადაც გვაქვს რიცხვის ტიპის აიდი.
ამის საფუძველზე შეგვიძლია დავწეროთ ეფექტი `tap` ოპერატორში, სადაც
ამ აიდის ავიღებთ, ჩავსვამთ ობიექტში, რომელსაც ასევე ექნება ის დანარჩენი
თვისებები, რაც თავიდან შექმნილ ახალ ნივთს მივეცით და დავანექსთებთ
ახალ მასივს, სადაც ჩავყრით სპრედ ოპერატორით `todos$` სტრიმის უკანასკნელ
მნიშვნელობას, პლიუს ახლად შექმნილ ნივთს. ასე სტრიმში ვანექსთებთ ძველ
მასივს მასში დამატებული ახალი ნივთით.

კომპონენტის კლასში შემოვიტანოთ თვისება `newItemTitle` სადაც შეყვანილ ტექსტს
შევინახავთ და `addItem` მეთოდი, რომლითაც დავუძახებთ სერვისზე დამატების მეთოდს
და მას შეყვანილ ტექსტს გავატანთ. ამის შემდეგ ტექსტს ვაცარიელებთ.

```ts
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
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

  ngOnInit(): void {
    this.todoService.init();
  }

  addItem() {
    this.todoService.addItem(this.newItemTitle);
    this.newItemTitle = "";
  }
}
```

თემფლეითში `ul` ელემენტამდე ჩავსვათ კონტეინერი, სადაც მოვათავსებთ `input`-სა
და ღილაკს. `input` დავაკავშიროთ კლასის თვისებასთან `NgModel`-ით, ხოლო ღილაკზე
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
    [disabled]="!newItemTitle"
    (click)="addItem()"
  >
    <span>Add</span>
  </button>
</div>
```

ტექსტის შეყვანა და ღილაკზე დაკლიკება სერვისზე მეთოდს გააქტიურებს რაც HTTP
მოთხოვნას განახორციელებს და სტრიმს განაახლებს ახალი დამატებული ნივთით.
ვინაიდან სტრიმზე უკვე თემფლეითში ვასუბსქრაიბებთ, შედეგი გამოჩნდება.

ახლა [სთეითში მოლოდინის რეჟიმისა და ერორების ასახვაზე](./loading-state-and-error.html) გადავინაცვლოთ.
