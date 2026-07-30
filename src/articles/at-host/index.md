---
title: "HostListener"
---

# HostListener

`HostListener` არის დეკორატორი რომელიც დეკლარაციას უკეთებს DOM-ის ივენთს,
იქნება ეს ჰოსსტ ელემენტსა თუ გლობალურ window-ზე, რომელსაც გვინდა რომ მოვუსმინოთ.
ეს დეკორატორი გამოიყენება კომპონენტის კლასებში, და, კომპონენტებზე ხშირად, დირექტივებში.

შევქმნათ უბრალო დირექტივი რომელზეც `HostListener`-ს გამოვიყენებთ.

```
ng g d example
```

```ts
import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appExample]",
})
export class ExampleDirective {
  constructor() {}

  @HostListener("click") onClick() {
    console.log("click detected");
  }
}
```

`HostListener`-ში პირველ არგუმენტად ვაწვდით ივენთის სახელს, ხოლო
შემდეგ დეკლარაციას ფუკეთებთ ფუნქციას, რომელიც უნდა გააქტიურდეს
ამ ივენთის საპასუხოდ.

ამ მაგალითში, თუ დავაკლიკებთ ელემენტზე, რომელზეც `appExample` დირექტივი
იქნება, კონსოლში დავლოგავთ ტექსტს.

შესაძლებელია window-ზე არსებული მოვლენების მოსმენაც, ამისთვის `HostListener`-ში
არგუმენტს ვუწერთ პრეფიქსს `window:`. ამ მაგალითში ჩვენ `App` ში
enter ღილაკზე დაჭერას ვუსმენთ და საპასუხოდ კომპონენტის კლასში counter თვისებას
ვზრდით, რომელსაც ინტერპოლაციით გამოვსახავთ.

```ts
import { HostListener, Component } from "@angular/core";

@Component({
  selector: "app",
  template: ` <h1>
      Hello, you have pressed enter {{ counter }} number of times!
    </h1>
    Press enter key to increment the counter.`,
})
export class App {
  counter = 0;
  @HostListener("window:keydown.enter")
  handleKeyDown() {
    this.counter++;
  }
}
```

`HostListener`-ში მეორე არგუმენტად მასივში შეგვიძლია დავწეროთ ის,
თუ რა მივაწოდოთ არგუმენტად handler მეთოდმა. მათ შორის არის
`$event`, რომელიც ჩვენ event binding-ში უკვე გვინახავს.

```ts
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    console.log(`click detected on X:${event.x}, Y: ${event.y}`);
  }
```

`$event` ამ მოვლენის შესახებ შეიცავს ინფორმაციას, რომელზეც ჩვენ ახლა `onClick`
მეთოდის პარამეტრებში გვაქვს წვდომა. ჰენდლერ ფუნქციის პარამეტრში
მას უნდა მივუთითოთ სათანადო ტიპი. 'click' ივენთი არის MouseEvent-ის ტიპის.

### შეჯამება

ამ თავში ჩვენ განვიხილეთ `HostListener` დეკორატორი, რომლის საშუალებითაც
შეგვიძლია ჰოსტზე ივენეთების მოსმენა და მოხელთება. პირველ არგუმენტად
`HostListener` იღებს, ხოლო მეორე არგუმენტად ჰენდლერ ფუნქციაში გასატარებელ
არგუმენტს. ასე ჩვენ ივენთზე რეაგირება და ამ ივენთში არსებული ინფორმაციის
მოხელთებაც შეგვიძლია.
