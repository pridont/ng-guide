---
title: "Routing & Lazy-loading"
---

# Routing & Lazy-loading

`NgModule`-ების გარეშე რაუთერს გამარტივებული API აქვს.
რაუთების შექმნა ცალკე ფაილში ხდება:

```ts
import { Routes } from "@angular/router";
import { AdminPanel } from "./admin/admin-panel";

export const routes: Routes = [
  { path: "admin", component: AdminPanel },
  // ... other routes
];
```

CLI-ით შექმნილ პროექტში ეს ფაილი `app.routes.ts`-ია. მისი დარეგისტრირება
`app.config.ts`-ში, პროვაიდერების მასივში ხდება, `provideRouter` ფუნქციით:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
};
```

**შენიშვნა:** ძველ მასალაში `provideRouter`-ის დაძახებას პირდაპირ
`main.ts`-ში, `bootstrapApplication`-ის მეორე არგუმენტში ნახავთ. ეს კვლავ
მუშაობს, მაგრამ CLI დღეს კონფიგურაციას ცალკე `app.config.ts` ფაილში
გამოყოფს, რაც უფრო სუფთაა.

## Lazy-loading

შესაძლებელია რაუთების "ზარმაცად" ჩატვირთვაც — ანუ კომპონენტის კოდი
ბრაუზერში მხოლოდ მაშინ ჩამოიტვირთება, როცა მომხმარებელი ამ მისამართზე
გადავა. ამისთვის `component`-ის ნაცვლად `loadComponent` გამოიყენება:

```ts
export const routes: Routes = [
  {
    path: "admin",
    loadComponent: () =>
      import("./admin/admin-panel").then((mod) => mod.AdminPanel),
  },
  // ...
];
```

თუ რამდენიმე რაუთის ერთად "ზარმაცად" ჩატვირთვა გვინდა, შეგვიძლია ცალკე რაუთების
ფაილის დაიმპორტება `loadChildren`-ით:

```ts
// მთავარ აპლიკაციაში:
export const routes: Routes = [
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.routes").then((mod) => mod.adminRoutes),
  },
  // ...
];
```

```ts
// admin/admin.routes.ts:
import { Routes } from "@angular/router";
import { AdminHome } from "./admin-home";
import { AdminUsers } from "./admin-users";

export const adminRoutes: Routes = [
  { path: "home", component: AdminHome },
  { path: "users", component: AdminUsers },
  // ...
];
```

## რაუთების ჯგუფისთვის სერვისის მიწოდება

თუ არსებობს სერვისი, რომელიც გვინდა რომ მხოლოდ `/admin`-ის ფარგლებში
ფუნქციონირებდეს, ეს შეგვიძლია რაუთების სიაშივე გავაკეთოთ, `providers` თვისებით:

```ts
export const routes: Routes = [
  {
    path: "admin",
    providers: [AdminService, { provide: ADMIN_API_KEY, useValue: "12345" }],
    children: [
      { path: "users", component: AdminUsers },
      { path: "teams", component: AdminTeams },
    ],
  },
  // ... other application routes that don't
  //     have access to ADMIN_API_KEY or AdminService.
];
```

აქ `admin` რაუთსა და მის შვილებს (`children`-ში არსებულ რაუთებს) წვდომა აქვთ
`AdminService`-სა და `ADMIN_API_KEY`-ზე. აპლიკაციის დანარჩენ ნაწილს — არა.

ეს კარგად ერწყმის lazy-loading-ს: `admin` სექციის სერვისი მაშინ იქმნება,
როცა მომხმარებელი ამ სექციაში შედის, და არა აპლიკაციის გაშვებისთანავე.
