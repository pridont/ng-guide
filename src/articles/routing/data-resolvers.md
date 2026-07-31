---
title: "Data Resolvers"
---

# Data Resolvers

[Route Params-ის თავში](./dynamic-routes/route-params.html) მონაცემებს
კომპონენტში ვიღებდით: ჯერ გვერდი იხსნებოდა, შემდეგ იწყებოდა ჩამოტვირთვა,
და მომხმარებელი ცარიელ ეკრანს ან სპინერს უყურებდა.

**Resolver** ამ თანმიმდევრობას ცვლის: მონაცემები **ნავიგაციამდე**
ჩამოიტვირთება, და კომპონენტი მაშინვე სრული მონაცემებით იხსნება.

## რატომ გამოგვადგება

- **ცარიელი მდგომარეობა არ არსებობს** — კომპონენტი მონაცემებს დაბადებისთანავე იღებს
- **სპინერი აღარ გვჭირდება** მთავარი მონაცემისთვის
- **ერორის დამუშავება ნავიგაციამდე** — თუ პროდუქტი არ არსებობს, გვერდზე
  საერთოდ არ გადავალთ
- **SSR-ისთვის მნიშვნელოვანია** — სერვერზე დარენდერებული HTML უკვე
  შეიცავს მონაცემებს

## Resolver-ის შექმნა

Resolver არის ჩვეულებრივი ფუნქცია `ResolveFn` ტიპის. მას იგივე პარამეტრები
აქვს, რაც [გარდს](/authentication/can-activate.html): `ActivatedRouteSnapshot`
და `RouterStateSnapshot`.

`product-resolver.ts`:

```ts
import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from "@angular/router";
import { Product } from "./product.model";
import { ProductsService } from "./products-service";

export const productResolver: ResolveFn<Product | undefined> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const productsService = inject(ProductsService);
  const id = Number(route.paramMap.get("id"));

  return productsService.getProductById(id);
};
```

Resolver injection context-ში ეშვება, ამიტომ `inject()` მასში თავისუფლად
მუშაობს.

Resolver-ს შეუძლია დააბრუნოს მნიშვნელობა პირდაპირ, `Promise` ან
`Observable` — ანგულარი სამივეს ელოდება.

## როუთის კონფიგურაცია

Resolver-ს როუთის `resolve` ობიექტში ვამატებთ:

```ts
import { Routes } from "@angular/router";
import { ProductDetails } from "./product-details/product-details";
import { productResolver } from "./product-resolver";

export const routes: Routes = [
  {
    path: "products/:id",
    component: ProductDetails,
    resolve: {
      product: productResolver,
    },
  },
];
```

`resolve`-ის key (`product`) არის ის სახელი, რომლითაც კომპონენტი ამ
მონაცემს მიიღებს. ერთ როუთზე რამდენიმე resolver შეიძლება:

```ts
resolve: {
  product: productResolver,
  reviews: reviewsResolver,
}
```

ისინი **პარალელურად** გაეშვება, ხოლო ნავიგაცია მოხდება მაშინ, როცა
ყველა დასრულდება.

## მონაცემების მიღება კომპონენტში

ორი გზა არსებობს.

### `withComponentInputBinding` — რეკომენდირებული

თუ როუტერს `withComponentInputBinding()`-ით დავაკონფიგურირებთ, resolver-ის
შედეგი პირდაპირ კომპონენტის input-ად მოვა:

```ts
import { provideRouter, withComponentInputBinding } from "@angular/router";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
```

```ts
import { Component, input } from "@angular/core";
import { Product } from "../product.model";

@Component({
  selector: "app-product-details",
  template: `
    <h1>{{ product().name }}</h1>
    <p>{{ product().description }}</p>
    <h3>{{ product().price | currency }}</h3>
  `,
})
export class ProductDetails {
  product = input.required<Product>();
}
```

მთელი კომპონენტი ერთ ხაზამდე დავიდა. არც `ActivatedRoute`, არც
`subscribe`, არც `@if (product)`-ის შემოწმება — `input.required` გვაძლევს
გარანტიას, რომ მონაცემი არსებობს.

**ყურადღება:** input-ის სახელი უნდა ემთხვეოდეს `resolve`-ის key-ს.

`withComponentInputBinding()` ასევე [route params-ს](./dynamic-routes/route-params.html)
და [query params-ს](./dynamic-routes/query-params.html) input-ებად აქცევს —
ანუ `:id` პარამეტრს `id = input.required<string>()`-ით მივიღებთ.

### `ActivatedRoute`-იდან

თუ `withComponentInputBinding()` არ გვინდა, მონაცემი `ActivatedRoute`-ის
`data` სტრიმშია:

```ts
import { Component, computed, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { Product } from "../product.model";

@Component({
  selector: "app-product-details",
  template: `<h1>{{ product()?.name }}</h1>`,
})
export class ProductDetails {
  private route = inject(ActivatedRoute);

  private data = toSignal(this.route.data);
  product = computed(() => this.data()?.["product"] as Product);
}
```

აქ [`toSignal`](/signals/)-ს ვიყენებთ, რომ observable სიგნალად ვაქციოთ.
ტიპი ხელით უნდა მივუთითოთ (`as Product`), რაც პირველ მიდგომასთან
შედარებით ნაკლებად უსაფრთხოა.

## ერორების დამუშავება

თუ resolver ერორს ამოაგდებს, ნავიგაცია **ჩავარდება** და მომხმარებელი
ძველ გვერდზე დარჩება, ხოლო კონსოლში `NavigationError` გამოჩნდება. ეს
ცუდი გამოცდილებაა, ამიტომ ერორები უნდა დავამუშაოთ.

უმარტივესი გზაა თვითონ resolver-ში:

```ts
export const productResolver: ResolveFn<Product | null> = (route) => {
  const productsService = inject(ProductsService);
  const router = inject(Router);
  const id = Number(route.paramMap.get("id"));

  return productsService.getProductById(id).pipe(
    catchError(() => {
      router.navigate(["/not-found"]);
      return of(null);
    }),
  );
};
```

ცენტრალიზებული ვარიანტისთვის `withNavigationErrorHandler` არსებობს, სადაც
ყველა ნავიგაციის ერორი ერთ ადგილას მუშავდება:

```ts
provideRouter(
  routes,
  withNavigationErrorHandler((error) => {
    inject(Router).navigate(["/error"]);
  }),
);
```

## როდის _არ_ გამოვიყენოთ

Resolver ნავიგაციას **აჩერებს**, სანამ მონაცემი არ ჩამოვა. ეს ერთდროულად
მისი უპირატესობაცაა და ნაკლიც: თუ მოთხოვნა ნელია, მომხმარებელი ისე
დაელოდება, რომ არაფერი ჩანს — ღილაკზე დააჭირა და "არაფერი მოხდა".

ამიტომ:

- **მთავარი მონაცემისთვის**, რომლის გარეშეც გვერდს აზრი არ აქვს →
  resolver კარგი არჩევანია
- **მეორეხარისხოვანი მონაცემისთვის** (კომენტარები, რეკომენდაციები,
  სტატისტიკა) → სჯობს გვერდი გაიხსნას და მონაცემი [`httpResource`-ით](/http/)
  ჩამოვიდეს, თავისი `isLoading()` მდგომარეობით

კარგი წესია: თუ resolver-ის მოთხოვნა 200–300 მილიწამზე მეტს გრძელდება,
ჯობია მისი გვერდში გადატანა და ჩატვირთვის მდგომარეობის ჩვენება.
