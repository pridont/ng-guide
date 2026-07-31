---
title: "Host ელემენტი"
---

# Host ელემენტი

ანგულარი კომპონენტის ინსტანციას ქმნის ყოველ იმ HTML ელემენტზე, რომელიც
კომპონენტის სელექტორს ემთხვევა. ეს ელემენტი არის კომპონენტის **host ელემენტი**,
ხოლო თემფლეითის შიგთავსი მის შიგნით რენდერდება.

```ts
@Component({
  selector: "app-profile-photo",
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
})
export class ProfilePhoto {}
```

```html
<!-- გამოყენება -->
<h3>Your profile photo</h3>
<app-profile-photo />
```

```html
<!-- დარენდერებული DOM -->
<h3>Your profile photo</h3>
<app-profile-photo>
  <img src="profile-photo.jpg" alt="Your profile photo" />
</app-profile-photo>
```

ამ მაგალითში `<app-profile-photo>` არის `ProfilePhoto` კომპონენტის host ელემენტი.

დირექტივების შემთხვევაშიც იგივე პრინციპი მოქმედებს: host ელემენტი არის ის
ელემენტი, რომელზეც დირექტივა დავდეთ.

## `host` თვისება

კომპონენტს და დირექტივას შეუძლია საკუთარ host ელემენტზე მიაბას თვისებები,
ატრიბუტები, სტილები, კლასები და ივენთები. ეს ზუსტად ისე მუშაობს, როგორც
თემფლეითის შიგნით არსებულ ელემენტებზე ბაინდინგი, უბრალოდ კოდი `@Component`
(ან `@Directive`) დეკორატორის `host` თვისებაში იწერება:

```ts
@Component({
  selector: "app-custom-slider",
  host: {
    role: "slider",
    "[attr.aria-valuenow]": "value()",
    "[class.active]": "isActive()",
    "[style.background]": "hasError() ? 'red' : 'green'",
    "[tabIndex]": "disabled() ? -1 : 0",
    "(keydown)": "updateValue($event)",
  },
  /* ... */
})
export class CustomSlider {
  value = signal(0);
  disabled = signal(false);
  isActive = signal(false);
  hasError = signal(false);

  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

`host` ობიექტის key-ები იმავე სინტაქსს იყენებს, რომელიც თემფლეითში უკვე ვნახეთ:

- `role: "slider"` — სტატიკური ატრიბუტი
- `"[attr.aria-valuenow]"` — ატრიბუტის ბაინდინგი
- `"[class.active]"` — კლასის ბაინდინგი
- `"[style.background]"` — სტილის ბაინდინგი
- `"[tabIndex]"` — თვისების (property) ბაინდინგი
- `"(keydown)"` — ივენთის ბაინდინგი

ობიექტის მნიშვნელობა არის **ექსფრეშენი სტრინგის სახით**, რომელიც კომპონენტის
კლასის კონტექსტში შესრულდება — ზუსტად ისე, როგორც თემფლეითში.

## ივენთების მოსმენა

ყველაზე ხშირად `host` სწორედ ივენთების მოსმენისთვის დაგვჭირდება.
შევქმნათ უბრალო დირექტივი:

```
ng g d example
```

```ts
import { Directive } from "@angular/core";

@Directive({
  selector: "[appExample]",
  host: {
    "(click)": "onClick()",
  },
})
export class Example {
  onClick() {
    console.log("click detected");
  }
}
```

თუ დავაკლიკებთ ელემენტზე, რომელზეც `appExample` დირექტივა იქნება,
კონსოლში ტექსტს დავლოგავთ.

ივენთის ობიექტის მოხელთება `$event`-ით ხდება, ზუსტად როგორც თემფლეითში:

```ts
@Directive({
  selector: "[appExample]",
  host: {
    "(click)": "onClick($event)",
  },
})
export class Example {
  onClick(event: MouseEvent) {
    console.log(`click detected on X:${event.x}, Y: ${event.y}`);
  }
}
```

ჰენდლერის პარამეტრს სათანადო ტიპი უნდა მივუთითოთ — `click` ივენთი
`MouseEvent` ტიპისაა.

### გლობალური ივენთები

შესაძლებელია `document`-ზე, `window`-ზე და `body`-ზე არსებული ივენთების
მოსმენაც. ამისთვის ივენთის სახელს პრეფიქსს ვუწერთ: `document:`, `window:`
ან `body:`.

ამ მაგალითში `App`-ში enter ღილაკზე დაჭერას ვუსმენთ და საპასუხოდ
სიგნალის მნიშვნელობას ვზრდით:

```ts
import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  host: {
    "(window:keydown.enter)": "handleKeyDown()",
  },
  template: `
    <h1>Hello, you have pressed enter {{ counter() }} number of times!</h1>
    Press enter key to increment the counter.
  `,
})
export class App {
  counter = signal(0);

  handleKeyDown() {
    this.counter.update((value) => value + 1);
  }
}
```

გაითვალისწინეთ, რომ გლობალურ ივენთებს ანგულარი ავტომატურად აშორებს
კომპონენტის განადგურებისას — ჩვენით `removeEventListener`-ის დაძახება
არ გვჭირდება.

## ბაინდინგების კონფლიქტი

როცა კომპონენტს თემფლეითში ვათავსებთ, მასზე ბაინდინგების დამატება
შეგვიძლია. კომპონენტს კი შეიძლება იმავე თვისებაზე საკუთარი host
ბაინდინგი ჰქონდეს:

```ts
@Component({
  selector: "app-profile-photo",
  host: {
    role: "presentation",
    "[id]": "id",
  },
})
export class ProfilePhoto {
  /* ... */
}
```

```html
<app-profile-photo role="group" [id]="otherId" />
```

რომელი მნიშვნელობა გაიმარჯვებს:

- ორივე სტატიკურია: იმარჯვებს ინსტანციაზე (თემფლეითში) მიწერილი
- ერთი სტატიკურია, მეორე დინამიური: იმარჯვებს დინამიური
- ორივე დინამიურია: იმარჯვებს კომპონენტის host ბაინდინგი

## `@HostBinding` და `@HostListener` — ძველი მიდგომა

ანგულარის ძველ ვერსიებში host ელემენტთან ორი დეკორატორით მუშაობდნენ:
`@HostBinding` და `@HostListener`.

```ts
export class CustomSlider {
  @HostBinding("attr.aria-valuenow")
  value: number = 0;

  @HostBinding("tabIndex")
  get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  @HostListener("keydown", ["$event"])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

**ეს დეკორატორები ახალ კოდში არ უნდა გამოვიყენოთ.** ანგულარის ოფიციალური
დოკუმენტაცია პირდაპირ ამბობს, რომ ისინი მხოლოდ უკანა თავსებადობისთვის
არსებობს. `host` თვისებას რამდენიმე უპირატესობა აქვს:

- ყველა host ბაინდინგი ერთ ადგილას, დეკორატორის კონფიგურაციაშია, და არა
  კლასის სხვადასხვა წევრზე მიმოფანტული
- სინტაქსი იგივეა, რაც თემფლეითში — ცალკე დასამახსოვრებელი არაფერია
- მემკვიდრეობის დროს ნაკლებ გაუგებრობას ქმნის

თუ ძველ პროექტში ამ დეკორატორებს შეხვდებით, მსგავსება მარტივი შესამჩნევია:

```ts
// ძველი
@HostListener("click", ["$event"]) onClick(event: MouseEvent) {}
@HostBinding("class.active") isActive = false;

// ახალი
host: {
  "(click)": "onClick($event)",
  "[class.active]": "isActive",
}
```

## შეჯამება

ამ თავში ჩვენ განვიხილეთ host ელემენტი — ის ელემენტი, რომელზეც კომპონენტი
ან დირექტივა "ჯდება". `host` თვისებით შეგვიძლია ამ ელემენტზე ატრიბუტების,
კლასების, სტილების, თვისებების მიბმა და ივენთების მოსმენა, თემფლეითის
იდენტური სინტაქსით. `$event`-ით ივენთის შესახებ ინფორმაციასაც მოვიხელთებთ,
ხოლო `window:`, `document:` და `body:` პრეფიქსებით გლობალურ ივენთებსაც
მოვუსმენთ. ძველი `@HostBinding`/`@HostListener` დეკორატორები მხოლოდ
უკანა თავსებადობისთვის არსებობს.

ამით დატა ბაინდინგს ვასრულებთ. შემდეგ [Control Flow-ს](/control-flow/)
განვიხილავთ — თუ როგორ ვმართავთ თემფლეითში პირობებსა და ციკლებს.
