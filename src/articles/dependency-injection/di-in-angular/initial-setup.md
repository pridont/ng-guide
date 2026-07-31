---
title: "საწყისი კოდი"
---

# საწყისი კოდი

განვიხილოთ პრიმიტიული აპლიკაციის მაგალითი, რომელიც შესაძლებელია DI-ს გარეშეც
მუშაობდეს, თუმცა მისი დანიშნულების მარტივად გააზრების საშუალებას მოგვცემს.
წარმოვიდგინოთ, რომ გვერდიგვერდ გვაქვს ორი კომპონენტი: გმირების სია, სადაც
ჩამოწერილია გმირთა სახელები და გმირის დეტალები, სადაც სიიდან არჩეული გმირის
შესახებ დეტალური ინფორმაცია ჩნდება.

ეს არის გმირის ინტერფეისი, hero.ts:

```ts
export interface Hero {
  name: string;
  description: string;
}
```

ჩვენი App ასე გამოიყურება:

```ts
import { Component } from "@angular/core";
import { HeroList } from "./hero-list";
import { HeroDetails } from "./hero-details";

@Component({
  selector: "app-root",
  imports: [HeroList, HeroDetails],
  template: `
    <div class="container">
      <app-hero-list></app-hero-list>
      <app-hero-details></app-hero-details>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 600px;
        display: grid;
        grid-template-columns: 300px 300px;
        grid-auto-rows: minmax(300px, auto);
      }

      .container > * {
        border: 2px solid black;
        padding: 8px;
      }
    `,
  ],
})
export class App {}
```

აქ ყველა კომპონენტის მარკაპი, სტილები და ლოგიკა ერთ ფაილში გვაქვს მოქცეული.
ეს მხოლოდ თვალსაჩინოებისა და სიმარტივისთვისაა.
როგორც ხედავთ, ორი კომპონენტი გვაქვს გვერდი-გვერდ განთავსებული:
`app-hero-list` და `app-hero-details`. ჩვენი ამოცანაა, რომ სიიდან არჩეული გმირის
დეტალები გამოვაჩინოთ მეორე კომპონენტში.
