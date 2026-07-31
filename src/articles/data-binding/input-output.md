---
title: "Input & Output"
---

# Input & Output

`input` და `output` არიან ფუნქციები, რომელთა საშუალებითაც შეგვიძლია მონაცემები (data) და მოვლენები (events)
გადავცეთ ერთი კომპონენტიდან მეორეს. `input`-ის საშუალებით შვილი კომპონენტი მშობელისგან იღებს
მონაცემს, ხოლო `output`-ის საშუალებით შვილი კომპონენტი მოვლენას გადასცემს მშობელ კომპონენტს.

<img src="/assets/media/input-output.png" alt="input და output პრინციპების დიაგრამა" width="224" height="281" loading="lazy" decoding="async">

სანიმუშოდ შექმნილი გვაქვს ანგულარის ახალი აპლიკაცია, სადაც შევქმენით კომპონენტი სახელად child.
ეს უკანასკნელი სელექტორით განვათავსეთ `app.html`-ში. `Child` გამოდის `App`-ის
შვილი.

## Input

გადავცეთ მშობელი კომპონენტიდან შვილ კომპონენტს ინფორმაცია. ამისთვის შვილ კომპონენტში ვქმნით თვისებას
`input()` ფუნქციით, რომელიც `@angular/core`-დან უნდა დავაიმპორტოთ.

```ts
import { Component, input } from "@angular/core";

@Component({
  selector: "app-child",
  templateUrl: "./child.html",
  styleUrl: "./child.css",
})
export class Child {
  message = input("");
}
```

`input()`-ს არგუმენტად ვაწვდით საწყის (default) მნიშვნელობას — ამ შემთხვევაში
ცარიელ სტრინგს. ეს იმისთვის, რომ თუ მშობელი ამ თვისებას არაფერს მიაბამს,
კომპონენტს მაინც ჰქონდეს რაღაც მნიშვნელობა.

ტაიპსკრიპტი ტიპს **საწყისი მნიშვნელობიდან გამოიცნობს** — `input("")` აბრუნებს
`InputSignal<string>`-ს. თუ ტიპის ექსპლიციტური მითითება გვინდა, მაშინ ჯენერიკს
ვწერთ:

```ts
message = input<string>("");
```

`input()` ფუნქცია ანგულარის ქომფაილერისთვის განსაკუთრებული მნიშვნელობისაა:
მისი დაძახება **მხოლოდ კლასის თვისებაში** შეიძლება.

### input არის სიგნალი

`input()` აბრუნებს [სიგნალს](/signals/), კონკრეტულად `InputSignal`-ს. ეს
იმას ნიშნავს, რომ მნიშვნელობას ფუნქციის დაძახებით ვიღებთ — როგორც
თემფლეითში, ისე კლასში:

```html
<p>{{ message() }}</p>
```

```ts
console.log(this.message());
```

ეს სიგნალი არის **მხოლოდ წასაკითხი** — შვილ კომპონენტს მასზე `set` ან
`update` მეთოდი არ აქვს. მნიშვნელობას მხოლოდ მშობელი ცვლის, და ეს
სწორია: მონაცემი ერთი მიმართულებით მოძრაობს.

### მშობლიდან მიბმა

მშობელ კომპონენტში შევქმნათ მასივი `messages` რომელშიც შევინახავთ ორ სტრინგს:

```ts
import { Component } from "@angular/core";
import { Child } from "./child/child";

@Component({
  selector: "app-root",
  imports: [Child],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  messages = ["The first message", "The second message"];
}
```

მშობელი კომპონენტის თემფლეითში ფროფერთი ბაინდინგის საშუალებით შეგვიძლია
შვილის კლასში არსებულ სახელზე რაიმე მნიშვნელობების მიბმა:

```html
<app-child [message]="messages[0]" />
<app-child [message]="messages[1]" />
```

ყურადღება მიაქციეთ, რომ თემფლეითში **ფრჩხილებს არ ვწერთ** — `[message]`, და
არა `[message()]`. მშობელი უბრალოდ მნიშვნელობას აბამს, სიგნალს
თვითონ ანგულარი ქმნის.

აქ ჩვენ ორი child კომპონენტი განვათავსეთ, სადაც პირველს message თვისებაზე
ვაბამთ `messages` მასივში არსებულ პირველ სტრინგს, ხოლო მეორე child კომპონენტს
ვაბამთ `messages` მასივში არსებულ მეორე სტრინგს.

ტაიპსკრიპტის წყალობით ეს თვისება მხოლოდ კონკრეტული ტიპის მონაცემს მიიღებს,
ანუ თუ ჩვენ `message` თვისებაზე სხვა ტიპის მნიშვნელობას მივაბამთ, ეს გამოიწვევს
ერორს:

```html
<!-- Error: cannot assign type number to type string -->
<app-child [message]="34" />
```

### სავალდებულო input

ხშირად კომპონენტს საწყისი მნიშვნელობა უბრალოდ არ აქვს და მშობელმა
**აუცილებლად** უნდა მიაწოდოს რამე. ამისთვის `input`-ის ნაცვლად
`input.required`-ს ვიყენებთ:

```ts
export class Child {
  message = input.required<string>();
}
```

ახლა ანგულარი **ბილდის დროსვე** ერორს ამოაგდებს, თუ ამ კომპონენტს
`message`-ის მიწოდების გარეშე გამოვიყენებთ:

```html
<!-- Error: Required input 'message' from component Child must be specified -->
<app-child />
```

ეს ძველ `@Input()` დეკორატორთან შედარებით დიდი მიღწევაა: `input.required`-ის
ტიპში `undefined` არ შედის, ამიტომ კლასში მისი შემოწმება არ გვჭირდება.

### დამატებითი კონფიგურაცია

`input()` მეორე არგუმენტად კონფიგურაციის ობიექტს იღებს.

`alias` — თემფლეითში სხვა სახელით გამოჩენა:

```ts
value = input(0, { alias: "sliderValue" });
```

```html
<app-slider [sliderValue]="10" />
```

`transform` — მნიშვნელობის გარდაქმნა მიღებისთანავე:

```ts
import { booleanAttribute, input, numberAttribute } from "@angular/core";

export class Child {
  disabled = input(false, { transform: booleanAttribute });
  count = input(0, { transform: numberAttribute });
}
```

`booleanAttribute` HTML-ის ბულიანი ატრიბუტების ქცევას იმეორებს — ატრიბუტის
**არსებობა** უკვე `true`-ს ნიშნავს. `numberAttribute` კი მნიშვნელობას
რიცხვად გარდაქმნას ცდილობს.

```html
<!-- disabled() იქნება true -->
<app-child disabled />
```

## Output

`output()`-ის საშუალებით ჩვენ შეგვიძლია შევქმნათ მოვლენები, რომელსაც მშობელი
კომპონენტიდან მოვუსმინოთ (მაგალითად 'click' ივენთის მსგავსად).

ვთქვათ გვინდა, რომ შვილ კომპონენტში ღილაკზე დაჭერისას მშობელ კომპონენტს გადავცეთ
მესიჯის ტექსტის სიგრძე. ჯერ შევქმნათ ღილაკი, რომელზე დაკლიკებასაც მოვუსმენთ და
საპასუხოდ დავუძახებთ რამე მეთოდს.

```html
<p>{{ message() }}</p>
<button (click)="onCount()">Count Message Length</button>
```

შემდეგ გადავინაცვლოთ ts ფაილში. `input`-ის მსგავსად
ჩვენ შვილ კომპონენტში უნდა შევქმნათ თვისება, ამჯერად `output()` ფუნქციით,
რომელიც ასევე `@angular/core`-დან შემოგვაქვს.

```ts
import { Component, input, output } from "@angular/core";

@Component({
  selector: "app-child",
  templateUrl: "./child.html",
  styleUrl: "./child.css",
})
export class Child {
  message = input("");
  lengthCount = output<number>();

  onCount() {
    this.lengthCount.emit(this.message().length);
  }
}
```

`output()` არის generic ფუნქცია, რაც იმას ნიშნავს, რომ მასში ტიპი უნდა
შევფუთოთ. მარტივად რომ ვთქვათ, ტაიპსკრიპტმა იცის, რომ ეს თვისება რაღაც
მოვლენას გასცემს, თუმცა არ იცის ეს მოვლენა შედეგად რა ტიპის მნიშვნელობას გვაძლევს.
რადგან ჩვენ რიცხვობრივი მნიშვნელობის გადაცემა გვინდა, ამიტომ
ვწერთ `number` ტიპს.

`output()` აბრუნებს `OutputEmitterRef` ტიპის ობიექტს. `onCount` მეთოდში მასზე,
ანუ `lengthCount`-ზე დავუძახებთ `emit` მეთოდს,
რომელშიც მესიჯის სიგრძეს გადავცემთ არგუმენტად. როცა ღილაკზე დავაკლიკებთ, `emit`
მეთოდის საშუალებით, ასე ვთქვათ, სიგნალს გავცემთ მშობელ ელემენტს, რომ რაღაც მოვლენა მოხდა და
ეს მოვლენა შეიცავს ინფორმაციას.

მშობელ ელემენტზე ჩვენ ამ მოვლენას შეგვიძლია მოვუსმინოთ, click მოვლენის მსგავსად, ოღონდ
`lengthCount`-ზე, იმ თვისებაზე, რომელიც ჩვენ კლასში `output()`-ით შევქმენით:

```html
<app-child [message]="messages[0]" (lengthCount)="logLength($event)" />
<app-child [message]="messages[1]" (lengthCount)="logLength($event)" />
```

`$event` არის განსაკუთრებული (key) სიტყვა, რომლითაც შეგვიძლია მოვიხელთოთ ის მნიშვნელობა, რომელიც
დაემითდა, და გადავცეთ ის ფუნქციას, რომლითაც ამ ივენთს მოვიხელთებთ. ეს ფუნქცია უბრალოდ
კონსოლში დალოგავს რიცხვს:

```ts
// In App
logLength(length: number) {
  console.log(length);
}
```

ყურადღება მიაქციეთ, რომ ჩვენ length პარამეტრს ექსპლიციტურად ვუწერთ მოსალოდნელ ტიპს.
შედეგად კონსოლში უნდა დავლოგოთ თითოეულ კომპონენტში არსებული მესიჯის სიგრძე.

შევაჯამოთ რა ხდება: ღილაკზე დაჭერისას აქტიურდება `onCount` მეთოდი, რომელიც
`emit`-ით გასცემს მესიჯის სიგრძეს. ამ ივენთს მოვიხელთებთ მშობელი ელემენტიდან შვილ ელემენტზე
ივენთ ბაინდინგით `lengthCount` თვისებაზე (რომელიც `output()`-ით შევქმენით). `$event`-ით
ჩვენ დაემითებულ მნიშვნელობას ვიღებთ და ვაწვდით `logLength` მეთოდს, რომელიც ამ მნიშვნელობას
კონსოლში ლოგავს.

გაითვალისწინეთ, რომ ანგულარის მოვლენები **DOM-ში არ ამოტივტივდება** (bubble) —
მათი მოსმენა მხოლოდ პირდაპირ იმ კომპონენტზეა შესაძლებელი, რომელმაც ისინი გასცა.

## ცვლილებებზე რეაგირება

ჩვენ საშუალება გვაქვს, რომ შვილ კომპონენტში ვირეაგიროთ input-ში შემოსულ ცვლილებებზე.
ვინაიდან input სიგნალია, ამისთვის სპეციალური სიცოცხლის ციკლის ჰუკი არ გვჭირდება —
საკმარისია [სიგნალებში](/signals/) ჩაშენებული ჩვეულებრივი ხელსაწყოები.

### გამოთვლილი მნიშვნელობა — `computed`

თუ input-იდან **სხვა მნიშვნელობის გამოთვლა** გვინდა, `computed`-ს ვიყენებთ:

```ts
import { Component, computed, input, output } from "@angular/core";

@Component({
  selector: "app-child",
  templateUrl: "./child.html",
  styleUrl: "./child.css",
})
export class Child {
  message = input("");
  lengthCount = output<number>();

  messageLength = computed(() => this.message().length);
  isLongMessage = computed(() => this.messageLength() > 20);

  onCount() {
    this.lengthCount.emit(this.messageLength());
  }
}
```

`messageLength` ავტომატურად განახლდება ყოველ ჯერზე, როცა `message` შეიცვლება.
ჩვენ თვალყურის დევნა არ გვიწევს — ეს არის სიგნალების მთავარი სარგებელი.

```html
<p>{{ message() }}</p>
<p>Length: {{ messageLength() }}</p>
@if (isLongMessage()) {
  <p>This is a long message!</p>
}
```

### გვერდითი მოვლენა — `effect`

თუ ცვლილებაზე **გვერდითი მოვლენა** გვინდა (ლოგირება, `localStorage`-ში
ჩაწერა, გარე ბიბლიოთეკის გამოძახება), მაშინ `effect`-ს ვიყენებთ:

```ts
import { Component, effect, input } from "@angular/core";

export class Child {
  message = input("");

  constructor() {
    effect(() => {
      console.log("მესიჯი განახლდა: ", this.message());
    });
  }
}
```

მნიშვნელოვანი წესი: **`effect`-ში აპლიკაციის სთეითი არ უნდა შევცვალოთ.**
თუ ერთი მნიშვნელობიდან მეორეს გამოთვლა გვინდა, ეს `computed`-ის საქმეა,
და არა `effect`-ის.

### `ngOnChanges` — ძველი მიდგომა

დეკორატორებზე დაფუძნებული `@Input()`-ს სიგნალი არ არის, ამიტომ
ცვლილებებზე რეაგირება `ngOnChanges` ჰუკით ხდებოდა:

```ts
export class Child implements OnChanges {
  @Input() message: string = "";

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["message"]) {
      console.log("მესიჯი განახლდა: ", changes["message"].currentValue);
    }
  }
}
```

`ngOnChanges` დღესაც არსებობს და მოძველებულად არ ითვლება, მაგრამ
სიგნალურ input-ებთან ის თითქმის არასდროს გვჭირდება: `computed` და
`effect` უფრო ზუსტია (ვიცით *რომელი* მნიშვნელობა შეიცვალა, `SimpleChanges`
ობიექტში ძიება არ გვიწევს) და ტიპებთანაც უკეთ მუშაობს.

## შეჯამება

ამ თავში ჩვენ განვიხილეთ `input()` და `output()` ფუნქციები. `input()`-ის საშუალებით
შვილ კომპონენტს გადავცემთ მნიშვნელობას მშობელი კომპონენტიდან, ხოლო `output()`-ის
საშუალებით შვილ კომპონენტზე ვქმნით ივენთის ემითერს, რომელიც კონკრეტულ მნიშვნელობებს
აემითებს. შვილის ივენთს ჩვენ შეგვიძლია მშობელი ელემენტიდან მოვუსმინოთ და მოვიხელთოთ
დაემითებული მნიშვნელობები `$event`-ის საშუალებით.

`input()` სიგნალს ქმნის, ამიტომ მისი მნიშვნელობა ფუნქციის დაძახებით იკითხება, ხოლო
ცვლილებებზე რეაგირება `computed`-ითა და `effect`-ით ხდება.

ძველ პროექტებში ამათ ნაცვლად `@Input()` და `@Output()` დეკორატორები და
`EventEmitter` კლასი შეგხვდებათ. არსებული პროექტის ავტომატურად გადასაყვანად
არსებობს სქემატიკები:

```sh
ng generate @angular/core:signal-input-migration
ng generate @angular/core:output-migration
```
