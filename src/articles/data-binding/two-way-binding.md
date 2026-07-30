---
title: "Two Way Binding"
---

# Two Way Binding

Two way binding გულისხმობს property binding-ისა და event binding-ის კომბინაციას
კომპონენტებს შორის მონაცემების გასაზიარებლად ისე, რომ შესაძლებელი იყოს
მშობელ და შვილ კომპონენტებს შორის ერთდროულად ივენთების მოსმენა და მნიშვნელობების
განახლება.

შევქმნათ კომპონენტი, რომელიც დაგვეხმარება ფონტის ზომის შეცვლაში, დავარქვათ მას sizer.

```
ng g c sizer
```

sizer კომპონენტი მარტივი პრინციპით იმუშავებს. ის მშობელისგან მიიღებს საწყის ფონტის ზომას
(`@Input() size`),
ხოლო თვითონ, ღილაკზე დაჭერის საფუძველზე ამ ფონტის ზომას გაზრდის და ისე გადასცემს მშობელს
(`@Output() sizeChange`).

```ts
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-sizer",
  templateUrl: "./sizer.html",
  styleUrl: "./sizer.css",
})
export class Sizer {
  @Input() size!: number | string;
  @Output() sizeChange = new EventEmitter<number>();

  dec() {
    this.resize(-1);
  }
  inc() {
    this.resize(+1);
  }

  resize(delta: number) {
    // Keep size only between 40px and 8px
    this.size = Math.min(40, Math.max(8, +this.size + delta));
    this.sizeChange.emit(this.size);
  }
}
```

გვაქვს შექმნილი resize მეთოდი, რომელიც არგუმენტად delta-ს იღებს, ანუ რიცხვობრივ
მაჩვენებელს, რომლითაც ფონტის ზომა უნდა შეიცვალოს და `sizeChange`-ით დააემითოს
ახალი ზომა. ამ მეთოდს დაუძახებენ `dec` და `inc` ფუნქციები, რომლებიც + და - ღილაკებზე
იქნებიან მიბმულები ივენთ ბაინდინგით:

```html
<div>
  <button type="button" (click)="dec()" title="smaller">-</button>
  <button type="button" (click)="inc()" title="bigger">+</button>
  <span [style.font-size.px]="size">FontSize: {{size}}px</span>
</div>
```

სანიმუშო ტექსტი, რომელიც ზომას შეიცვლის ამ sizer კომპონენტშიც გვექნება (`span`).
ახლა app.html-ში შეგვიძლია განვათავსოთ sizer კომპონენტი და გამოვიყენოთ
მასზე ჩვენთვის ცნობილი ბაინდინგები:

```html
<app-sizer [size]="fontSizePx" (sizeChange)="fontSizePx = $event"></app-sizer>
<div [style.font-size.px]="fontSizePx">Resizable Text</div>
```

ამ მშობელი კომპონენტის კლასში ჩვენ გვაქვს ფროფერთი `fontSizePx`,
რომელსაც ვიყენებთ ტექსტისთვის ზომის მისანიჭებლად ქვედა `div`-ზე,
და რომელსაც ასევე გადავცემთ `app-sizer` კომპონენტს.

```ts
fontSizePx = 16;
```

ახლა ფონტის ზომა უნდა იცვლებოდეს. აპლიკაციაში შემდეგი რამ ხდება:

- თავდაპირველად, როცა აპლიკაცია იტვირთება, `App`-ში არსებული `fontSizePx`
  გადაეცემა `Sizer`-ს, რომელიც ინიციალიზაციისას სწორედ მის მნიშვნელობას შეინახავს
  `size` თვისებაში. სწორედ ამ ზომას გამოსახავს ეს კომპონენტი.
- `Sizer`-ში ღილაკზე დაჭერით გააქტიურდება `dec` ან `inc` მეთოდი, რომელიც `resize` მეთოდს
  დაუძახებს და შეცვლის ფონტის ზომას, ამასთანავე დააემითებს ამ ახალ ზომას.
- ახალ დაემითებულ ზომას `App` ივენთ ბაინდინგის საშუალებით დააფიქსირებს და შეცვლის თავის
  ფროფერთის `fontSizePx`, რათა მან ეს ახალი მნიშვნელობა მიიღოს.
- შედეგად იცვლება `App`-ის თემფლეითში არსებული ტექსტის ზომა.

ამ ბაინდინგის შესამოკლებლად ანგულარში შექმნეს შემდეგნაირი სინტაქსი:

```html
<app-sizer [(size)]="fontSizePx"></app-sizer>
<div [style.font-size.px]="fontSizePx">Resizable Text</div>
```

რაც ზუსტად იგივეს აკეთებს. ჩვენ ერთდროულად ვუსმენთ ცვლილებას და ვაწვდით კონკრეტულ მნიშვნელობას.
სწორედ ეს არის two way binding. ეს შესაძლებელია მხოლოდ იმ შემთხვევასი, თუ იმ კომპონენტში, რომელზეც
ჩვენ ბაინდინგს ვაკეთებთ `Input`-ისა და `Output` თვისებების სახელები კონკრეტული კონვენციითაა შექმნილი:
`Output` თვისება უნდა იწყებოდეს `Input` თვისების დასახელებით და ბოლოში უნდა ემატებოდეს `Change`.

```ts
@Input() size!: number | string;
@Output() sizeChange = new EventEmitter<number>();
```

two way binding-ით ჩვენ ანგულარს ერთდროულად ვეუბნებით, რომ:

- size თვისებამ `Sizer`-ში ის მნიშვნელობა უნდა მიიღოს, რაც `fontSizePx`-ს აქვს.
- `fontSizePx`-მა `App`-ში ის მნიშვნელობა უნდა მიიღოს, რასაც `sizeChange` ივენთი დააემითებს.

## შეჯამება

ამ თავში განვიხილეთ two way binding რომელიც საშუალებას გვაძლევს ერთდროულად მონაცემები გადავცეთ
შვილ კომპონენტს და ამასთანავე ეს მონაცემები შევცვალოთ შვილი კომპონენტისგან დაემითებული მნიშვნელობებით.
two way binding იშვიათად გამოიყენება, თუმცა მისი საჭიროება შედარებით უფრო ხშირად ფორმების შემთხვევაში ჩნდება.
ამისთვის ანგულარში არსებობს `ngModel` დირექტივი, რომელიც two way binding-ით გამოიყენება.
მის შესახებ ინფორმაცია ხელმისაწვდიომია
[ოფიციალურ დოკუმენტაციაში](https://angular.dev/guide/templates/two-way-binding).
