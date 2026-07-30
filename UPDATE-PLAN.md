# ng-guide განახლების გეგმა (Angular v17 → v22)

წყარო: `.temp/adev` (angular.dev-ის კოდი, Angular **v22**).
სამიზნე: `src/articles/` — 73 ფაილი, ~8900 ხაზი, 30 გაკვეთილი.

დადასტურებული baseline (`npx @angular/cli@22 new`, 2026-07-29):
TypeScript `~6.0.2` · RxJS `~7.8` · Vitest `^4.0.8` · jsdom `^28` ·
**zone.js საერთოდ არ არის dependency-ებში**.

---

## 1. მიმდინარე მდგომარეობის დიაგნოზი

წიგნი დაფიქსირებულია **Angular v17**-ზე. `introduction/creating-component.md`
პირდაპირ წერს "მე-17 ვერსიაში სტანდარტიზირებულ standalone კომპონენტებს".
მას შემდეგ 4 major ვერსია გავიდა.

გრეპის შედეგები (ფაილების რაოდენობა, სადაც პატერნი გვხვდება):

| ძველი პატერნი | ფაილი | v21 შემცვლელი |
|---|---|---|
| `standalone: true` ხელით ჩაწერილი | 31 | წაშლა (v19-დან default) |
| `imports: [CommonModule]` | 28 | წაშლა (`@if`/`@for`-ს არ სჭირდება) |
| `app.component.ts` სახელები | 23 | `app.ts` / `user-profile.ts` (v20 style guide) |
| `*ngFor` | 13 | `@for (… ; track …)` |
| `constructor(private …)` | 13 | `inject()` |
| `subscribe(...)` კომპონენტში | 13 | `httpResource` / `resource` / `toSignal` |
| `ngOnInit` | 11 | `input()` + `computed` + `resource` |
| `*ngIf` | 10 | `@if` |
| `NgModule` | 6 | legacy-სექციად დარჩეს |
| `BehaviorSubject` (state) | 4 | `signal` / `linkedSignal` |
| `@Input` | 4 | `input()` / `input.required()` |
| `@Output` + `EventEmitter` | 3 | `output()` |
| `@HostListener` | 2 | `host: {…}` ობიექტი |
| class-based `CanActivate` | 3 | functional `CanActivateFn` |
| Karma + Jasmine | 1 (tests) | **Vitest** (v21-ში default) |

მოდერნული API-ს დაფარვა დღეს: `signal` — 1 ფაილი, `inject` — 3,
`input()`/`output()`/`toSignal`/`resource`/`httpResource`/`linkedSignal`/
`viewChild`/`@defer`/`@let` — **0 ფაილი**.

`@if`/`@for`/`@switch` მხოლოდ `control-flow/index.md`-შია — დანარჩენი
წიგნი მაინც `*ngIf`-ით წერს. ანუ გაკვეთილი ეწინააღმდეგება მაგალითებს.

`index.md` `angular.io`-ზე ლინკავს — ეს დომენი angular.dev-ზე რედირექტდება.

---

## 2. ძირითადი სტრუქტურული პრობლემა

სარჩევში სიგნალები არიან **"ბონუსებში"**, 99 ხაზზე. v21-ში სიგნალი არის
ფრეიმვორქის ბირთვი: reactivity, inputs, outputs, queries, forms, data fetching —
ყველაფერი სიგნალზეა. RxJS კი გადავიდა interop როლში.

წიგნის ხერხემალი დღეს: RxJS + `BehaviorSubject` + `subscribe`.
v21-ის ხერხემალი: `signal` + `resource` + zoneless.

ეს არ არის მარტივი find/replace — თავების **რიგი** უნდა შეიცვალოს.

---

## 3. გეგმა — 5 ფაზა

### ფაზა 0. საფუძველი (blocking, ~1 დღე)

ყველა შემდეგი ფაზა ამაზეა დამოკიდებული.

1. `ng new`-ით v21 პროექტის აწყობა → რეალური ფაილების ხე გადმოწერა
   `introduction/getting-started.md`-ისთვის (ახლა იქ v17-ის ხე წერია:
   `app.component.css`, `assets/` — v21-ში ეს აღარ ასეა).
2. სტილის კონვენციის დაფიქსირება მთელი წიგნისთვის:
   - ფაილი: `user-profile.ts`, არა `user-profile.component.ts`
   - კლასი: `UserProfile`, არა `UserProfileComponent`
   - `inject()` ყოველთვის, `constructor` DI არასდროს
   - `@if`/`@for`/`@switch` ყოველთვის
   - `standalone: true` არასდროს არ იწერება
   - `imports: []` მხოლოდ მაშინ, როცა რეალურად რაღაც შემოგვაქვს
   - self-closing tags: `<app-child />`
3. ეს კონვენცია ჩაიწეროს `CLAUDE.md`-ში ან `CONTRIBUTING.md`-ში.

### ფაზა 1. მექანიკური სვიპი (~2 დღე)

მთელ `src/articles/`-ზე, გაკვეთილის ტექსტის შეცვლის გარეშე:

- `standalone: true,` ხაზების წაშლა — 31 ფაილი
- `imports: [CommonModule]` წაშლა + `CommonModule` იმპორტის წაშლა — 28 ფაილი
- `*ngIf="x"` → `@if (x) { … }`, `*ngFor="let a of b"` → `@for (a of b; track a.id)` — 20 ფაილი
- `constructor(private x: X) {}` → `private x = inject(X);` — 13 ფაილი
- ფაილის სახელები `.component.ts` → `.ts`, კლასები `XComponent` → `X` — 23 ფაილი
- `angular.io` ლინკები → `angular.dev`

**გაფრთხილება:** ეს ვერიფიკაციას მოითხოვს. `@for`-ს `track` სავალდებულო აქვს —
ბლაინდ sed-ი გატეხილ კოდს დაწერს. თითო ფაილი ხელით უნდა გადაიხედოს.

### ფაზა 2. ბირთვის გადაწერა (~1 კვირა)

ეს გაკვეთილები არსებითად უნდა გადაიწეროს, არა დაილაგოს:

| გაკვეთილი | რა ხდება |
|---|---|
| `data-binding/input-output.md` | `@Input`/`@Output`/`EventEmitter` → `input()`/`input.required()`/`output()`. `ngOnChanges` სექცია იშლება — მის ადგილს იკავებს `computed` + `effect`. |
| `data-binding/two-way-binding.md` | `model()` სიგნალი (`[(value)]` შვილზე) დაემატოს. |
| `signals/index.md` | 99 ხაზიდან სრულფასოვან თავად. დაემატოს: `linkedSignal`, `resource`, `untracked`, `effect` cleanup, reactive context-ის წესები, `toSignal`/`toObservable`. |
| `at-host/index.md` | `@HostListener`/`@HostBinding` → `host: {}` ობიექტი. სათაური იცვლება: "Host Elements". |
| `http/index.md` | `subscribe` + manual state → `httpResource`. `HttpClient` რჩება მაგრამ როგორც low-level API. `interceptors` (functional) დაემატოს. |
| `authentication/can-activate.md` | class-based `CanActivate` → `CanActivateFn` + `inject()`. |
| `tests/index.md` | Karma/Jasmine → **Vitest**. `ng test`-ის output იცვლება. Karma დარჩეს ერთი აბზაცით, როგორც legacy. |
| `authentication/*` | `@auth0/angular-jwt` მთლიანად ამოვარდება — მაგალითი თვითკმარი ხდება. დეტალები ქვემოთ. |
| `standalone/*` (3 ფაილი) | თავი აღარ არის საჭირო — standalone default-ია. Routing/lazy-loading ნაწილი გადავიდეს `routing/`-ში, დანარჩენი წაიშალოს. |
| `state-management/*` (7 ფაილი) | მთელი თავი `BehaviorSubject`-ზეა. გადაიწეროს signal-based store-ზე (`signal` + `computed` + `resource`). RxJS ვერსია დარჩეს ცალკე დანართად. |
| `ng-modules/index.md` | დარჩეს, მაგრამ გადავიდეს "Legacy" სექციაში, გაფრთხილებით. |
| `directives/structural-directives.md` | `*ngIf`/`*ngFor` აღწერა → `@if`/`@for`. custom structural directive-ის ნაწილი (`ng-template`) რჩება. |

### ფაზა 2ბ. JWT თავის თვითკმარად გადაკეთება

**რატომ.** `authentication/` თავი დამოკიდებულია `@auth0/angular-jwt`-ზე.
სამი პრობლემა:

1. **მოძველებული ინტეგრაცია.** `JwtModule.forRoot()` `NgModule`-ია, ამიტომ
   თავი იძულებულია დაწეროს `importProvidersFrom(...)` +
   `provideHttpClient(withInterceptorsFromDi())` — ორივე legacy ხიდია
   standalone-ის სამყაროში. მკითხველი სწავლობს ხიდს, არა ანგულარს.
2. **ბიბლიოთეკა მალავს გაკვეთილს.** თავის რეალური თემა ორი რამეა:
   HTTP interceptor-ი და ტოკენის ვადის შემოწმება. ორივე ~30 ხაზი კოდია.
   ბიბლიოთეკა მათ შავ ყუთად აქცევს.
3. **გარე დამოკიდებულება ძველდება.** წიგნის ვერსია მასზეც არის მიბმული.

**რა შეიცვლება.** თავის სტრუქტურა, ტექსტი და მაგალითის აპლიკაცია
**უცვლელი რჩება** (dummyjson.com login, shopping cart, guard).
იცვლება მხოლოდ ბიბლიოთეკის ორი შემხებლობის წერტილი.

#### 1. `JwtModule` → functional interceptor

ახალი ფაილი `auth.interceptor.ts`:

```ts
import { HttpInterceptorFn } from "@angular/common/http";

const ALLOWED_HOSTS = ["dummyjson.com"];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("access_token");
  const host = new URL(req.url, document.baseURI).hostname;

  if (!token || !ALLOWED_HOSTS.includes(host)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
```

`app.config.ts` ამის შემდეგ:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

ეს `importProvidersFrom`-ს და `withInterceptorsFromDi`-ს მთლიანად აშორებს.
`ALLOWED_HOSTS` პირდაპირ ცვლის ბიბლიოთეკის `allowedDomains` კონფიგურაციას —
ის იმისთვისაა, რომ ტოკენი შემთხვევით მესამე მხარის დომეინზე არ გაიგზავნოს.

#### 2. `JwtHelperService` → `jwt.ts`

ახალი ფაილი `jwt.ts`, ორი ფუნქციით:

```ts
export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [claim: string]: unknown;
}

/** Decodes a JWT payload. Returns null if the token is malformed. */
export function decodeToken(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    // JWT uses base64url; atob expects standard base64.
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** A missing, malformed or `exp`-less token counts as expired. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeToken(token);
  if (!payload?.exp) {
    return true;
  }

  // `exp` is in seconds since epoch, Date.now() in milliseconds.
  return payload.exp * 1000 <= Date.now();
}
```

`AuthService`-ში `private jwtHelper = inject(JwtHelperService);` ქრება და
`isTokenExpired` ასე ხდება:

```ts
isTokenExpired() {
  return isTokenExpired(localStorage.getItem("access_token"));
}
```

`canActivate` უცვლელი რჩება.

#### სასწავლო მოგება

ეს ცვლილება თავს **ამატებს** მასალას და არაფერს აკლებს:

- functional `HttpInterceptorFn` — v22-ის რეკომენდირებული ფორმა, რომელიც
  წიგნში ამჟამად საერთოდ არ არის (ეს `http` თავშიც გამოგვადგება)
- `req.clone({ setHeaders })` — `HttpRequest`-ის უცვლელობის (immutability) ჩვენება
- რა არის რეალურად JWT: სამი base64url სეგმენტი, და რატომ **არ** არის
  კლიენტზე დეკოდირება ვალიდაცია (ხელმოწერას ვერ ვამოწმებთ — ეს სერვერის საქმეა).
  ეს უსაფრთხოების მნიშვნელოვანი შენიშვნაა, რომელსაც ბიბლიოთეკა მალავს
- `exp` წამებშია, `Date.now()` მილიწამებში

#### გასათვალისწინებელი

- `atob` მუშაობს მხოლოდ latin1-ზე, ამიტომ `decodeURIComponent`-ის ხრიკი
  სავალდებულოა — ტოკენში UTF-8 claim-ები (მაგ. ქართული სახელი) სხვა
  შემთხვევაში დაზიანდება.
- `localStorage` XSS-ის მიმართ მოწყვლადია. ეს ბიბლიოთეკის შემთხვევაშიც
  ასე იყო, მაგრამ თვითკმარ იმპლემენტაციაში ამის აღნიშვნა უფრო
  ბუნებრივია: production-ში `httpOnly` cookie-ს განიხილავენ.
- `ALLOWED_HOSTS` შედარება hostname-ზე უნდა იყოს, არა `url.includes()`-ზე —
  სხვაგვარად `https://evil.com/?x=dummyjson.com` ტესტს გაივლიდა.

#### ვერიფიკაციის სტატუსი

ზემოთ მოცემული კოდი **უკვე შემოწმებულია**: v22 პროექტში `ng build` სუფთად
გაირბინა, ხოლო `decodeToken`/`isTokenExpired` node-ზე გატესტდა ექვს
სცენარზე (ვალიდური, ვადაგასული, `exp`-ის გარეშე, `null`, გაფუჭებული,
ორსეგმენტიანი) + UTF-8 claim-ზე. ყველა გავიდა.

### ფაზა 3. ახალი გაკვეთილები (~2 კვირა)

v21-ის მთავარი თემები, რომლებიც წიგნში **საერთოდ არ არის**:

**პრიორიტეტი A (ბირთვი, აუცილებელი):**
1. `@defer` — deferrable views (`guide/templates/defer.md`)
2. `@let` — template variables (`guide/templates/variables.md`)
3. Signal queries — `viewChild`/`viewChildren`/`contentChild` (`guide/components/queries.md`)
4. `resource` / `httpResource` — async reactivity (`guide/signals/resource.md`)
5. `linkedSignal` (`guide/signals/linked-signal.md`)
6. Zoneless change detection (`guide/zoneless.md`) — v21-ში default
7. RxJS interop — `toSignal`/`toObservable`/`rxResource` (`ecosystem/rxjs-interop/`)

**პრიორიტეტი B (მნიშვნელოვანი):**
8. Signal Forms — `form()`, `[formField]`, schemas, validation
   (`guide/forms/signals/*` — 16 ფაილი adev-ში, production ready)
9. SSR + Hydration + Incremental hydration (`guide/ssr.md`, `guide/incremental-hydration.md`)
10. Route data resolvers + functional guards (`guide/routing/data-resolvers.md`, `route-guards.md`)
11. Content projection — `ng-content` (`guide/templates/ng-content.md`) — დღეს არ არის
12. Component lifecycle სრულად (`guide/components/lifecycle.md`)

**v22-ის სპეციფიკური ცვლილებები (ყველგან უნდა აისახოს):**
- `ChangeDetectionStrategy.OnPush` — **default** v22-დან. წიგნში `OnPush`
  როგორც "ოპტიმიზაცია" აღარ უნდა იყოს ნახსენები.
- Optional chaining `?.` თემფლეითში — v22-მდე `null`-ს აბრუნებდა,
  ახლა სტანდარტული JS-ივით `undefined`-ს.
- `provideBrowserGlobalErrorListeners()` — ახალი `app.config.ts`-ში.
- zone.js საერთოდ აღარ არის დამოკიდებულება.

**პრიორიტეტი C (სასურველი):**
13. Angular Aria — 8 headless a11y pattern (v22-ში stable)
14. `animate.enter` / `animate.leave` — ახალი CSS-based animations
15. Image optimization — `NgOptimizedImage`
16. Accessibility (`best-practices/a11y.md`)
17. Error handling (`best-practices/error-handling.md`)
18. Performance / `@defer` + `ChangeDetectionStrategy.OnPush`
19. AI-assisted Angular — `llms.txt`, Angular MCP server, agent skills (`ai/*`)

### ფაზა 4. სარჩევის რესტრუქტურიზაცია (~1 დღე)

`src/includes/partials/SUMMARY.md` — ახალი რიგი:

```
### საფუძვლები
- შესავალი (ინსტალაცია → კომპონენტი → ინტერპოლაცია)
- Templates (binding, control flow @if/@for/@switch, @let, ng-content, @defer)
- Signals            ← "ბონუსებიდან" აქ ამოდის
- Components (input/output/model, queries, host, lifecycle)
- Directives
- Pipes
- Dependency Injection

### აპლიკაციის აწყობა
- Routing (+ data resolvers, functional guards, lazy loading)
- Forms (Signal Forms → Reactive → Template-driven)
- HTTP (httpResource → HttpClient → interceptors)
- State Management სიგნალებით
- Authentication

### გაფართოებული
- Zoneless
- SSR & Hydration
- Testing (Vitest)
- i18n
- Deployment
- Performance & a11y

### RxJS (interop)
- RxJS საფუძვლები
- toSignal / toObservable / rxResource
- State Management RxJS-ით (legacy დანართი)

### Legacy
- NgModule
- Karma
- @Input/@Output დეკორატორები

### ბონუსები
- TypeScript
- AI-თი მუშაობა Angular-ზე
```

---

## 4. რისკები

- **წიგნის ტონი.** ტექსტი ქართულია და ავტორის ხმით დაწერილი. LLM-ით მასობრივი
  გადაწერა ტონს გატეხავს. ჯობია: კოდის ბლოკები ავტომატურად, ტექსტი ხელით.
- **`track` ექსპრესია.** `@for`-ს სავალდებულო აქვს. ყოველი მიგრირებული `*ngFor`
  ინდივიდუალურ გადაწყვეტილებას მოითხოვს (`track item.id` vs `track $index`).
- **Signal Forms.** v22-ში **stable**. Reactive Forms არსად არ მიდის —
  ორივე უნდა დარჩეს, სწორი პოზიციონირებით.
- **Angular Aria.** v22-ში **stable** (v21-ში იყო developer preview).
- **`.temp/adev` მოძველდება.** v22.1 იგეგმება 2026-07-27-ის კვირაზე.
  v22-დან Angular-მა 6-თვიანი major ციკლი მიატოვა.

---

## 5. ვერიფიკაცია

განახლების შემდეგ ეს გრეპები **ნულს** უნდა აბრუნებდეს `src/articles/`-ზე
(გარდა Legacy სექციისა):

```sh
grep -rn "standalone: true" src/articles/
grep -rn "CommonModule" src/articles/
grep -rn '\*ngIf\|\*ngFor' src/articles/
grep -rn "constructor(private" src/articles/
grep -rn "EventEmitter" src/articles/
grep -rn "angular.io" src/articles/
grep -rn "\.component\.ts" src/articles/
```

დამატებით: ყოველი გაკვეთილის კოდი უნდა გაეშვას რეალურ v21 პროექტში.
რეკომენდაცია — `examples/` ფოლდერი რეპოში, თითო თავის მუშა კოდით.

---

## 6. შეთავაზებული რიგი

| ნაბიჯი | ფაზა | ეფექტი |
|---|---|---|
| 1 | ფაზა 0 + ფაზა 1 | წიგნი მაშინვე v22-ად გამოიყურება, ტექსტი უცვლელი |
| 2 | ფაზა 2 (input/output, signals, host, tests) | ბირთვი სწორდება |
| 3 | ფაზა 2ბ (JWT თვითკმარობა) | გარე დამოკიდებულება ქრება, interceptor-ი ჩნდება |
| 4 | ფაზა 3 პრიორიტეტი A | ძირითადი ხარვეზები იკეტება |
| 5 | ფაზა 4 | ნავიგაცია ლოგიკური ხდება |
| 6 | ფაზა 2 (state-management) + ფაზა 3 B/C | სიღრმე |

ფაზა 2ბ ფაზა 2-ის მერე დგას იმიტომ, რომ `http` თავში interceptor-ის სექცია
ჯერ უნდა არსებობდეს — JWT თავმა მასზე უნდა მიუთითოს, არა თავიდან ასწავლოს.
