---
title: "HTTP მოთხოვნებთან მუშაობა"
---

# HTTP მოთხოვნებთან მუშაობა

აპლიკაციათა უმეტესობას სჭირდება სერვერთან კომუნიკაცია HTTP პროტოკოლით,
რათა ჩამოტვირთოს ან ატვირთოს მონაცემები, ან ისარგებლოს ხვა ბექენდ
სერვისებით. ანგულარს გააჩნია API, რომლითად HTTP მოთხოვნების გაგზავნაა
შესაძლებელი.

სანამ ანგულარის API-ს გამოვიყენებთ, მოკლედ აღვწეროთ რა HTTP მოთხოვნების
გაგზავნაა შესაძლებელი:

- GET: მონაცემების მიღების მოთხოვნა.
- POST: ახალი მონაცემების ატვირთვის მოთხოვნა.
- DELETE: მონაცემების წაშლის მოთხოვნა.
- PATCH: არსებული მონაცემის ნაწილს შეცვლა.
- PUT: არსებული მონაცემის ახლით ჩანაცვლება.

ახლა ამ მეთოდების გამოყენება ვცადოთ შემდეგ თავებში.

## HTTP Client

HTTP მოთხოვნებთან სამუშაოდ ვიყენებთ `HttpClient`-ს `@angular/common/http`-დან.
ანგულარის 21-ე ვერსიიდან ის **ნაგულისხმევად ხელმისაწვდომია** — მისი
დასაინჯექთებლად არაფრის დარეგისტრირება არ გვჭირდება.

`provideHttpClient()` მაშინ დაგვჭირდება, როცა HTTP-ის კონფიგურაცია გვინდა,
მაგალითად [ინტერსეპტორების](#interceptors) დამატება. მას `app.config.ts`-ში
პროვაიდერების მასივში ვწერთ:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(/* კონფიგურაცია, მაგ. withInterceptors(...) */),
  ],
};
```

**შენიშვნა:** ძველ სახელმძღვანელოებში `provideHttpClient()` სავალდებულოდ
არის მოხსენიებული. ეს 20-ე ვერსიამდე მართლაც ასე იყო.

ამ გაკვეთილში ბექენდის სიმულაციისთვის ვისარგებლებთ dummyjson.com-ით,
რომელიც ონლაინ მაღაზიის სერვერის სიმულაციას აკეთებს. მის გამოსაყენებლად
აუცილებელია რომ ამ API-ს დოკუმენტაციას შევხედოთ. ჩვენ გამოვიყენებთ
პროდუქტებთან დაკავშირებულ ენდფოინთებს.

დოკუმენტაციიდან გამომდინარე შეგვიძლია შევქმნათ პროდუქტის, და პროდუქტის
მიღების მოთხოვნაზე მოცემული პასუხის ინტერფეისი:

product.model.ts

```ts
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface GetProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type AddProduct = Partial<Product>;
```

დააკვირდით, რომ GET მოთხოვნაზე გვიბრუნდება ობიექტი სადაც ერთ-ერთი
თვისება არის პროდუქტების მასივი და დანარჩენი - დამატებითი ინფორმაცია
პროდუქტების რაოდენობის შესახებ. ეს pagination-ისთვის არის საჭირო,
თუმცა ამას აქ არ განვიხილავთ.

აქვე პროდუქტის დამატების დოკუმენტაციას თუ შევხედავთ, როგორც ჩანს
შესაძლებელია არასრული პროდუქტის ობიექტის აწყობა და მისი გაგზავნა
POST მოთხოვნით. მაშინ შევქმნათ `AddProduct` ინტერფეისი, რომელიც
იქნება ნაწილობრივი `Product` ინტერფეისი, სადაც ყველა მისი თვისება
არასავალდებულო გახდება.

HTTP მოთხოვნების ლოგიკისთვის ხშირად ცალკეულ სერვისს ვიყენებთ ხოლმე.
ამიტომ შევქმნათ `ProductsService` და შემოვიტანოთ პირველი მეთოდი:

```ts
import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { AddProduct, GetProductsResponse, Product } from "./product.model";

@Service()
export class ProductsService {
  baseUrl = "https://dummyjson.com";

  private http = inject(HttpClient);

  getAllProducts() {
    return this.http.get<GetProductsResponse>(`${this.baseUrl}/products`);
  }
}
```

კლასში ვაინჯექთებთ `HttpClient`-ს რომლითაც შეგვიძლია მოთხოვნების გაგზავნა.
აქვე `baseUrl`-ში ვინახავთ ჩვენი სერვერის მისამართის ძირითად ნაწილს.
`getAllProducts` მეთოდში ჩვენ ვაბრუნებთ ამ HttpClient-ზე დაძახენულ ჩვენთვის
სასურველ მეთოდს. ამ შემთხვევაში `get`-ს. ეს ხდება დოკუმენტაციაში მითითებულ
ენდფოინთზ. ეს მეთოდი აბრუნებს generic ტიპს, კერძოდ Observable-ს.
ამიტომ ჩვენ შეგვიძლია აქ დავაზუსტოთ რა ტიპის შედეგს მოგვცემს ეს
Observable. ჩვენ ვიცით რომ ის იქნება ჩვენ მიერ შექმნილი `GetProductsResponse`
ტიპის.

ახლა სასურველ კომპონენტში შეგვიძლია ამ მეთოდს დავუძახოთ.
app.ts:

```ts
import { Component, inject, OnInit } from "@angular/core";
import { AddProduct, Product } from "./product.model";
import { ProductsService } from "./products-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  loading = true;
  products: Product[] = [];

  private productsService = inject(ProductsService);

  ngOnInit() {
    this.productsService.getAllProducts().subscribe((response) => {
      this.loading = false;
      this.products = response.products;
    });
  }
}
```

წინასწარ აპლიკაცია იქნება ჩატვირთვის რეჟიმში, და შეგვიძლია ეს ავსახოთ
`loading` თვისებაში. აქვე შევქმნათ პროდუქტების სია, რომელიც თავიდან
იქნება ცარიელი. კლასში ვაინჯექთებთ `ProductsService`-ს და
`ngOnInit`-ში მას ვუძახებთ. მხოლოდ დაძახება საკმარისი არ არის,
რადგან მოთხოვნა არ გაიგზავნება, თუ ჩვენ მასზე არ დავასუბსქრაიბეთ.
დასუბსქრაიბებისას შეგვიძლია უკვე ჩავწვდეთ დაბრუნებულ პასუხს.
როცა პასუხი დაბრუნდება (რომელიც უკვე ვიცით რა ტიპის არის),
შეგვიძლია `loading`-ის მდგომარეობა განვაახლოთ და
ჩვენი პროდუქტების მასივში შევინახოთ დაბრუნებული პროდუქტები.

ისინი თემფლეითში გამოვსახოთ:

```html
@if (products.length) {
  <div>
    @for (product of products; track product.id) {
      <div class="product-card">
        <img [src]="product.thumbnail" [alt]="product.title" />
        <h3>{{ product.title }}</h3>
        <p>{{ product.description }}</p>
        <p>{{ product.price | currency }}</p>
      </div>
    }
  </div>
}

@if (loading) {
  <div>loading...</div>
}
```

როგორც ხედავთ აქ ქვემოთ ჩატვირთვის ინდიკატორიც გვაქვს, რომელიც
თავიდან გამოჩნდება, მაგრამ მაშინ გაქრება როცა მოთხოვნა პასუხს
დაგვიბრუნებს.

პროდუქტებს უბრალოდ `@for` ბლოკით გამოვსახავთ.
ბრაუზერს თუ გავხსნით, დავინახავთ, რომ მომენტალურად
`loading...` ტექსტი გამოჩნდება და შემდეგ მის ადგილას
პროდუქტები გამოჩნდება.

გაითვალისწინეთ, რომ http-ის საბსქრიბშენზე `unsubscribe`-ის გაკეთება არ გვჭირდება,
რადგან ამას ანგულარის `HttpClient` თავისით აგვარებს.

ახლა სერვისში სხვა მეთოდებს მივხედოთ:

```ts
import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { AddProduct, GetProductsResponse, Product } from "./product.model";

@Service()
export class ProductsService {
  baseUrl = "https://dummyjson.com";

  private http = inject(HttpClient);

  getAllProducts() {
    return this.http.get<GetProductsResponse>(`${this.baseUrl}/products`);
  }

  addProduct(product: AddProduct) {
    return this.http.post<Product>(`${this.baseUrl}/products/add`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<Product>(`${this.baseUrl}/products/${id}`);
  }

  editProduct(updatedProduct: Partial<Product>) {
    return this.http.put<Product>(
      `${this.baseUrl}/products/${updatedProduct.id}`,
      updatedProduct
    );
  }
}
```

პროდუქტის დამატებისას ჩვენ პარამეტრში მივიღებთ ახალ პროდუქტს და მას
გავგზავნით სათანადო ენდფოინთზე. `post` მეთოდს მეორე არგუმენტად ვაწვდით
სწორედ ამ ობიექტს. მასზე `JSON.stringify` არ გვიჭირდება, რადგან ამას `HttpClient`
გააკეთებს.

წაშლის მოთხოვნის შემთხვევაში ჩვენ მხოლოდ პროდუქტის `id` გვჭირდება და
`delete` მოთხოვნის გაგზავნა ამ `id`-ის მქონე ენდფოინთზე.

პროდუქტის განახლებისთვის სერვერი იღებს put მოთხოვნას. ჩვენ განახლებულ
პროდუქტს ვიღებთ პარამეტრში და მას ვაგზავნით ამ პროდუქტის აიდის მქონე ენდფოინთზე.

ჩვენი app.ts ახლა ასე უნდა გამოიყურებოდეს:

```ts
import { Component, inject, OnInit } from "@angular/core";
import { AddProduct, Product } from "./product.model";
import { ProductsService } from "./products-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  loading = true;
  products: Product[] = [];

  private productsService = inject(ProductsService);

  ngOnInit() {
    this.productsService.getAllProducts().subscribe((response) => {
      this.loading = false;
      this.products = response.products;
    });
  }

  addNewProduct() {
    const newProduct: AddProduct = {
      title: "New Product",
      description: "This is a new test product!",
      price: 399,
      thumbnail: "https://angular.dev/assets/images/press-kit/angular_wordmark_gradient.png",
    };

    this.productsService.addProduct(newProduct).subscribe((newProduct) => {
      this.products.unshift(newProduct);
    });
  }

  deleteProduct(id: number) {
    this.productsService.deleteProduct(id).subscribe((deletedProduct) => {
      this.products = this.products.filter((p) => p.id !== deletedProduct.id);
    });
  }

  editProduct(product: Product) {
    const updatedProduct = {
      ...product,
      title: "This title was edited",
      description: "New updated description",
    };

    this.productsService
      .editProduct(updatedProduct)
      .subscribe((editedProduct) => {
        // dummyjson-ის API აბრუნებს იმავე არამოდიფიცირებულ ობიექტს,
        // ამიტომ მას გარდავქმნით.
        this.products = this.products.map((product) =>
          product.id === editedProduct.id ? updatedProduct : product
        );
      });
  }
}
```

აქაც თითოეული მოთხოვნის დასაძახებლად ცალკეული მეთოდი გვაქვს.

- პროდუქტის დამატებისას ჩვენ აქ პირდაპირ ახალი პროდუქტის ობიექტს
  ვქმნით, თუმცა რეალურ აპლიკაციაში ამ პროდუქტს მომხმარებლის მიერ
  შევსებული ფორმიდან ავაგებდით. ამ პროდუქტს სერვისზე დაძახებულ
  `addProduct` მეთოდს ვაწვდით და მასზე ვასუბსქრაიბებთ. შედეგად
  დაბრუნებულ ახალ პროდუქტს აქ ვამატებთ სიის თავში.
- წაშლის დროს ჩვენ `deleteProduct`-ს ვაწვდით ფუნქციის პარამეტრად
  მიღებულ `id`-ს და მასზე ვასუბსქრაიბებთ. შედეგად წაშლილ პროდუქტს
  ვიღებთ და ჩვენ არსებულ სიას ვფილტრავთ, რათა იქ აღარ იყოს
  წაშლილი პროდუქტი.
- პროდუქტის დაედითებისას ჩვენ აქაც პირობითად ვცვლით სათაურს და
  აღწერას. ამ ახალ პროდუქტს ვაწვდით `editProduct` მეთოდს და
  დაბრუნებული პასუხის მიხედვით ვცვლით ამ ობიექტს მასივში.

თემფლეითში თითოეული პროდუქტის ბარათში გვაქვს შექმნილი ღილაკები
სათანადო მეთოდებისთვის და ასევე პროდუქტის დამატების ღილაკი გვაქვს
სიის თავში:

```html
<button (click)="addNewProduct()">Add new product</button>
@if (products.length) {
  <div>
    @for (product of products; track product.id) {
      <div class="product-card">
        <img [src]="product.thumbnail" [alt]="product.title" />
        <h3>{{ product.title }}</h3>
        <p>{{ product.description }}</p>
        <p>{{ product.price | currency }}</p>
        <button (click)="deleteProduct(product.id)">delete</button>
        <button (click)="editProduct(product)">Edit</button>
      </div>
    }
  </div>
}

@if (loading) {
  <div>loading...</div>
}
```

ასე ჩვენი აპლიკაცია დაკავშირებულია ბექენდთან და ჩვენ შეგვიძლია:

- პროდუქტების სიის მიღება,
- ახალი პროდუქტის დამატება,
- პროდუქტის წაშლა,
- არსებული პროდუქტის განახლება.

## httpResource — რეაქტიული წაკითხვა

დააკვირდით, რამდენი შრომა დაგვჭირდა მხოლოდ პროდუქტების *ჩვენებისთვის*:
გამოვაცხადეთ `products` მასივი, გამოვაცხადეთ `loading` ფლაგი, დავწერეთ
`ngOnInit`, დავასუბსქრაიბეთ, ქოლბექში ორივე თვისება განვაახლეთ. ერორის
დამუშავება კი საერთოდ არ გაგვიკეთებია.

ეს პატერნი — "მოთხოვნა გაგზავნე, შედეგი სთეითში შეინახე, მოლოდინის რეჟიმი
და ერორი ასახე" — ისე ხშირად მეორდება, რომ ანგულარმა ის ჩაშენებულ
ხელსაწყოდ აქცია: `httpResource`.

`httpResource` არის `HttpClient`-ის რეაქტიული გარსი, რომელიც მოთხოვნის
სტატუსსა და პასუხს [სიგნალების](/signals/) სახით გვაძლევს.

```ts
import { httpResource } from "@angular/common/http";
import { Component } from "@angular/core";
import { GetProductsResponse } from "./product.model";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  productsResource = httpResource<GetProductsResponse>(
    () => "https://dummyjson.com/products"
  );
}
```

მთელი `ngOnInit`, `subscribe`, `loading` და `products` ერთ ხაზად შეიკუმშა.
თემფლეითში:

```html
@if (productsResource.isLoading()) {
  <div>loading...</div>
}

@if (productsResource.error()) {
  <div>Something went wrong!</div>
}

@if (productsResource.hasValue()) {
  <div>
    @for (product of productsResource.value().products; track product.id) {
      <div class="product-card">
        <img [src]="product.thumbnail" [alt]="product.title" />
        <h3>{{ product.title }}</h3>
        <p>{{ product.price | currency }}</p>
      </div>
    }
  </div>
}
```

`httpResource` თავისი თვისებებით გვაძლევს შემდეგ სიგნალებს:

- `value()` — პასუხის სხეული
- `hasValue()` — არსებობს თუ არა მნიშვნელობა (ტაიპსკრიპტისთვის type guard-იც არის)
- `isLoading()` — მიმდინარეობს თუ არა მოთხოვნა
- `error()` — ერორი, ასეთის არსებობის შემთხვევაში
- `status()` — დეტალური სტატუსი

აქვე არსებობს `reload()` მეთოდი, თუ მოთხოვნის ხელახლა გაგზავნა გვინდა.

### რატომ ფუნქცია და არა სტრინგი?

ყურადღება მიაქციეთ, რომ `httpResource`-ს **ფუნქციას** ვაწვდით, და არა
პირდაპირ მისამართს. ეს იმიტომ, რომ ეს ფუნქცია რეაქტიულია: თუ მასში
რომელიმე სიგნალს წავიკითხავთ, სიგნალის შეცვლისთანავე **ახალი მოთხოვნა
ავტომატურად გაიგზავნება**.

```ts
export class ProductDetails {
  productId = input.required<string>();

  productResource = httpResource<Product>(
    () => `https://dummyjson.com/products/${this.productId()}`
  );
}
```

აქ საკმარისია მშობელმა `productId` შეცვალოს — და პროდუქტი თავისით
ჩამოიტვირთება. თუ წინა მოთხოვნა ჯერ არ დასრულებულა, `httpResource`
მას **გააუქმებს** და ახალს გაგზავნის. ეს სწორედ ის ლოგიკაა, რომელსაც
RxJS-ში `switchMap`-ით ვწერდით.

უფრო რთული მოთხოვნებისთვის სტრინგის ნაცვლად ობიექტს ვაბრუნებთ:

```ts
productsResource = httpResource<GetProductsResponse>(() => ({
  url: "https://dummyjson.com/products",
  method: "GET",
  params: { limit: this.limit() },
  headers: { "X-Special": "true" },
}));
```

### `httpResource` თუ `HttpClient`?

ერთი მნიშვნელოვანი განსხვავება: `HttpClient` მოთხოვნას მხოლოდ
დასუბსქრაიბებისას აგზავნის, ხოლო `httpResource` — **მაშინვე**.

აქედან გამომდინარეობს მათი შერჩევის კრიტერიუმი:

- **მონაცემების წაკითხვა** (GET), რომელიც აპლიკაციის სთეითიდან გამომდინარეობს
  → `httpResource`
- **მონაცემების შეცვლა** (POST, PUT, PATCH, DELETE), რომელიც კონკრეტულ
  მოქმედებაზე უნდა მოხდეს → `HttpClient`

ანუ ჩვენი მაგალითში პროდუქტების სიის ჩვენება `httpResource`-ის საქმეა,
ხოლო `addProduct`, `deleteProduct` და `editProduct` — `HttpClient`-ის.
შეცვლის შემდეგ სიის განახლება `productsResource.reload()`-ით ხდება.

## Interceptors

ვთქვათ ყველა მოთხოვნას ერთი და იგივე ჰედერი უნდა დავამატოთ (მაგალითად
საავთენტიფიკაციო ტოკენი), ან ყველა მოთხოვნა უნდა დავლოგოთ. ამის ყოველ
მეთოდში ხელით წერა ცუდი იდეაა.

**ინტერსეპტორი** არის ერთგვარი middleware, რომელიც ყოველი მოთხოვნისთვის
ეშვება და შეუძლია ის შეცვალოს, პასუხს ჩაწვდეს, ან სულაც შეაჩეროს.

ინტერსეპტორი ჩვეულებრივი ფუნქციაა `HttpInterceptorFn` ტიპის. მას ორი
პარამეტრი აქვს: გამავალი მოთხოვნა და `next` ფუნქცია, რომელიც მოთხოვნას
ჯაჭვის შემდეგ რგოლს გადასცემს.

`logging-interceptor.ts`:

```ts
import { HttpInterceptorFn } from "@angular/common/http";

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.method, req.url);
  return next(req);
};
```

მოთხოვნის შესაცვლელად მას `clone` მეთოდით ვაკოპირებთ. `HttpRequest`
**უცვლელი (immutable) ობიექტია** — მისი პირდაპირ მოდიფიცირება არ შეიძლება:

`auth-interceptor.ts`:

```ts
import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
```

ინტერსეპტორების დარეგისტრირება `provideHttpClient`-ში ხდება,
`withInterceptors` ფუნქციით:

```ts
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./auth-interceptor";
import { loggingInterceptor } from "./logging-interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([loggingInterceptor, authInterceptor])),
  ],
};
```

ინტერსეპტორები **მასივში მითითებული რიგით** ეშვება: ამ მაგალითში
მოთხოვნას ჯერ `loggingInterceptor` დაამუშავებს და შემდეგ `authInterceptor`-ს
გადასცემს.

ვინაიდან ინტერსეპტორი ფუნქციაა და არა კლასი, მასში `inject()`-ის
გამოყენებაც შეგვიძლია — ის injection context-ში ეშვება:

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  /* ... */
};
```

**შენიშვნა:** ძველ პროექტებში ინტერსეპტორები კლასებით იწერებოდა
(`HttpInterceptor` ინტერფეისით) და `HTTP_INTERCEPTORS` ტოკენით
რეგისტრირდებოდა, ხოლო `provideHttpClient`-ს `withInterceptorsFromDi()`
სჭირდებოდა. ანგულარის ოფიციალური რეკომენდაციაა ფუნქციური
ინტერსეპტორების გამოყენება — მათი ქცევა უფრო პროგნოზირებადია.

ინტერსეპტორების პრაქტიკულ გამოყენებას [JWT ავთენტიფიკაციის
თავში](/authentication/jwt-authentication.html) ვნახავთ.

## შეჯამება

ამ თავში ჩვენ ვისწავლეთ ანგულარში HTTP მოთხოვნების გაგზავნა
და შედეგის აპლიკაციის სთეითში განთავსება.

`HttpClient` არის დაბალი დონის API: ცალკე შევქმენით სერვისი, სადაც
დავაინჯექთეთ `HttpClient` და მასზე დავუძახეთ სხვადასხვა ტიპის მეთოდებს.
ჩვენ ამ მეთოდების მიერ დაბრუნებული ტიპების განსაზღვრის საშუალებაც გვაქვს.
კომპონენტში ამ მეთოდებზე აუცილებლად ვასუბსქრაიბებთ, რათა, ერთი მხრივ,
მოთხოვნა გაიგზავნოს და, მეორე მხრივ, რათა შედეგი მივიღოთ და ის სთეითში გამოვსახოთ.

`httpResource` კი მაღალი დონის, რეაქტიული ხელსაწყოა: ის მოთხოვნას
მაშინვე აგზავნის და შედეგს სიგნალების სახით გვაძლევს, ამიტომ
`loading`/`error` თვისებების ხელით მართვა აღარ გვჭირდება. მონაცემების
წაკითხვისთვის სწორედ ის უნდა გამოვიყენოთ, ხოლო მონაცემების შეცვლისთვის —
`HttpClient`.

ინტერსეპტორებით ყველა მოთხოვნას ერთიან ლოგიკას ვამატებთ: ჰედერებს,
ლოგირებას, ერორების დამუშავებას.
