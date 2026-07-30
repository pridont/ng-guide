---
title: "QueryParams"
---

# QueryParams

წინა ქვეთავში ჩვენ მარტივი პარამეტრები გამოვიყენეთ, მაგრამ ეს
განსხვავდება Query პარამეტრებისგან. მისი საშუალებით
შეგვიძლია აპლიკაციის სთეითი, იგივე მდგომარეობა შევინახოთ
მისამართში. ამ მაგალითში განვიხილავთ როგორ შეგვიძლია
პროდუქტების სორტირების მიმართულება შევინახოთ QueryParams-ში.

ჩვენ ფაქტობრივად წინა თავის იდენტური აპლიკაცია გვაქვს, თუმცა
ყურადღებას მხოლოდ ერთ კომპონენტს მივაქცევთ: `Products`
რომელიც იყენებს `ProductsService`-ს რათა პროდუქტები განათავსოს სთეითში.

სერვისში ინახება პროდუქტების მასივი, რომლებსაც გააჩნიათ აიდი, სახელი, აღწერა,
სურათი და ფასი. აქვე არსებობს მეთოდი ამ პროდუქტების მისაღებად.

```ts
import { Service } from "@angular/core";
import { Product } from "./product.model";

@Service()
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

პროდუქტის ინტერფეისი `product.model.ts`-ში ასე გამოიყურება:

```ts
export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}
```

როუთინგი კონფიგურირებული გვაქვს, რომ თავიდანვე `/products` გვერდზე გადავიდეთ
და გავხსნათ `Products`. ეს კომპონენტი ასე გამოიყურება:

```ts
import { Component, inject } from "@angular/core";
import { ProductsService } from "../products-service";
import { RouterLink } from "@angular/router";
import { Product } from "../product.model";

@Component({
  selector: "app-products",
  imports: [RouterLink],
  templateUrl: "./products.html",
  styleUrl: "./products.css",
})
export class Products {
  private productsService = inject(ProductsService);

  products: Product[] = this.productsService.getAllProducts();
}
```

აპლიკაციის ინიციალიზაციის დროს ჩვენ პროდუქტების სიას ვიღებთ, და
კომპონენტში ვინახავთ.
ამ პროდუქტებს უბრალოდ თემფლეითში განვათავსებთ:

```html
<div class="container">
  <ul>
    @for (product of products; track product.id) {
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

ჩვენი მიზანია, რომ მომხმარებელს პროდუქტების გაფილტვრის საშუალება მივცეთ.

`Products`-ში დავამატოთ შემდეგი თვისებები:

```ts
  sortBy: 'cheapest' | 'expensive' = 'cheapest';
  sortOptions = ['cheapest', 'expensive'];
```

ეს იქნება სორტირების მიმართულებები: ჯერ იაფი პროდუქტები გამოჩნდეს
თუ ძვირი. თავდაპირველად სორტირება `cheapest`-ზე იქნება.
ასევე გვინდა სორტირების ვარიანტების მასივი, რომლითაც
ფორმას ავაგებთ.

კომპონენტის იმპორტებში შემოვიტანოთ `FormsModule` რათა ფორმების
გამოყენება შევძლოთ:

```ts
import { FormsModule } from "@angular/forms";

@Component({
  imports: [/* ... */ FormsModule],
})
```

ახლა უბრალოდ შევქმნათ `select` ელემენტი `NgModel` დირექტივით,
რომელსაც დავაკავშირებთ `sortBy` თვისებასთან.
`ngModelChange` არის ივენთი, რომელსაც ფორმის ელემენტი დააემითებს,
როცა მასში მომხმარებელი რამეს შეცვლის. ამ დროს გვინდა `changeSort`
მეთოდით რეაგირება, რომელსაც ტაიპსკრიპტის ნიმუშში ვნახავთ.
`@for` ბლოკით
სორტირების ვარიანტები განვათავსოთ და მათი მნიშვნელობები მივაბათ
ელემენტს. ასევე ის ინტერპოლაციით გამოვსახოთ. დაკლიკებაზე უნდა
გააქტიურდეს მეთოდი, რომლითაც სორტირება მოხდება.

```html
<div class="container">
  <label for="sort-select">Sort by</label>
  <select
    id="sort-select"
    [ngModel]="sortBy"
    (ngModelChange)="changeSort($event)"
  >
    @for (sortOption of sortOptions; track sortOption) {
      <option [value]="sortOption">{{ sortOption }}</option>
    }
  </select>
  <ul>
    @for (product of products; track product.id) {
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

შევქმნათ `changeSort` მეთოდი. ჩვენ არსებულ სიას ასე პირდაპირ არაფერს
გავუკეთებთ. ჯერ უნდა მოხდეს ნავიგაცია, რომლის საფუძველზეც შეიცვლება
მისამართში query პარამეტრები და ჩვენ შემდგომ მასზე უნდა ვირეაგიროთ.

```ts
import { Component, inject } from "@angular/core";
import { ProductsService } from "../products-service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Product } from "../product.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-products",
  imports: [RouterLink, FormsModule],
  templateUrl: "./products.html",
  styleUrl: "./products.css",
})
export class Products {
  private productsService = inject(ProductsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sortBy: "cheapest" | "expensive" = "cheapest";
  sortOptions = ["cheapest", "expensive"];
  products: Product[] = [];

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams) => {
        const unsortedProducts = this.productsService.getAllProducts();
        const sortBy = queryParams["sortBy"];
        this.sortBy = sortBy;
        this.products = this.sortProducts(unsortedProducts, sortBy);
      });
  }

  sortProducts(products: Product[], sortBy: "cheapest" | "expensive") {
    if (sortBy === "cheapest") {
      return products.sort((a, b) => a.price - b.price);
    } else {
      return products.sort((a, b) => b.price - a.price);
    }
  }

  changeSort(newSortBy: string) {
    this.router.navigate(["products"], {
      queryParams: { sortBy: newSortBy },
    });
  }
}
```

`changeSort` მეთოდი იყენებს კომპონენტში დაინჯექტებული `Router`-ის
ინსტანციას და მასზე უძახებს `navigate` მეთოდს. ეს არის `routerLink`-ის
მსგავსი ხელსაწყო, ოღონდ კლასში. პირველ არგუმენტად ეს მეთოდი იღებს
მისამართის ცალკეული ერთეულების მასივს. ჩვენ იმავე გვერდზე, `prodocts`-ზე
გვინდა ნავიგაცია, უბრალოდ უნდა შევცვალოთ პარამეტრები. მეორე არგუმენტად
ფუნქცია იღებს კონფიგურაციის ობიექტს. აქ ერთ-ერთი თვისებაა `queryParams` სადაც
შეგვიძლია პარამეტრების ობიექტის შექმნა, რომელსაც ანგულარი გარდასახავს
პარამეტრებში მისამართის სტრინგად.

აქ ჩენ შევქმენით `sortBy` პარამეტრი, რომლის მნიშვნელობაც იქნება მომხმარებლის
მიერ არჩეული სორტირების მიმართულება. მისამართში ეს გამოჩნდება, როგორც
`/products?sortBy=cheap`.

შემდეგ ჩვენ გვინდა ამ რაუთის ცვლილებაზე რეაგირება. სწორედ ამიტომ `constructor`-ში
ვიყენებთ დაინჯექთებულ `ActivatedRoute`-ს, რათა დავასუბსქრაიბოთ მასში არსებულ
`queryParams`-ზე. ჩვენ პროდუქტების სიას ვინახავთ ლოკალურ ცვლადში და ასევე
`queryParams`-იდან ვიღებთ ქოლბექში ხელმისაწვდომ პარამეტრების ობიექტს.
აქ ჩვენი შექმნილი პარამეტრის მნიშვნელობა შეგვიძლია ავიღოთ - `sortBy`.
ჩვენ ამ სორტირების ვარიანტს კლასის თვისებაში ვანახლებთ, რათა
გვერდის დარეფრეშებაზე ფორმაში ისევ სწორი ვარიანტი იყოს არჩეული.
რაც მთავარია, ახლა სორტირების მიმართულების მიხედვით ვასორტირებთ
პროდუქტებს და მათ კლასის თვისებაში ვინახავთ.
სორტირებას ვაკეთებთ `sortProducts` ფუნქციით. აქ პროდუქტებს და სორტირების
მიმართულებას ვიღებთ და ამის მიხედვით სათანადოდ სორტირებულ პროდუქტებს ვაბრუნებთ.

ზემოთხსენებული ლოგიკის გაშვება `ngOnInit`-შიც არის შესაძლებელი, თუმცა
`takeUntilDestroyed`-ის მარტივად გამოსაყენებლად იგივეს გაკეთება კონსტრუქტორშიც შეიძლება.

ყოველ ნავიგაციაზე `queryParams`-ის საბსქრიფშენშში არსებული მეთოდი
აქტიურდება და ანახლებს:

- მიმდინარე სორტირების მიმართულება: `this.sortBy`,
- პროდუქტების მასივს ამ სორტირების მიხედვით: `this.products`.

შედეგად შეგვიძლია პროდქტების სორტირება `queryParams`-ით.
რა თქმა უნდა შესაძლებელია იმდენი `queryParams`-ის შექმნა,
რამდენიც მოგვესურვება.

## შეჯამება

ამ თავში ჩვენ ვისწავლეთ კლასში `Router`-ის გამოყენება
`queryParams`-ით და `ActivatedRoute`-ზე `queryParams`-ის
ცვლილებებზე რეაგირება. ჩვენ მომხმარებლის მიერ სორტირების მიმართულების
შეცვლის საფუძველზე ვახორციელებთ ნავიგაციას განახლებული `queryParams`-ით.
`queryParams`-ის ცვლილებას ამავე კომპონენტში ვუსმენთ და სათანადოდ
ვრეაგირებთ: ვანახლებთ სორტირების მიმართულებას და ვასორტირებთ პროდუქტების სიას.
