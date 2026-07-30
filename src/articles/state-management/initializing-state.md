---
title: "სთეითში მონაცემების ინიციალიზაცია"
---

# სთეითში მონაცემების ინიციალიზაცია

ჯერ შევქმნათ სერვისი `todo.service.ts`, რომელიც გასაკეთებელი საქმეების სიის მენეჯმენტზე
იზრუნებს, ისევე როგორც ბექენდიდან ამ სიის მიღება-მოდიფიკაციაზე. მივხედოთ სთეითის
ინიციალიზაციის ლოგიკას. ანუ ჩვენ გვინდა, რომ როცა აპლიკაცია გაიხსნება, ჩაიტვირთოს
გასაკეთებელი საქმეები.

```ts
import { HttpClient } from "@angular/common/http";
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

  private http = inject(HttpClient);

  get todos() {
    return this.todos$.asObservable();
  }

  public init() {
    this.http
      .get<TodoItem[]>(this.url)
      .pipe(
        tap((todos) => {
          this.todos$.next(todos);
        })
      )
      .subscribe();
  }
}
```

ჩვენ აქვე ვქმნით TodoItem-ის ინტერფეისს, რომელიც იმ ტიპს შეესაბამება,
რა ტიპის ობიექტებიც დავამატეთ `database.json`-ში.

სერვისში ვინახავთ მისამართს, რომელიც ენდფოინთის მიხედვით აცნობებს
`json-server`-ს JSON ფაილში რომელი თვისებიდან ამოიღოს ინფორმაცია.
ვქმნით `todo$`-ს რომელიც იქნება `BehaviorSubject`, ის დააბრუნებს
`TodoItem` მასივის ტიპის მონაცემებს და ის თავიდან იქნება ცარიელი მასივი.

კონსტრუქტორში შემოგვაქვს `HttpClient` რომლითაც მოთხოვნებს განვახორციელებთ.

აქვე ვმქნით გეთერს, რომელიც ამ ჩვენ `todo$` სტრიმს დააბრუნებს `asObservable`
მეთოდით, ეს საბჯექთის მაგივრად აბრუნებს Observable ინსტანციას, რათა მასზე
კომპონენტებიდან `next` მეთოდის დაძახება არ იყოს შესაძლებელი. ჩვენ გვინდა,
რომ `next` მეთოდის დაძახება შეიძლებოდეს მხოლოდ სერვისიდან, ამით გაუგებრობებს
ავირიდებთ თავიდან რადგან სხვადასხვა კომპონენტებიდან მისი დაძახება რაღაც ეტაპზე
ქაოსს გამოიწვევს.

ჩვენ ვქმნით `init` მეთოდს, რომელსაც შეგვიძლია კომპონენტიდან დავუძახოტ.
ის HTTP მოთხოვნით მიიღებს მონაცემებს და მას `tap` ოპერატორით `todos$`
სტრიმში დაანექსთებს. ასე GET მოთხოვნას მოყვება ეფექტი, რომელიც სთეითის
სტრიმში ახალ მნიშვნელობას გასცემს. მასზე აქვე ვასუბსქრაიბებთ, რადგან
კომპონენტში მონაცემებს მაინც `todos$` სტრიმიდან ავიღებთ. ჩვენთვის მთავარია,
რომ ამ მეთოდზე დაძახებამ უბრალოდ მოთხოვნა გაგზავნოს და `tap`-ში არსებული
ეფექტი გამოიწვიოს. ანსუბსქრაიბი აქ არ დაგვჭირდება, რადგან ამას `HttpClient`
აგვარებს.

ახლა App-ში გამოვიყენოთ ეს სერვისი:

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

  todos$ = this.todoService.todos;

  ngOnInit(): void {
    this.todoService.init();
  }
}
```

აქ ჩვენ `@Component` დეკორატორში საინტერესო რაღაცას ვამატებთ:
`changeDetection`-ის სტრატეგიას ვცვლით `onPush`-ზე (რომელიც უნდა დავაიმპორტოთ).
ეს ეუბნება ანგულარის აპლიკაციას, რომ ავტომატურად არ დააფიქსიროს ცვლილებები და
არ დაარენდეროს თემფლეითი. ამის გამოყენება უაცილებელი არ არის, მაგრამ რეაქტიული
მიდგომის დროს ეს რესურსებს ზოგავს, რადგან ჩვენ შეგვიძლია ცვლილებების დეტექტორი
მაშინ დავატრიგეროთ, როცა ამის საჭიროება ნამდვილად არსებობს. ეს მეთოდი სირთულეებს
შექმნის, თუ ჩვენ სტრიმებს და `async` ფაიფებს არ ვიყენებთ, თუმცა მათი გამოყენების
შემთხვევაში აპლიკაცია შედარებით უფრო სწრაფია და ნაკლებ რესურსებს საჭიროებს.
ანგულარში რეაქტიული პროგრამირების დროს ფაქტობრივად ყველა კომპონენტი `onPush`-ზე გვაქვს.

ჩვენ ვაინჯექთებთ `TodoService`-ს და კომპონენტის თვისებაში ვინახავთ ნივთების
სტრიმს, რომელსაც გეთერი გვიბრუნებს.

აპლიკაციის ინიციალიზაციისას სერვისზე ვეძახით `init` მეთოდს, რომელის შედეგადაც
ჩვენ კომპონენტის `todos$` სტრიმში მონაცემები უნდა მივიღოთ, რა თქმა უნდა ეს იმ
შემთხვევაში, თუ ამ სტრიმზე დავასუბსქრაიბებთ. კონვენციურად ყოველთვის უნდა ვცადოთ
თემფლეითში `async` ფაიფით დასუბსქრაიბება იმის მაგივრად, რომ მსაზე კლასში
დავასუბსქრაიბოთ.

```html
<div class="container" style="max-width: 500px">
  <h1>Your List:</h1>
  @if (todos$ | async; as todos) {
    <ul class="list-group">
      @if (todos.length === 0) {
        <p>Your list will show here...</p>
      }
      @for (item of todos; track item.id) {
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <input type="checkbox" [checked]="item.done" />
            <span class="ms-2">{{ item.title }}</span>
          </div>
        </li>
      }
    </ul>
  }
</div>
```

ჩვენ გამოვსახავთ სიას `ngIf` დირექტივით, სადაც `async` ფაიფით სტრიმზე ვასუბსქრაიბებთ
და მისი შედეგი გამოგვაქვს, როგორც `todo` ცვლადი. შემდეგ ამ ცვლადზე ვაკეთებთ
ლუპს და მათ გამოვსახავთ. ჩვენ ვქმნით ჩექბოქსს ყოველი ნივთისთვის, რომელიც მინიშნული
იქნება, თუ მისი `done` თვისება ჭეშმარიტია. თუ მასივი ცარიელია, ჩვენ ტექსტით ამაზე
მივანიშნებთ. `async` ფაიფის ერთ-ერთი პლიუსი ის არის, რომ ის view-ს ხელახლა
დარენდერებას მაშინ აიძულებს, როცა მასში გატარებული სტრიმი ახალ მნიშვნელობას გასცემს.

თუ ბრაუზერს შევხედავთ, ნივთების სია უნდა გამოისახოს.
ახლა [ახალი ნივთების დამატებას მივხედოთ](./adding-data-to-state.html).
