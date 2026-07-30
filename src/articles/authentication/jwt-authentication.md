---
title: "JWT Authentication"
---

# JWT Authentication

ავთენტიფიკაცია გულისხმობს არა მხოლოდ ანგარიშში შესასვლელი მოთხოვნის
გაგზავნას, არამედ შედეგად დაბრუნებული საავთენტიფიკაციო ინფორმაციის შენახვას
და მის გამოყენებას ისეთი ენფოინთებზე, რომელიც სათანადო პრივილეგიებს საჭიროებს,
ამ ავთენტიფიკაციის ინფორმაციის ჰედერებში მიწოდებით. ჩვეულებრივ ეს ინფორმაცია გულისხმობს
ტოკენებს, კერძოდ JSON Web Token-ებს (JWT). ჩვენ სწორედ ასეთ
ტოკენებთან ვიმუშავებთ.

ამ ნიმუშში ვიხელმძღვანელებთ ბიბლიოთეკით `@auth0/angular-jwt`, რომელიც JWT ტოკენებთან მუშაობას უფრო ამარტივებს.

```sh
npm install @auth0/angular-jwt
```

ჩვენი ანგულარის კონფიგურაცია შემდეგნაირად გამოიყურება. `app.config.ts`-ში პროვაიდერებში გვაქვს შემოტანილი
`provideHttpClient` და `JwtModule` (რომელიც npm-ით დავაინსტალირეთ). `provideHttpClient`-ს უნდა მივაწოდოთ
პარამეტრი `withInterceptorsFromDi()`, რადგან `JwtModule` ინტერსეპტორებს იყენებს ტოკენის დასამატებლად.
ვინაიდან `JwtModule` მოდულზე დაფუძნებული ბიბლიოთეკაა, მისი დარეგისტრირება საჭიროა `importProvidersFrom` ფუნქციაში:

```ts
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { JwtModule } from "@auth0/angular-jwt";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => localStorage.getItem("access_token"),
          allowedDomains: ["dummyjson.com"],
        },
      })
    ),
  ],
};
```

ამ მოდულს `forRoot` ში უნდა მივაწოდოთ კონფიგურაცია. ერთი მხრივ, ტოკენის
გეთერი ფუნქცია - ჩვენ მას შევინახავთ და ავიღებთ ლოკალური მეხსიერებიდან, ამიტომ ანონიმურ
ფუნქციაში დავაბრუნოთ `localStorage.getItem` და ჩვენი ტოკენის key.
`allowdDomains` არასავალდებულო კონფიგურაციაა, სადაც შეგვიძლია განვსაზღვროთ,
მოდულმა რომელ დომეინებზე უნდა იმუშაოს. შესაძლოა გვაქვს რომელიმე დომეინი,
სადაც ტოკენის მიწოდება არ გვჭირდება. ჩვენ აქ უბრალოდ ჩვენი ბექენდის დომეინს
ჩავწერთ.

კონკრეტულად რას აკეთებს ეს ბიბლიოთეკა? მარტივად რომ ვთქვათ, ის მეხსიერებიდან
იღებს ჩვენ ტოკენს და მას Http ჰედერებს ავტომატურად აბამს, რომ ჩვენ ამის
გაკეთება არ მოგვიწიოს ყოველ მოთხოვნაზე. ამას ეს ბიბლიოთეკა `HttpInterceptor`-ის
საშუალებით აკეთებს.

ჩვებულებრივ ამას ასე გავაკეთებდით:

```ts
import { inject, Injectable } from "@angular/core";
import { ShoppingCart } from "../types/cart.model";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getCartsForUser() {
    return this.http.get<{ carts: ShoppingCart[] }>(
      `https://dummyjson.com/auth/carts/user/`,
      {
        headers: {
          Authentication: `Bearer ${authService.getToken()}`,
        },
      }
    );
  }
}
```

ეს უბრალოდ ნიმუშია და არ წარმოადგენს ჩვენი აპლიკაციის ნაწილს.
ჩვეულებრივ ვაგზავნით მოთხოვნას რაღაც ენდფოინთზე, და დამატებით ვაწვდით
მეორე არგუმენტად კონფიგურაციის ობიექტს, სადაც ჰედერებს ვაყენებთ,
კერძოდ `Authentication` ჰედერს, რომელიც არის `Bearer` და ამას
მოყვება მეხსიერებაში შენახული ტოკენი, რომელიც შეიძლება ავტენტიფიკაციის
სერვისით ავიღოთ. `JwtModule`-ის დახმარებით ამის გაკეთება არ გვჭირდება.
მეტიც, ამ ბიბლიოთეკით ტოკენის დეკოდირება და მისი ვადის შემოწმებაც შეგვიძლია.

შევხედოთ ჩვენი როუთინგის კონფიგურაციას `app.routes.ts`-ში:

```ts
import { Routes } from "@angular/router";
import { Auth } from "./auth/auth";
import { Logout } from "./logout/logout";
import { ShoppingCart } from "./shopping-cart/shopping-cart";

export const routes: Routes = [
  { path: "auth", component: Auth },
  { path: "logout", component: Logout },
  {
    path: "cart",
    component: ShoppingCart,
  },
  { path: "", redirectTo: "cart", pathMatch: "full" },
];
```

ჩვენ გვაქვს სამი ძირითადი მისამართი და სამი შესაბამისი კომპონენტი.
`auth` მისამართზე ჩვენ გვექნება კომპონენტი სადაც მომხმარებელი
თავის ინფორმაციას შეიყვანს და საპასუხოდ მიიღებს ტოკენს.
`logout` მისამართზე მომხმარებელი ანგარიშიდან გავა.
`cart` მისამართზე მომხმარებელმა უნდა შეძლოს თავის ექაუნთზე
არსებული საშოპინგო კალათის ნახვა. თავიდანვე გადამისამართება
მოხდება ამ კალათის გვერდზე, თუმცა მომხმარებელი რადგან
ავთენტიფიცირებული არ არის ის შედეგს ვერ დაინახავს.

ასე გამოიყურება ჩვენი `App`-ის თემფლეითი:

```html
<header>
  <nav>
    <ul>
      <li>
        <a routerLink="/auth">Login/Register</a>
      </li>
      <li>
        <a routerLink="/logout">logout</a>
      </li>
    </ul>
  </nav>
</header>
<router-outlet></router-outlet>
```

გვაქვს ლინკები `auth` და `logout` გვერდებზე, და, რა თქმა უნდა, აუთლეტი.

`types` ფოლდერში გვაქვს შექმნილი პროდუქტის და კალათის მოდელი.

`product.model.ts`

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
```

`types/cart.model.ts`

```ts
import { Product } from "./product.model";

export interface ShoppingCart {
  id: number;
  products: Product[];
}
```

ცალკე სერვისების ფოლდერში მოვათავსებთ სერვისებს. ჯერ მივხედოთ ავთენტიფიკაციის
ლოგიკას.

`types/services/auth.service.ts`

```ts
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { tap } from "rxjs";

interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<LoginResponse>(
        "https://dummyjson.com/auth/login",
        JSON.stringify(credentials),
        { headers: { "Content-Type": "application/json" } }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem("access_token", response.token);
          localStorage.setItem("user", JSON.stringify(response));
          this.router.navigate(["/"]);
        })
      );
  }

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    this.router.navigate(["/"]);
  }

  getUserId() {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user).id;
    } else {
      return null;
    }
  }
}
```

ჩვენ ამ სერვისში არა მხოლოდ HTTP მოთხოვნებს გავგზავნით, არამედ
რაუთინგსაც ვაწარმოებთ და ტოკენებსაც ვმართავთ.

`login` მეთოდით მომხმარებელს შევიყვანთ ექაუნთში. ავიღებთ
პაროლსა და მეილს და მას სათანადო ენდფოინთზე გავგზავნით
post მოთხოვნით. აქ მესამე არგუმენტად ჩვენ HTTP ჰედერებს
ვაკონკრეტებთ. ანუ მოთხოვნის შესახებ დამატებით ინფორმაციას.
ამ სპეციფიკური ბექენდისთვის საჭიროა, რომ მივუთითოთ
`Content-Type` რომელიც იქნება `application/json`.
ამ მოთხოვნაზე ვიყენებთ `pipe` მეთოდს და მასში ვუძახებთ
`tap` ოპერატორს (`rxjs`-დან). ეს ოპერატორი საშუალებას
გვაძლევს რომ შედეგს ჩავწვდეთ სტრიმის მოდიფიკაციის გარეშე
და რაიმე გვერდითი მოვლენის მსგავსი ოპერაციები ჩავატაროთ.

ჩვენ `LoginResponse` ტიპის პასუხს ვიღებთ და აქედან ტოკენსა და
მომხმარებლის ინფორმაციას ვინახავთ ლოკალურ მეხსიერებაში `access_token`-ისა
და `user`-ის სახელების ქვეშ.
იდეაში მარტო ტოკენიც საკმარისია, რადგან მისი დეკოდირებული ვერსია
შეიცავს მოხმარებლის მონაცემებს, თუმცა ზედმეტი დეკოდირებისგან თავი
რომ ავირიდოთ, პირდაპირ მომხმარებელიც შევინახოთ.
შემდგომ ჩვენ ნავიგაციას ვაკეთებთ მთავარ გვერდზე, რომელიც მოხმარებელს
საშოპინგო კალათაზე გადაიყვანს, ახლა უკვე ავთენტიფიცირებულს.

აქვე ვქმნით `logout` მეთოდს, რომელიც მეხსიერებიდან ავთენტიფიკაციის
ინფორმაციას წაშლის და მომხმარებელს მთავარ გვერდზე გადაიყვანს.
რაუტინგმა უნდა მოაგვაროს ის, თუ ავთენტიფიკაციის მიხედვით რომელ
გვერდზე შეუძლია მოხმარებელს გადასვლა. ამას სხვა თავში მივხედავთ
(სახელდობრ [CanActivate თავში](./can-activate.html)).

ბოლოს ვქმნით მეთოდს `getUserId`, რომლითაც შეგვიძლია მოხმარებლის
აიდის აღება ლოკალური მეხსიერებიდან. ეს უკანასკნელი დაგვჭირდება
სწორი საშოპინგო კალათის მისაღებად.

ახლა `Auth`-ში ეს სერვისი გამოვიყენოთ:

```ts
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-auth",
  imports: [ReactiveFormsModule],
  templateUrl: "./auth.html",
  styleUrl: "./auth.css",
})
export class Auth {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.nonNullable.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  login() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.getRawValue())
        .subscribe((response) => {
          console.log(response);
        });
    }
  }
}
```

ჩვენ უბრალოდ ფორმას ვქმნით `FormBuilder`-ით და მის მნიშვნელობას
ვაწვდით `AuthService`-ზე `login` მეთოდს. შედეგს სანიმუშოდ კონსოლში ვლოგავთ.

ფორმის ჯგუფს თემლფეითთან ვაკავშირებთ:

```html
<form [formGroup]="loginForm" (ngSubmit)="login()">
  <h1>Log In</h1>
  <div>
    <label for="username">Username</label>
    <input type="text" id="username" formControlName="username" />
  </div>
  <div>
    <label for="password">Password</label>
    <input type="password" id="password" formControlName="password" />
  </div>
  <button type="submit" [disabled]="loginForm.invalid">log in</button>
</form>
```

ასე API-ის დოკუმენტაციაში არსებული მოხმარებლების მონაცემებს თუ შევიყვანთ
ველში და დავასაბმითებთ, ჩვენ პასუხად უნდა მივიღოთ მოხმარებლის მონაცემები
და ტოკენი, რომელიც ლოკალურ მეხსიერებაშიც უნდა განთავსდეს. ჩვენ ასევე
გადამისამართებულები ვიქნებით მთავარ გვერდზე, რომელიც თავის მხრივ `cart`
მისამართზე გადაგვიყვანს.

`Logout`-ს მივხედოთ, რომელზეც მაშინ გადავალთ, როცა `logout`
სანავიგაციო ღილაკს დავაჭერთ.

```ts
import { Component, inject, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.html",
  styleUrl: "./logout.css",
})
export class Logout implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.logout();
  }
}
```

ინიციალიზაციის დროს ჩვენ უბრალოდ სერვისზე დავუძახებთ `logout`-ს,
რათა ინფორმაცია წაიშალოს და ჩვენ მთავარ გვერდზე გადავიდეთ.
აქ შეიძლება უკუთვლა გამოვაჩინოთ და მომხმარებელს ვანიშნოთ,
რომ შეუძლია ამ მოქმედების გაუქმება. ეს სურვილისამებრ თქვენით დაამატეთ.

ახლა მოხმარებლის კალათა ავამუშავოთ. ჯერ შევქმნათ სერვისი, საიდანაც მონაცემებს
მივიღებთ:

```ts
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ShoppingCart } from "../types/cart.model";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getCartsForUser() {
    return this.http.get<{ carts: ShoppingCart[] }>(
      `https://dummyjson.com/auth/carts/user/${this.authService.getUserId()}`
    );
  }
}
```

აქ ჩვენ ასევე ვაინჯექთებთ `AuthService`-ს და მისი საშუალებით მოხმარებლის
აიდის ვიღებთ, რომელსაც ენდფოინთის ბოლოში ვამატებთ. `/auth` მისამართზე
არსებული მონაცემები ხელმისაწვდომია მხოლოდ ტოკენის საშუალებით. ამ ტოკენს
`JwtModule` ჩვენ მაგივრად მისცემს ამ მოთხოვნას. ამ მოდულმა უკვე იცის,
საიდან უნდა აიღოს ტოკენი. საბოლოოდ `getCartsForUser`
მეთოდი მოგვცემს `Obsevable`-ს რომელიც დააბრუნებს ობიექტს. ამ ობექტის ერთ-ერთი
თვისებაა `cart` სადაც ჩვენთვის საჭირო მონაცემებია.

ამ მეთოდს დავუძახებთ `ShoppingCart` კომპონენტში:

```ts
import { Component, inject, OnInit } from "@angular/core";
import { CartService } from "../services/cart.service";
import { ShoppingCart } from "../types/cart.model";

@Component({
  selector: "app-shopping-cart",
  templateUrl: "./shopping-cart.html",
  styleUrl: "./shopping-cart.css",
})
export class ShoppingCart implements OnInit {
  carts: ShoppingCart[] = [];
  private cartService = inject(CartService);

  ngOnInit(): void {
    this.cartService.getCartsForUser().subscribe((response) => {
      this.carts = response.carts;
    });
  }
}
```

ჩვენ უბრალოდ ვაინჯექთებთ `CartService`-ს და მისი საშუალებით კალათის ინფორმაციას
ვიღებთ. ამ ინფორმაციას კლასის თვისებაში ვინახავთ. შემდგომ ამ ყველაფერს თემფლეითში
განვათავსებთ:

```html
@for (cart of carts; track cart.id) {
  <div>
    <h1>Shopping Cart:</h1>
    @for (product of cart.products; track product.id) {
      <div>
        <h2>{{ product.title }}</h2>
        <h3>{{ product.price | currency }}</h3>
      </div>
    }
  </div>
}
```

დავლუპავთ კალათებზე (რადგან ის მასივშია, ანუ ერთზე მეტი შეიძლება იყოს) და
მის შიგნით არსებულ პროდუქტებზეც. აქ მარტივად სათაურს და ფასს გამოვსახავთ.

ასე აპლიკაცია სანახევროდ მუშაობს. პრობლემა ის არის, რომ ჩვენ თუ ანგარიშიდან
გავედით, მაინც შევძლებთ `/cart` მისამართზე გადასვლას, მოთხოვნა ტყუილად და
წარუმატებლად გაიგზავნება. როგორმე მოხმარებელს არ უნდა მივცეთ საშუალება, რომ
ამ გვერდზე გადავიდეს, თუ ის ავთენტიფიცირებული არ არის. ამაზე ვისაუბრებთ შემდეგ
თავში.

### შეჯამება

ჩვენ ამ თავში ანგულარში ვისწავლეთ ავთენტიფიკაცია JWT-ის საშუალებით. ჩვენ გამოვიეყნეთ
`@auth0/angular-jwt` რომელიც ჩვენ მაგივრად ამატებს ტოკენს მოთხოვნების ჰედერებში.
ჩვენ შევქმენით ავთენტიფიკაციის სერვისი, სადაც ვმართავთ ანგარიშში შესვლას, ანუ
ტოკენისა და მომხმარებლის მონაცემების მიღებასადა შენახვას, და ანგარიშიდან გასვლას,
ანუ მოხმარებლის მონაცემებისა და ტოკენის მეხსიერებიდან წაშლას. ხშირად ამ დროს
შეიძლება დაგვჭირდეს მოხმარებლის სხვადასხვა გვერდზე გადამისამართება. ამ სერვისს
ვიყენებთ არა მხოლოდ კომპონენტებში, არამედ იმ სერვისებშიც, სადაც ავთენტიფიკაციის
შესახებ ინფორმაცია გვჭირდება.
