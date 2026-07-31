---
title: "CanActivate (Route Guards)"
---

# CanActivate (RouteGuards)

ზოგჭერ საჭიროა, რომ მომხმარებელს რაღაც მისამართებზე წვდომა არ მივცეთ. ამისთვის
გვჭირდება `CanActivate` ტიპის ფუნქციები.

**შენიშვნა:** ანგულარის ახალ ვერსიებში გამოიყენება პირდაპირ `CanActivateFn` ტიპის
ფუნქციები, თუმცა ძველ ვერსიებში ამის მაგივრად იყენებდნენ "Guard" კლასებს. ჩვენ უახლეს
მეთოდს ვისწავლით, თუმცა მოგვიანებით ძველ მეთოდსაც შევხედავთ.

ამ თავში ვიყენებთ [წინა თავში](./jwt-authentication.html) არსებულ კოდს.

## CanActivateFn

ჩვეულებრივ ლოგიკა იმის თაობაზე, გააქტიურდეს თუ არა რაღაც მისამართი, ავთენტიფიკაციის
ნაწილში ინახება. ჩვენ შეგვიძლია ის `AuthService`-ში შევინახოთ.

```ts
import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { tap } from "rxjs";
import { isTokenExpired } from "./jwt";

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

@Service()
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

  isTokenExpired() {
    return isTokenExpired(localStorage.getItem("access_token"));
  }

  canActivate() {
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    } else {
      return true;
    }
  }
}

export const canActivateCart: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return inject(AuthService).canActivate();
};
```

ყურადღება მივაქციოთ კლასში ბოლო ორ ფუნქციას. ჩვენ აქ [წინა თავში](./jwt-authentication.html)
შექმნილ `isTokenExpired` ფუნქციას ვიყენებთ, რომელიც ტოკენს განშიფრავს და მის
`exp` ველს ამოწმებს. თუ ტოკენი საერთოდ არ არსებობს ან გაფუჭებულია, ის მაშინაც
`true`-ს დაგვიბრუნებს და იგი "ვადაგასულად" ჩაითვლება.

შესაბამისად შეგვიძლია შევქმნათ მეთოდი, რომელიც დაადგენს, შეიძლება თუ არა რაიმე მისამართის გააქტიურება.
ამას ტოკენის არსებობისა და მისი ვადის მიხედვით დავადგენთ. თუ ის ამოწურულია, ჩვენ `logout` მეთოდს დავუძახებთ,
რომელიც ერთდროულად ორ საქმეს აკეთებს: ძველ ტოკენს მეხსიერებიდან შლის და
მომხმარებელს გადაამისამართებს.

**გახსოვდეთ:** ეს შემოწმება მხოლოდ მომხმარებლის კომფორტისთვისაა. კლიენტზე
ტოკენის ხელმოწერას ვერ ვამოწმებთ, ამიტომ რეალურ დაცვას სერვერი უზრუნველყოფს და არა გარდი.

ახლა იმავე ფაილიდან (თუმცა ეს ცალკე ფაილშიც შეგვიძლია) დავაექსპორტოთ ცვლადი, რომელიც
იქნება `CanActivateFn` ტიპის. ამ ტიპის ფუნქციაში ხელმისაწვდომია `ActivatedRouteSnapshot` და
`RouterStateSnapshot` რომელიც შეიძლება კონკრეტულ ვითარებაში დაგვჭირდეს, თუმცა ამ მაგალითში — არა.
ჩვენ ვაბრუნებთ `inject()` ფუნქციაზე დაძახებას, რომელიც `@angular/core`-იდან უნდა დავაიმპორტოთ.
ეს მეთოდი აინჯექთებს სასურველი კლასის ინსტანციას და მასზე ახლა შეგვიძლია ჩვენთვის საჭირო
მეთოდზე დაძახება, კერძოდ `canActivate`, რომელიც ტოკენს შეამოწმებს და სდათანადო boolean-ს დააბრუნებს.

როუთინგის კონფიგურაციაში ჩვენ ეს ფუნქცია უნდა დავამატოთ სასურველ მისამართზე `canActivate` თვისების მასივში.
როგორც ალბათ უკვე მიხვდით, ჩვენ აქ ერთზე მეტი ფუნქციის დამატება შეგვიძლია და ისინი თანმიმდევრულად
შეამოწმებენ შეიძლება თუ არა მოცემულ მისამართზე გადასვლა.

```ts
import { Routes } from "@angular/router";
import { Auth } from "./auth/auth";
import { Logout } from "./logout/logout";
import { canActivateCart } from "./services/auth-service";
import { ShoppingCart } from "./shopping-cart/shopping-cart";

export const routes: Routes = [
  { path: "auth", component: Auth },
  { path: "logout", component: Logout },
  {
    path: "cart",
    component: ShoppingCart,
    canActivate: [canActivateCart],
  },
  { path: "", redirectTo: "cart", pathMatch: "full" },
];
```

და ასე ჩვენი აპლიკაცია უფრო გამართული უნდა იყოს. ახლა თავიდანვე გარდი გადაგვამისამართებს
ავთენტიფიკაციის გვერდზე. და თუ ანგარიშზე შევალთ, `cart` მისამართზე წვდომა გვექნება.
ანგარიშიდან გასვლა გადაგვიყვანს მთავარ გვერდზე, რომელმაც `cart`-ზე უნდა გადაგვამისამართოს,
მაგრამ გარდი თავის მხრივ დაგვაბრუნებს ავთენტიფიკაციის გვერდზე.

## CanActivate Class — ძველი მიდგომა

ფუნქციური გარდები ანგულარის 15-ე ვერსიაში შემოვიდა. მათამდე გარდი
კლასი იყო, და ეს მიდგომა ძველ პროექტებში ხშირად შეგვხვდება.

გასათვალისწინებელია, რომ `CanActivate` ინტერფეისი **კვლავ მუშაობს** და
ფორმალურად deprecated არ არის. მაგრამ CLI-ის `ng generate guard` დღეს
ფუნქციურ გარდს ქმნის და ანგულარის დოკუმენტაციაც ფუნქციურ ვარიანტს
ასწავლის, ამიტომ ახალ კოდში ის უნდა ვამჯობინოთ. ეს სექცია იმისთვისაა,
რომ ძველი კოდი ამოიცნოთ.

გარდის შესაქმნელად ვქმნით
ფაილს რომელსაც კონვენციურად `guard` უნდა ჰქონდეს, ანუ `auth-guard.ts`.
აქ ჩვენ `Injectable` დეკორატორით ვქმნით კლასს, რომელიც იმპლემენტაციას
უკეთებს `CanActivate` ინტერფეისს. ამ ინტერფეისის თანახმად კლასს უნდა ჰქონდეს
`canActivate` მეთოდი. აქაც მეთოდში ხელმისაწვდომია `ActivatedRouteSnapshot`
და `RouterStateSnapshot`. ახლა იგივე პრინციპით
ვიყენებთ `AuthService`-ში არსებულ მეთოდს, რომ ვნახოთ ტოკენს ვადა გაუვიდა
თუ არა, და ამის მიხედვით, ერთი მხრივ მოხმარებელს გადავამისამართებთ და
მეორე მხრივ დავაბრუნებთ ბულიანს, მისამართი გააქტიურდეს თუ არა.

```ts
import { inject, Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { AuthService } from "../services/auth-service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isTokenExpired()) {
      this.router.navigate(["/auth"]);
      return false;
    } else {
      return true;
    }
  }
}
```

ამ კლასს იმავე პრინციპით ვამატებთ როუთინგის კონფიგურაციაში, `canActivate` თვისების მასივში:

```ts
import { Routes } from "@angular/router";
import { Auth } from "./auth/auth";
import { AuthGuard } from "./guards/auth-guard";
import { Logout } from "./logout/logout";
import { ShoppingCart } from "./shopping-cart/shopping-cart";

export const routes: Routes = [
  { path: "auth", component: Auth },
  { path: "logout", component: Logout },
  {
    path: "cart",
    component: ShoppingCart,
    canActivate: [AuthGuard],
  },
  { path: "", redirectTo: "cart", pathMatch: "full" },
];
```

და ასე აპლიკაცია იგივენაირად იმუშავებს.

## შეჯამება

ამ თავში ჩვენ განვიხილეთ `CanActivateFn` ტიპის ფუნქცია და მისი ძველი,
კლასზე დაფუძნებული ვარიანტი. ორივე იმას განსაზღვრავს, მომხმარებელს უნდა
ჰქონდეს თუ არა საშუალება, რომ კონკრეტულ მისამართზე გადავიდეს.
ახალ კოდში ფუნქციური გარდი უნდა გამოვიყენოთ.
