---
title: "NgModule"
---

# NgModule

**ეს თავი ძველ მიდგომას აღწერს.** ანგულარის მე-19 ვერსიიდან ყველა
კომპონენტი, დირექტივა და ფაიფი ნაგულისხმევად
[standalone-ია](/standalone/), ხოლო აპლიკაციის კონფიგურაცია
`app.config.ts`-ში, პროვაიდერების მასივში იწერება. **ახალ პროექტში
`NgModule` არ გჭირდებათ** — CLI-ის `ng new` მოდულს საერთოდ არ ქმნის.

ეს თავი მაინც გამოსადეგია, რადგან:

- ბევრი არსებული პროექტი მოდულებზეა აშენებული და მათი კოდის წაკითხვა
  მოგიწევთ
- ზოგიერთი ძველი ბიბლიოთეკა კვლავ მოდულებს აწოდებს
- `NgModule` წაშლილი არ არის და ანგულარი მას კვლავ უჭერს მხარს

თუ ანგულარს ნულიდან სწავლობთ, ეს თავი შეგიძლიათ გამოტოვოთ და
მოგვიანებით დაუბრუნდეთ, როცა ძველ კოდს შეხვდებით.

არსებული პროექტის standalone-ზე გადასაყვანად არსებობს სქემატიკა:

```sh
ng generate @angular/core:standalone
```

---

`NgModule` კონფიგურაციას უკეთებს ანგულარის აპლიკაციას და ეხმარება სხვადასხვა ბიბლიოთეკების ორგანიზებაში.

`NgModule` არის კლასი, რომელიც მონიშნულია `@NgModule` დეკორატორით. `@NgModule` იღებს ინფორმაციას ობიექტის ტიპად, რომელიც აღწერს
თუ როგორ უნდა დააკომპილიროს კომპონენტის თიმფლეითი და როგორ მოხდეს სხვადასხვა პროცესების გაშვება `runtime` დროს. მოდულში აღიწერება: კომპონენტები,
დირექტივები, და ფაიფები. ასევე `NgModule`-ში აღიწერება სერვისები და მისი პროვაიდერებიც, რაც [`DI`](./dependency-injection) გამოყენების საშუალებას გვაძლევს.

## მოდული

მოდულები კარგი გზა არის აპლიკაციის ორგანიზებისათვის. მოდულის კონფიგურია არის შემდეგნაირი:

```ts
@NgModule({
  declarations: [
    // კომპონენტები, დირექტივები, და ფაიფები
  ],
  imports: [
    // ბიბლიოთეკები და მოდულები
  ],
  providers: [
    // სერვისები და პროვაიდერები
  ],
  bootstrap: [
    /*
      კომპონენტი, რომელსაც ანგულარი მოათავსებს index.html-ში აპლიკაციის გაშვების დროს.
      იგივე კომპონენტი აუცილებელია, ეწეროს დეკლარაციის მასივშიც.
    */
  ],
})
export class AppModule {}
```

მოდული ასრულებს შემდეგ მოქმედებებს:

- აღწერს კომპონენტებს, დირექტივებს და ფაიფებს, რაც ეკუთვნის მოდულს.
- ასაჯაროვებს სხვადასხვა კომპონენტებს, დირექტივებს და ფაიფებს, იმისათვის, რომ სხვა კომპონენტმა გამოიყენონ ისინი.
- აიმპორტებს სხვა მოდულის ფუნქციონალს.
- უზრუნველყოფბს სერვისებს აპლიკაციისთვის, რაც უნდა გამოიყენოს კომპონენტმა.

17 ვერსიამდე ანგულარის CLI მოდულებზე დაფუძვნებულ აპლიკაციას ქმნიდა. აპლიკაციის ძირეული მოდული იყო `AppModule`.
17-ს ზემოთ არსებული CLI გამოყენებით, ავტომატურად აპლიკაცია იქმნება [standalone](./standalone)-ზე. თუ გვსურს მოდულზე დაფუძვნებული აპლიკაციის შექმნა მაშინ გამოვიყენოთ შემდგომი ბრძანება:

```sh
ng new app-name --standalone=false
```

პროექტში დაგენერირებული `app.module.ts` ერთად კრავს აპლიკაციისთვის საჭირო საშენ ბლოკებს:

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

ანგულარის CLI-ის საშუალებით კომპონენტების, დირექტივებისა თუ ფაიფების შექმნისას მათი დეკლარაციები აქ დაემატება:

```ts
@NgModule({
  declarations: [AppComponent, ExampleComponent, ExamplePipe, ExampleDirective],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

ეს იმას ნიშნავს, რომ ყველა კომპონენტში ხელმისაწვდომი იქნება მისივე მოდულში დეკლარირებული ყველა სხვა საშენი ბლოკი.
დეკლარაციები, იმპორტები და პროვაიდერები ვრცელდება ყველაფერზე, რაც ამ მოდულშია კონფიგურირებული.
`providers` თვისების კონფიგურაცია, საჭიროებისამებრ, შესაძლებელია უშუალოდ კომპონენტებში, ფაიფებსა თუ დირექტივებშიც,
და მათ დეკორატორებში მიწოდებული ეს კონფიგურაცია მოდულზე უპირატესი იქნება.

გასათვალისწინებელია, რომ შეიძლება [standalone კომპონენტების შემოტანა მოდულზე დაფუძნებულ აპლიკაციაში](/standalone/creation-and-usage#დამოუკიდებელი-კომპონენტის-შეტანა-ngmodule-ში),
და პირიქით,
[მოდულების შემოტანა standalone კომპონენტებში](/standalone/creation-and-usage#ngmodule-ების-შემოტანა-დამოუკიდებელ-კომპონენტებში).

## Custom მოდული

ძირეული მოდულის გარდა, ასევე შესაძლებელი არის ცალკე მოდულების შექმნა. ცალკე მოდულის საშუალებით შესაძლებელია სხვადასხვა feature-ები ავკინძოთ ერთ მოდულში, ხოლო
სადაც მოხდება მისი დაიმპორტება, იქ დაემატება მისი ფუნქციონალი. მაგალითისთვის ავაწყოთ მოდული, რომელშიც გამოყენებული იქნება მატერიალის კომპონენტები.

პირველ რიგში CLI გამოყენებით, დავაგენერიროთ მოდული:

```sh
ng g m material
```

დაგენერირებულ ფაილში, შევიტანოთ შემდგომი მოდიფიცირება (საჭიროა ანგულარ მატერიალის დაინსტალირება).

```ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

@NgModule({
  exports: [MatFormFieldModule, MatInputModule, MatButtonToggleModule],
  imports: [CommonModule],
})
export class MaterialModule {}
```

შეგვიძლია სხვა მოდულში, დავამატოთ ჩვენს მიერ შექმნილი `MaterialModule`, რაც საშუალებას მოგვცემს, გამოვიყენოთ მასში არსებული მატერიალის მოდულები, ესენია:
`MatFormFieldModule`, `MatInputModule`, `MatButtonToggleModule`.

გამოყენებისთვის დავამატოთ `AppModule`-ში.

```ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";

import { MaterialModule } from "./material/material.module";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, MaterialModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Feature Modules

მოდულარულ აპლიკაციებში გავრცელებული პრაქტიკაა აპლიკაციის ნაწილების feature მოდულებად დაყოფა.
ეს გულისხმობს აპლიკაციის რაუთებისა და ფუნქციონალების მოდულებად დაჯგუფებას. წარმოიდგინეთ აპლიკაცია,
სადაც გვაქვს ონლაინ მაღაზიის ფუნქციონალი (მომხმარებლისთვის) და ასევე ადიმინისტრატორის ფუნქციონალი,
სადაც ადმინისტრატორები მართავენ მომხმარებლებს, პროდუქციას და ა.შ.

მაშინ ჩვენი პროექტის არქიტექტურა ასე შეიძლება გამოიყურებოდეს:

```
src/app
├── admin/
│   ├── admin.module.ts
│   ├── dashboard/
│   ├── product-manager/
│   └── user-manager/
├── app.component.css
├── app.component.html
├── app.component.spec.ts
├── app.component.ts
├── app.module.ts
├── app-routing.module.ts
└── shop/
    ├── browse/
    ├── cart/
    └── shop.module.ts
```

აქ ადმინისტრატორის ფოლდერია, ცალკე თავისი მოდულით და კომპონენტებით (`dashboard`, `product-manager`, `user-manager`),
რომლებიც დეკლარირებულია `admin.module.ts`-ში:

```ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserManagerComponent } from "./user-manager/user-manager.component";
import { ProductManagerComponent } from "./product-manager/product-manager.component";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";

const adminRoutes: Routes = [
  { path: "product-manager", component: ProductManagerComponent },
  { path: "user-manager", component: UserManagerComponent },
  { path: "", component: DashboardComponent, pathMatch: "full" },
];

@NgModule({
  declarations: [
    UserManagerComponent,
    ProductManagerComponent,
    DashboardComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(adminRoutes)],
})
export class AdminModule {}
```

აქვე შეგვიძლია რაუთების კონფიგურაციაც და მათი დარეგისტრირება `RouterModule.forChild`-ით, რადგან ესენი
ერთგვარი შვილობილი რაუთებია, რომლებსაც ძირეულ რაუთინგში დავარეგისტრირებთ და ერთი კონკრეტული რაუთის
ქვეშ მოვათავსებთ, მაგალითად `/admin`-ის ქვეშ, და შესაბამისად რაუთები გამოვა `/admin/product-manager`,
`admin/user-manager` და უბრალოდ `/admin` (რომელიც `DashBoardComponent`-ს ჩატვირთავს).

იგივე ეხება shop-ის მოდულს, სადაც `browse` და `cart` კომპონენტები გვაქვს გაერთიანებული `shop.module.ts`-ში:

```ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowseComponent } from "./browse/browse.component";
import { CartComponent } from "./cart/cart.component";
import { Routes } from "@angular/router";

const shopRoutes: Routes = [
  { path: "cart", component: CartComponent },
  { path: "", component: BrowseComponent, pathMatch: "full" },
];

@NgModule({
  declarations: [BrowseComponent, CartComponent],
  imports: [CommonModule],
})
export class ShopModule {}
```

შემდეგ ეს მოდულები, თავიანთი რაუთინგით, შეგვიძლია შევიტანოთ `AppModule`-ში.

### Lazy Loading

მოდულების "ზარმაცად" ჩატვირთვა გავრცელებული პრაქტიკაა, რათა რესურსები დავზოგოთ და
მოდულის კოდი მხოლოდ მაშინ ჩავტვირთოთ ბრაუზერში, როცა მათთვის საჭირო რაუთებზე ვიმყოფებით.
რათა ზემოთ ხსენებული მოდულები ზარმაცად ჩავტვირთოთ, ჩვენ გვჭირდება ძირეული რათუინგის კონფიგურაციაში
(`app-routing.module.ts`), მათი დაიმპორტება `loadChildren` თვისების ქვეშ:

```ts
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
  },
  {
    path: "shop",
    loadChildren: () => import("./shop/shop.module").then((m) => m.ShopModule),
  },
  { path: "", redirectTo: "shop", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

ჩვენ უშუალოდ მოდულებს ვაიმპორტებთ, რომლებიც, თუ გაიხსენებთ, შეიცავენ
`RouterModule.forChild`-ს იმპორტების სიაში. საბოლოოდ ამ რაუთების კონფიგურაცია რეგისტრირდება
`RouterModule.forRoot`-ში, და ეს ჩვენი `AppRoutingModule` შედის `AppModule`-ის იმპორტების სიაში:

```ts
import { AppRoutingModule } from "./app-routing.module";
@NgModule({
  /* ... */
  imports: [AppRoutingModule],
})
export class AppModule {}
```

ბრაუზერში დეველოპერის ხელსაწყოებში ნეთვორქის ტაბს თუ დავაკვირდებით, მოდულის კოდი იტვირთება
მათი სათანადო რაუთების მიხედვით. ხოლო feature მოდულების რაუთები კონფიგურირებულია ძირეულ
რაუთებთან მიმართებაში, ანუ გვაქვს `/admin/user-manager`, `/shop/cart` და ა.შ.

## შეჯამება

ამ თავში ვისაუბრეთ ანგულარის მოდულებზე დაფუძნებულ აპლიკაციებზე, რომელიც ჩვენი აპლიკაციის ფუნქციონალის
ორგანიზაციის ერთ-ერთ გზას წარმოადგენს. ჩვენ შეგვიძლია feature მოდულების შექმნა, სადაც აპლიკაციის ცალკეული
კომპონენტები თუ სხვა ელემენტები ერთად არის შეკრული, თავიანთი რაუთის კონფიგურაციით. ეს მათი ზარმაცად
ჩატვირთვის საშუალებას გვაძლევს, რათა მოდულლები მაშინ ჩაიტვირთოს, როცა სათანადო რაუთებზე ვიმყოფებით.
