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

# HTTP Client

HTTP მოთხოვნებთან სამუშაოდ ვიყენებთ ანგულარში ჩაშენებულ პროვადერებს,
რომლებიც უნდა აპლიკაციის პროვაიდერებში დავარეგისტრიროთ. `app.config.ts`-ში
პროვაიდერების მასივში ვიყენებთ `provideHttpClient()`-ს `@angular/common/http`-დან.

```ts
import { ApplicationConfig } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [/* ... */ provideHttpClient()],
};
```

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
import { inject, Injectable } from "@angular/core";
import { AddProduct, GetProductsResponse, Product } from "./product.model";

@Injectable({ providedIn: "root" })
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
import { ProductsService } from "./products.service";

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
იქნება ცარიელი. კონსტრუქტორში ვაინჯექთებთ `ProductsService`-ს და
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
import { inject, Injectable } from "@angular/core";
import { AddProduct, GetProductsResponse, Product } from "./product.model";

@Injectable({ providedIn: "root" })
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
import { ProductsService } from "./products.service";

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

### შეჯამება

ამ თავში ჩვენ ვისწავლეთ ანგულარში მარტივი HTTP მოთხოვნების გაგზავნა
და შედეგის აპლიკაციის სთეითში განთავსება. ჩვენ HTTP მოთხოვნებისთვის
ცალკე შევქმენით სერვიცი სადაც დავაინჯექთეთ HttpClient და მასზე
დავუძახეთ სხვადასხვა ტიპის მეთოდებს. ჩვენ ამ მეთოდების მიერ დაბრუნებული
ტიპების განსაზღვრის საშუალებაც გვაქვს. კომპონენტში ამ მეთოდებზე
აუცილებლად ვასუბსქრაიბებთ რათა ერთი მხრივ, მოთხოვნა გაიგზავნოს და,
მეორემხრივ, რათა შედეგი მივიღოთ და ის სთეითში გამოვსახოთ.
