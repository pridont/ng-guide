---
title: "შექმნა და გამოყენება"
---

# შექმნა და გამოყენება

დღეს კომპონენტები, დირექტივები და ფაიფები ნაგულისხმევად standalone-ია —
არაფრის დამატება არ გვჭირდება:

```ts
@Component({
  selector: "app-image-grid",
  templateUrl: "./image-grid.html",
})
export class ImageGrid {
  // component logic
}
```

**ისტორიული შენიშვნა:** მე-14 ვერსიიდან მე-19 ვერსიამდე ამისთვის
დეკორატორში `standalone: true` უნდა ჩაგვეწერა. მე-19-დან ეს ნაგულისხმევი
მნიშვნელობაა. ძველ კოდში `standalone: true` მაინც ბევრგან შეგხვდებათ —
ის უვნებელია, უბრალოდ ზედმეტია.

`standalone: false` კი დღესაც აზრიან რამეს ნიშნავს: ის ეუბნება ანგულარს,
რომ ეს კომპონენტი [`NgModule`-ის](/ng-modules/) ნაწილია.

## კომპონენტების გამოყენება ერთმანეთში

თუ ამ კომპონენტის სადმე გამოყენება დაგვჭირდება, მას არ ვარეგისტრირებთ `NgModule`-ში,
არამედ პირდაპირ ვაიმპორტებთ იმ კომპონენტში, რომელშიც ის დაგვჭირდება:

```ts
import { Component } from "@angular/core";
import { ImageGrid } from "./image-grid";

@Component({
  selector: "app-photo-gallery",
  imports: [ImageGrid],
  template: ` ... <app-image-grid [images]="imageList" /> `,
})
export class PhotoGallery {
  // component logic
}
```

`imports` ველში ასევე შეიძლება ფაიფებისა და დირექტივების შემოტანაც.

სწორედ ეს არის standalone-ის მთავარი აზრი: **კომპონენტი თვითონ აცხადებს,
რა სჭირდება**. ცალკე ფაილში წასვლა და მოდულის დეკლარაციების სიის რედაქტირება
აღარ არის საჭირო.

## NgModule-ების შემოტანა კომპონენტებში

თუ ჩვენ აპლიკაციაში გვჭირდება ფუნქციონალი, რომელიც standalone არ არის და
მოდულებშია შეკრული (მაგალითად ძველი ბიბლიოთეკა), მაშინ შეგვიძლია ამ
მოდულის კომპონენტში პირდაპირ შემოტანა `imports` მასივში:

```ts
@Component({
  selector: "app-photo-gallery",
  // an existing module is imported directly into a standalone component
  imports: [MatButtonModule],
  template: `
    ...
    <button mat-button>Next Page</button>
  `,
})
export class PhotoGallery {
  // logic
}
```

ასე `MatButtonModule`-ში არსებული ყველა დაექსპორტებული კომპონენტი, ფაიფი თუ დირექტივი
ხელმისაწვდომია `PhotoGallery`-ში.

## კომპონენტის შეტანა NgModule-ში

ანალოგიურად, შესაძლებელია standalone კომპონენტების შეტანა NgModule-ზე დაფუძნებულ
კონტექსტშიც. ეს უზრუნველყოფს შესაძლებლობას, რომ ძველი აპლიკაციები ეტაპობრივად და
მარტივად გადავიყვანოთ NgModule სისტემიდან standalone სისტემაზე.

```ts
@NgModule({
  declarations: [Album],
  exports: [Album],
  imports: [PhotoGallery],
})
export class AlbumModule {}
```

`PhotoGallery` standalone-ია, მაგრამ მისი დაიმპორტება ძველებური მეთოდითაც
შეიძლება — მოდულის `imports` მასივში.

ასერომ, standalone კომპონენტები არ მოდიან კონფლიქტში ანგულარის ძველ
მოდულებთან. რაღაც თვალსაზრისით, ახლა თითოეული კომპონენტი არის თვითკმარი მოდული.

## Bootstrapping

ასეთი სისტემით `main.ts`-ში bootstrap განსხვავებულად ხდება. იმის მაგივრად, რომ ეს
მოხდეს მთლიან მოდულზე, გამოიყენება ფუნქცია `bootstrapApplication` რომელიც აპლიკაციის
მთავარ კომპონენტს იღებს:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";

bootstrapApplication(App);
```

CLI-ით შექმნილ პროექტში მეორე არგუმენტად კონფიგურაცია გადაეცემა, რომელიც
ცალკე `app.config.ts` ფაილშია:

```ts
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

კონფიგურაციის `providers` მასივში DI-ის კონფიგურაციას ვწერთ:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: BACKEND_URL,
      useValue: "https://photoapp.looknongmodules.com/api",
    },
    // ...
  ],
};
```

აქვე შესაძლებელია ისეთი ძველი მოდულების შემოტანა, რომლებიც `forRoot`
ფუნქციაზე დაძახებას საჭიროებენ. ამისთვის `importProvidersFrom` გამოიყენება:

```ts
import { importProvidersFrom } from "@angular/core";
import { LibraryModule } from "ngmodule-based-library";

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(LibraryModule.forRoot())],
};
```

`importProvidersFrom` ერთგვარი ხიდია ძველ, მოდულებზე დაფუძნებულ
ბიბლიოთეკებთან. თუ ბიბლიოთეკას თანამედროვე `provideXyz()` ფუნქცია აქვს,
ყოველთვის ის უნდა ვირჩიოთ.
