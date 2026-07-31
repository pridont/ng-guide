---
title: "Queries — შვილებზე წვდომა"
---

# Queries — შვილებზე წვდომა

ზოგჯერ მშობელ კომპონენტს **უშუალოდ შვილის ინსტანციაზე** სჭირდება
წვდომა: მასზე მეთოდის დასაძახებლად, DOM ელემენტის ფოკუსირებისთვის, ან
იმისთვის, რომ გაიგოს, რამდენი შვილი აქვს საერთოდ. ამისთვის ანგულარს
**query** ფუნქციები აქვს.

query-ები ორ ჯგუფად იყოფა:

- **view queries** — ეძებს კომპონენტის **საკუთარ** თემფლეითში
- **content queries** — ეძებს იმ შიგთავსში, რომელიც კომპონენტს გარედან
  გადმოეცა (`<ng-content>`-ით)

ყველა query ფუნქცია **სიგნალს აბრუნებს**, ამიტომ მათი გამოყენება
`computed`-სა და `effect`-ში თავისუფლად შეიძლება.

## View queries

### `viewChild`

ერთი შედეგის საპოვნელად `viewChild`-ს ვიყენებთ:

```ts
import { Component, computed, viewChild } from "@angular/core";

@Component({
  selector: "app-card-header",
  template: `<ng-content />`,
})
export class CardHeader {
  text = input("");
}

@Component({
  selector: "app-card",
  imports: [CardHeader],
  template: `<app-card-header text="Visit sunny California!" />`,
})
export class Card {
  header = viewChild(CardHeader);
  headerText = computed(() => this.header()?.text());
}
```

`Card` თავის თემფლეითში ეძებს `CardHeader`-ს და შედეგს `computed`-ში
იყენებს.

თუ query-მ ვერაფერი იპოვა, მისი მნიშვნელობა `undefined`-ია. ეს შეიძლება
მოხდეს, თუ ელემენტი `@if`-ით არის დამალული — სწორედ ამიტომ ვწერთ
`this.header()?.text()`, კითხვის ნიშნით.

ანგულარი შედეგს **მუდმივად ანახლებს**: თუ ელემენტი გაჩნდა ან გაქრა,
სიგნალის მნიშვნელობაც შეიცვლება.

### `viewChildren`

რამდენიმე შედეგისთვის `viewChildren`-ია:

```ts
@Component({
  selector: "app-card",
  imports: [CardAction],
  template: `
    <app-card-action text="Save" />
    <app-card-action text="Cancel" />
  `,
})
export class Card {
  actions = viewChildren(CardAction);
  actionTexts = computed(() => this.actions().map((action) => action.text()));
}
```

`viewChildren` სიგნალს ქმნის, რომლის მნიშვნელობაც **მასივია**.

## Content queries

Content query იმ ელემენტებს ეძებს, რომლებიც კომპონენტს **გარედან**
გადმოეცა — ანუ იმ თემფლეითში, სადაც ეს კომპონენტი გამოიყენება.

```ts
@Component({
  selector: "app-menu-item",
  template: `<ng-content />`,
})
export class MenuItem {
  text = input("");
}

@Component({
  selector: "app-menu",
  template: `<ng-content />`,
})
export class Menu {
  items = contentChildren(MenuItem);
  itemTexts = computed(() => this.items().map((item) => item.text()));
}
```

გამოყენება:

```html
<app-menu>
  <app-menu-item text="Cheese" />
  <app-menu-item text="Tomato" />
</app-menu>
```

`Menu` კომპონენტმა თავისი შვილების შესახებ იცის, თუმცა ისინი მისმა
მშობელმა განათავსა. ეს სწორედ ის შემთხვევაა, როცა `input()` არ გამოგვადგება.

ასეთი შემთხვევისთვის `contentChild` არსებობს, რომელიც ზუსტად `viewChild`-ივით გამოიყენება.

**მნიშვნელოვანი ნაგულისხმევი ქცევა:** `contentChildren` მხოლოდ **პირდაპირ**
შვილებს პოულობს და უფრო ღრმად არ ჩადის. თუ ღრმა ძებნა გვჭირდება:

```ts
items = contentChildren(MenuItem, { descendants: true });
```

## Query-ები კომპონენტის საზღვარს არ კვეთენ

ეს ორივე ტიპის query-ზე ვრცელდება: **query-ს სხვა კომპონენტის შიგნით
ჩახედვა არ შეუძლია.** `viewChild` მხოლოდ საკუთარი თემფლეითის ელემენტებს
ხედავს, ხოლო `contentChild` — მხოლოდ იმ თემფლეითის, სადაც კომპონენტი
გამოიყენება.

ეს განზრახ არის: სხვა შემთხვევაში კომპონენტები ერთმანეთის შიდა აგებულებაზე
გახდებოდნენ დამოკიდებული და მათი ცალკე შეცვლა შეუძლებელი იქნებოდა.

## სავალდებულო query

თუ დარწმუნებული ვართ, რომ ელემენტი ყოველთვის იარსებებს, `undefined`-ის
შემოწმება ზედმეტი ხდება. ამისთვის `required` ვარიანტია:

```ts
export class Card {
  header = viewChild.required(CardHeader);
  body = contentChild.required(CardBody);
}
```

ახლა `this.header()` პირდაპირ `CardHeader`-ს აბრუნებს, `undefined`-ის
გარეშე. თუ ელემენტი ვერ მოიძებნა, ანგულარი ერორს ამოაგდებს.

## რის მიხედვით ვეძებთ — locator

query-ის პირველ არგუმენტს **locator** ჰქვია. უმეტესად ეს კომპონენტის ან
დირექტივის კლასია, როგორც ზემოთ ვნახეთ.

ალტერნატიულად, თემფლეითის ცვლადის სახელიც შეიძლება, რომელსაც სტრინგის ფორმით ვწერთ:

```ts
@Component({
  template: `
    <button #save>Save</button>
    <button #cancel>Cancel</button>
  `,
})
export class ActionBar {
  saveButton = viewChild<ElementRef<HTMLButtonElement>>("save");

  focusSave() {
    this.saveButton()?.nativeElement.focus();
  }
}
```

ეს არის ტიპური გზა DOM ელემენტზე პირდაპირი წვდომისთვის. `ElementRef`-ის
generic პარამეტრით ვაზუსტებთ, რომ `nativeElement` არის `HTMLButtonElement` —
სხვა შემთხვევაში ის `any` იქნებოდა.

თუ ერთი და იგივე ცვლადი რამდენიმე ელემენტზეა, query პირველს დააბრუნებს.

**CSS სელექტორები locator-ად არ მუშაობს.**

## `read` — სხვა მნიშვნელობის ამოღება

ნაგულისხმევად locator ორ რამეს განსაზღვრავს: _რომელ_ ელემენტს ვეძებთ და
_რას_ ვიღებთ მისგან. `read` ოფციით მეორე ნაწილის შეცვლა შეგვიძლია:

```ts
export class Expando {
  toggle = contentChild(ExpandoContent, { read: TemplateRef });
}
```

აქ ვეძებთ ელემენტს `ExpandoContent` დირექტივით, მაგრამ თვითონ დირექტივის
ნაცვლად მისი `TemplateRef` გვინდა. ყველაზე ხშირად `read` სწორედ
`ElementRef`-ისა და `TemplateRef`-ისთვის გამოიყენება.

## ძველი მიდგომა — `@ViewChild` დეკორატორები

ძველ კოდში query-ები დეკორატორებით იწერებოდა:

```ts
export class Card {
  @ViewChild(CardHeader) header?: CardHeader;
  @ViewChildren(CardAction) actions?: QueryList<CardAction>;
}
```

განსხვავება მხოლოდ სინტაქსში არ არის:

- დეკორატორული query-ები **სიცოცხლის ციკლის კონკრეტულ მომენტამდე**
  `undefined` იყო (`ngAfterViewInit`-მდე), ამიტომ მათი გამოყენება
  სიფრთხილეს მოითხოვდა
- `QueryList` ცალკე გასაცნობი API იყო (`.changes`, `.toArray()` და ა.შ),
  სიგნალი კი უბრალოდ მასივს აბრუნებს
- სიგნალურ query-ს `computed`-სა და `effect`-ში პირდაპირ ვიყენებთ

არსებული პროექტის ავტომატურად გადასაყვანად არსებობს სქემატიკა:

```sh
ng generate @angular/core:signal-queries-migration
```

## შეჯამება

- `viewChild` / `viewChildren` — კომპონენტის საკუთარ თემფლეითში ძებნა
- `contentChild` / `contentChildren` — გარედან გადმოცემულ შიგთავსში ძებნა
- ყველა მათგანი **სიგნალს აბრუნებს** და მუდმივად ახლდება
- `.required` ვარიანტი `undefined`-ს ტიპიდან შლის
- locator შეიძლება იყოს კლასი ან თემფლეითის ცვლადის სახელი
- query-ები კომპონენტის საზღვარს არ კვეთენ

გახსოვდეთ, რომ query უკიდურესი საშუალებაა. თუ ამოცანა `input()`-ითა და
`output()`-ით იხსნება, ისინი უნდა ვამჯობინოთ. Query კომპონენტებს შორის
კავშირს გაცილებით სუსტს ხდის.
