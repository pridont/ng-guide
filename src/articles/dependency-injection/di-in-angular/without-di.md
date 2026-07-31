---
title: "DI-ს გარეშე"
---

# DI-ს გარეშე

ამის გაკეთების ერთი ვარიანტი არის
`Input` და `Output` დეკორატორების გამოყენება, სადაც ლოგიკის ძირითად
ნაწილს App-ში შევინახავდით, და ეს ორი კომპონენტი უბრალოდ ინფორმაციას
გამოსახავდა და ივენთებს დააემითებდა. ეს კარგი მიდგომაა, როცა კომპონენტები
პრიმიტიულია: ჩვენ მძიმე ლოგიკა მშობელი კომპონენტებიდან უნდა მოვაგვაროთ,
მათ უბრალოდ ვიზუალებსა და მონაცემების განთავსებაზე უნდა იზრუნონ.

ასეთი მიდგომით კოდი შემდეგნაირი იქნებოდა:

app.ts

```ts
import { Component } from "@angular/core";
import { Hero } from "./types/hero";
import { HeroList } from "./hero-list";
import { HeroDetails } from "./hero-details";

@Component({
  selector: "app-root",
  imports: [HeroList, HeroDetails],
  template: `
    <div class="container">
      <app-hero-list
        [heroes]="heroes"
        (heroPicked)="onHeroPicked($event)"
      ></app-hero-list>
      <app-hero-details [hero]="pickedHero"></app-hero-details>
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
export class App {
  heroes: Hero[] = [
    {
      name: "Tariel",
      description:
        "Tariel is distinguished by his wild character as symbolized by his wearing the panther's skin.The qualities associated with the cat, his dedication and courage, his hatred and violence could be extreme and uncontrollable.",
    },
    {
      name: "Avtandil",
      description:
        "Avtandil, the knight and commander-in-chief of Rostevan's armies. One day, Avtandil challenges King Rostevan to a hunting competition. After three days of shooting game, they encounter a knight crying by a river.",
    },
    {
      name: "Nuradin-Pridon",
      description:
        "Nuradin-Pridon, ruler of Mulgazanzar. He initially met Tariel after he survived a battle against traitors who tried to ambush him. After sharing their stories, Nuradin-Pridon gifted Tariel his trusty Arabian steed to aid him in his journey.",
    },
  ];
  // Initially set on first hero
  pickedHero: Hero = this.heroes[0];

  onHeroPicked(heroName: string) {
    const chosenHero = this.heroes.find((hero) => hero.name === heroName);
    if (chosenHero) {
      this.pickedHero = chosenHero;
    }
  }
}
```

გმირების შესახებ ინფორმაციის შენახვა, არჩეული გმირის სტატუსი და გმირის არჩევის ლოგიკა
არის მშობელ კომპონენტში.

`HeroList` უბრალოდ იღებს განსათავსებელი გმირების სიას
და თუ რომელიმე გმირზე დავაკლიკეთ, ამ ივენთს აემითებს, რათა `App` მა
`onHeroPicked` მეთოდი გააქტიუროს და `pickedHero` შეცვალოს.

hero-list.ts

```ts
import { Component, input, output } from "@angular/core";
import { Hero } from "../types/hero";

@Component({
  selector: "app-hero-list",
  template: `
    <h2>Pick the hero</h2>
    <ul>
      @for (hero of heroes(); track hero.name) {
        <li (click)="heroPicked.emit(hero.name)">{{ hero.name }}</li>
      }
    </ul>
  `,
  styles: [
    `
      li {
        cursor: pointer;
      }
      li:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class HeroList {
  heroes = input.required<Hero[]>();
  heroPicked = output<string>();
}
```

როცა `pickedHero` იცვლება, ვინაიდან ის property binding-ით არის მიბმული
HeroDetails-ის hero თვისებაზე, მაშინ ამ უკანასკნელ კომპონენტში
განთავსებული დეტალებიც იცვლება.

hero-details.ts

```ts
import { Component, input } from "@angular/core";
import { Hero } from "../types/hero";

@Component({
  selector: "app-hero-details",
  template: `
    @if (hero(); as pickedHero) {
      <div>
        <h2>{{ pickedHero.name }}</h2>
        <p>{{ pickedHero.description }}</p>
      </div>
    }
  `,
})
export class HeroDetails {
  hero = input.required<Hero>();
}
```

და ასე, მშობელი კომპონენტი განაგებს შვილ კომპონენტებში განთავსებულ ინფორმაციას.
