---
title: "Route Params"
---

# Route Params

რაუთის რაღაც ნაწილები ხშირად დინამიკურია. მაგალითად შეიძლება
მისამართი შეიცავდეს პროდუქტის აიდის, რომლის საფუძველზეც
აპლიკაციამ უნდა სათანადო პროდუქტის დეტალები გამოსახოს.
ამ მაგალითში სწორედ ასეთ სცენარს განვიხილავთ.

წინასწარ გვაქვს გამზადებული აპლიკაცია როუთინგით.
app.html-ში გვაქვს `router-outlet`.

`app.routes.ts`-ში გვაქვს ასეთი კონფიგურაცია:

```ts
import { Routes } from "@angular/router";
import { ProductDetails } from "./product-details/product-details";
import { Products } from "./products/products";

export const routes: Routes = [
  { path: "products", component: Products },
  { path: "products/:id", component: ProductDetails },
  { path: "", redirectTo: "products", pathMatch: "full" },
];
```

ეს ორი გვერდი დანიშნულებით განსხვავდება. პირველი გვერდი შეიცავს
პროდუქტების სიას, ხოლო მეორე გვერდი ერთი კონკრეტული პროდუქტის
დეტალებს. თუ რომელ პროდუქტს გამოსახავს, განსაზღვრული იქნება
`id`-ის მიხედვით. მის `path` თვისებაში სწორედ ამიტომ გვიწერია
`:id` ეს მიუთითებს დინამიკურ პარამეტრზე. მაგალითად ჩვენ უნდა შევძლოთ
`products/123` გვერდზე გადასვლა და იქ იმ პროდუქტის ნახვა, რომლის
აიდიც არის `123`.

პროდუქტის მოდელი ასე გამოიყურება:

product.model.ts

```ts
export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}
```

პროდუქტს უნდა ჰქონდეს აიდი, სახელი, აღწერა, სურათი და ფასი.
ასეთი ტიპის პროდუქტების სია და მათი აიდის მიხედვით მოპოვების
ლოგიკა გვაქვს `products.service.ts`-ში:

```ts
import { Injectable } from "@angular/core";
import { Product } from "./product.model";

@Injectable({
  providedIn: "root",
})
export class ProductsService {
  private products: Product[] = [
    {
      id: 0,
      name: "Lenovo ThinkPad T14",
      price: 899,
      description:
        'Gen 2 14" FHD (Intel 4-Core i5-1135G7, 16GB RAM, 512GB SSD, UHD Graphics) IPS Business Laptop, Backlit, Fingerprint, 2 x Thunderbolt 4, Webcam, 3-Year Warranty, Windows 11 Pro ',
      image: "https://example.com",
    },
    {
      id: 1,
      name: "Dell XPS 13 9310",
      price: 1200,
      description:
        "Touchscreen Laptop - 13.4-inch UHD+ Display, Thin and Light, Intel Core i5-1135G7, 8GB LPDDR4x RAM, 512GB SSD, Intel Iris Xe, Killer Wi-Fi 6 with Dell Service, Win 11 Home - Silver ",
      image: "https://example.com",
    },
    {
      id: 2,
      name: 'HP Envy 17.3"',
      price: 1246,
      description:
        "FHD Touchscreen Laptop, Intel Core i7-1165G7, 64GB RAM, 2TB SSD, Backlit Keyboard, Intel Iris Xe Graphics, Fingerprint Reader, Webcam, Windows 11 Pro, Silver, 32GB USB Card ",
      image: "https://example.com",
    },
  ];

  getAllProducts() {
    return this.products;
  }

  getProductById(id: number) {
    return this.products.find((product) => product.id === id);
  }
}
```

ჩვენ აქ ვინახავთ პროდუქტების მასივს, რომლებსაც აქვთ უნიკალური აიდი.
ჩვენ საშუალება გვაქვს რომ ყველა პროდუქტი ერთიანად ავიღოთ, ან
მხოლოდ ერთი პროდუქტი აიდის მიხედვით.

ამ სერვისს იყენებს ჩვენი ორი კომპონენტი.
Products უბრალოდ იღებს ამ პროდუქტების მასივს და
თემფლეითში განათავსებს:

```ts
import { Component, inject } from "@angular/core";
import { ProductsService } from "../products.service";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-products",
  imports: [RouterLink],
  templateUrl: "./products.html",
  styleUrl: "./products.css",
})
export class Products {
  productsService = inject(ProductsService);
}
```

```html
<div class="container">
  <ul>
    @for (product of productsService.getAllProducts(); track product.id) {
      <li class="product">
        <h3>{{ product.name }}</h3>
        <img [src]="product.image" [alt]="product.name" />
        <p>{{ product.price | currency }}</p>
        <a routerLink="/products/{{ product.id }}">Details</a>
      </li>
    }
  </ul>
</div>
```

ჩვენ უბრალოდ `@for` ბლოკით განვათავსებთ სერვისიდან აღებულ
პროდუქტებს და ასევე მათთვის ვქმნით სანავიგაციო ლინკებს `routerLink`-ით
(კომპონენტში საჭიროა `RouterLink` დირექტივის დაიმპორტება).
თითოეული პროდუქტის ლინკს ექნება ექნება თავისი აიდი, path-ის იმ ადგილას,
სადაც როუთის კონფიგურაციაში `:id` გვიწერია.

პროდუქტის ლინკზე დაჭერა გადაგვიყვანს `products/:id` მისამართზე, მაგრამ
პროდუქტები ჯერ არ გამოჩნდება. როგორმე `ProductDetails` კომპონენტში
ჩვენ უნდა ჩავწვდეთ როუთის პარამეტრებს და ამის მიხედვით მოვიძიოთ
კონკრეტული პროდუქტი.

```ts
import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Product } from "../product.model";
import { ProductsService } from "../products.service";

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.html",
  styleUrl: "./product-details.css",
})
export class ProductDetails {
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);

  product: Product | null = null;

  constructor() {
    this.route.params.subscribe((params) => {
      const product = this.productsService.getProductById(+params["id"]);
      if (product) {
        this.product = product;
      }
    });
  }
}
```

ჩვენ პროდუქტს შევინახავთ `product` ცვლადში.
`ProductsService`-ის გარდა ვაინჯექთებთ `ActivatedRoute`-ს, სწორედ მისი დახმარებით
ვიღებთ ინფორმაციას აქტიურ როუთზე. მონაცემების აღების ლოგიკას კონსტრუქტორში
აღვწერთ — იქ ჩაწერილი ლოგიკა აქტიურდება კომპონენტის ინიციალიზაციისას.

ჩვენ გვაინტერესებს `params` თვისება, რომელიც აბრუნებს observable-ს, შესაბამისად
ჩვენ უნდა დავასუბსქრაიბოთ მასზე. ქოლბექში ვიღებთ პარამეტრებს. ავიღოთ
პარამეტრებიდან `id` თვისება და მივაწოდოთ ის არგუმენტად `productService.getProductById`-ს.
`params`-ს წინ ვუწერთ `+`-ს, რადგან შედეგი ყოვეთვის სტრინგია, თუმცა ჩვენ `getProductById`
მეთოდში რიცხვი გვჭირდება, ასე მას რიცხვად გარდავქმნით. ყოველი პარამეტრის ცვლილება
observable-ში ახალ მნიშვნელობას გასცემს, რომლის საპასუხოდაც ჩვენ ახალ პროდუქტს ავითებთ.
პროდუქტის არსებობის შემთხვევაში ჩვენ მას კლასის თვისებაში ვინახავთ და თემფლეითში გამოვსახავთ:

```html
<div class="container">
  <a routerLink="/products">Back to products</a>
  @if (product) {
    <div>
      <h1>{{ product.name }}</h1>
      <img [src]="product.image" [alt]="product.name" />
      <h3>{{ product.price | currency }}</h3>
      <p>{{ product.description }}</p>
    </div>
  } @else {
    <div>
      <h1>Error, product not found.</h1>
    </div>
  }
</div>
```

ჩვენ პროდუქტს მაშინ ვაჩენთ, თუკი ის არსებობს, სხვა შემთხვევაში გამოვსახავთ
ერორის მესიჯს.

ასე აპლიკაცია ხელმძღვანელობს როუთის პარამეტრებით. აქვე რადგან კლასში
საბსქრიფშენს ვიყენებთ, ჯობია თუკი მას გავაუქმებთ, როცა კომპონენტი განადგურდება.
ამისთვის შეგვიძლია გამოვიყენოთ
[`takeUntilDestroyed`](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)
ოპერატორი, რომელსაც
`@angular/core/rxjs-interop` გვთავაზობს.

```ts
import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Product } from "../product.model";
import { ProductsService } from "../products.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.html",
  styleUrl: "./product-details.css",
})
export class ProductDetails {
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);

  product!: Product;

  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      const product = this.productsService.getProductById(+params["id"]);
      if (product) {
        this.product = product;
      }
    });
  }
}
```

ჩვენ ვიყენებთ `route.params`-ზე ჯერ `pipe` მეთოდს, `subscribe`-მდე და მანდ
ვაწვდით `takeUntilDestroyed` ოპერატორს. ამით ვეუბნებით ამ
საბსქრიბშენს, რომ იქამდე იმუშაოს, სანამ კომპონენტი არ განადგურდება.
როცა კლასში საბსქრიბშენები გვაქვს, ბევრი მათგანი კომპონენტის განადგურების შემდეგაც
შეიძლება მუშაობდეს და ეს გარანტიას გვაძლევს, რომ აპლიკაცია ზედმეტ რესურსებს არ
დახარჯავს. ჩვენ არ გვჭირდება პარამეტრებისთვის მოსმენა, როცა სხვა გვერდზე ვიმყოფებით.

გაითვალისწინეთ, რომ `takeUntilDestroyed`-ის გამოყენება შესაძლებელია მხოლოდ კონსტრუქტორში,
ან, სხვა შემთხვევაში, მისთვის `destroyRef`-ის მიწოდებით.

## შეჯამება

ამ თავში ჩვენ ვისაუბრეთ როუთის მარტივ პარამეტრებზე. ჩვენ განვსაზღვრეთ როუთების
კონფიგურაციაში `path`, რომელსაც ჩვენთვის სასურველი პარამეტრი ექნება. შემდეგ
ამ პარამეტრის მნიშვნელობებს ჩავწვდით `ActivatedRoute`-ის დაინჯექთებით კომპნენტში
და მასში `params` თვისებაზე დასუბსქრაიბებით. პარამეტრებიდან ჩვენ ავიღედ `id` და
სათანადო პროდუქტი გამოვსახეთ თემფლეითში.
