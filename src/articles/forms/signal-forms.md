---
title: "Signal Forms"
---

# Signal Forms

ანგულარს დიდი ხანია ორი ტიპის ფორმა აქვს:
[template-driven](./template-driven.html) და [reactive](./reactive.html).
22-ე ვერსიაში მესამე დაემატა — **Signal Forms**.

ეს არ არის კიდევ ერთი ალტერნატივა "გემოვნების მიხედვით". Reactive Forms
სიგნალებამდე დაიწერა, ამიტომ მას საკუთარი, პარალელური რეაქტიულობის
სისტემა აქვს (`valueChanges`, `statusChanges` — observable-ები).
Signal Forms იმავე ამოცანას იმ ხელსაწყოებით ხსნის, რომლებსაც აპლიკაციის
დანარჩენ ნაწილში უკვე ვიყენებთ.

Signal Forms `@angular/forms/signals`-იდან შემოგვაქვს.

## ოთხი ნაბიჯი

### 1. მოდელი — ჩვეულებრივი სიგნალი

ყველაფერი იწყება სიგნალით, სადაც ფორმის მონაცემები ინახება:

```ts
interface SignupData {
  name: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

signupModel = signal<SignupData>({
  name: "",
  email: "",
  password: "",
  agreeToTerms: false,
});
```

ყურადღება მიაქციეთ: ეს **ჩვეულებრივი ინტერფეისი და ჩვეულებრივი სიგნალია**.
არანაირი `FormGroup`, `FormControl` ან `FormBuilder`. ფორმის მონაცემები
ზუსტად ისე გამოიყურება, როგორც აპლიკაციის სხვა ნებისმიერი მონაცემი.

### 2. `form()` — ველების ხე

მოდელს გადავცემთ `form()` ფუნქციას, რომელიც **field tree**-ს გვიბრუნებს —
ობიექტს, რომელიც ჩვენი მოდელის ფორმას იმეორებს:

```ts
signupForm = form(this.signupModel);
```

```ts
signupForm;          // FieldTree მთელი ფორმისთვის
signupForm.email;    // FieldTree ერთი ველისთვის
```

ეს ხე ავტომატურად აიგება ჩვენი ტიპიდან, ამიტომ `signupForm.emial`
(შეცდომით) ტაიპსკრიპტის ერორს გამოიწვევს. Reactive Forms-ში იგივე შეცდომა
`controls['emial']`-ის სახით მხოლოდ გაშვების დროს გამოჩნდებოდა.

### 3. `[formField]` — ველების მიბმა

HTML-ის ელემენტს ველთან `[formField]` დირექტივა აკავშირებს:

```html
<input type="text" [formField]="signupForm.name" />
<input type="email" [formField]="signupForm.email" />
<input type="password" [formField]="signupForm.password" />
```

ეს **ორმხრივი კავშირია**: მომხმარებლის აკრეფილი ტექსტი ავტომატურად
ხვდება მოდელის სიგნალში.

დირექტივა ველის სხვა მდგომარეობასაც სინქრონიზებს — `required`, `disabled`,
`readonly` ატრიბუტები ავტომატურად დაისმება, სადაც საჭიროა.

ის ყველა სტანდარტულ ტიპთან მუშაობს:

```html
<!-- რიცხვი ავტომატურად კონვერტირდება number ტიპში -->
<input type="number" [formField]="form.age" />

<!-- თარიღი ინახება YYYY-MM-DD სტრინგად, დრო — HH:mm -->
<input type="date" [formField]="form.eventDate" />

<textarea [formField]="form.message" rows="4"></textarea>

<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  I agree to the terms
</label>
```

### 4. მდგომარეობის წაკითხვა

ხის ნებისმიერ კვანძს **ფუნქციასავით ვეძახებთ** და მდგომარეობის ობიექტს
ვიღებთ, სადაც ყველაფერი სიგნალია:

```ts
signupForm();          // მთელი ფორმის მდგომარეობა
signupForm.email();    // ერთი ველის მდგომარეობა
```

```html
<p>Form value: {{ signupForm().value() | json }}</p>
<p>Email: {{ signupForm.email().value() }}</p>
<p>Valid: {{ signupForm().valid() }}</p>
```

მნიშვნელობის პროგრამულად შეცვლა `value.set()`-ით ხდება:

```ts
this.signupForm.email().value.set("alice@wonderland.com");
```

ეს **ორივეს** ანახლებს — ველსაც და თავდაპირველ მოდელის სიგნალსაც.

## ვალიდაცია

ვალიდაცია `form()`-ის **მეორე არგუმენტში**, ე.წ სქემის ფუნქციაში იწერება:

```ts
import { email, form, minLength, required } from "@angular/forms/signals";

signupForm = form(this.signupModel, (schemaPath) => {
  required(schemaPath.name, { message: "Please choose a name" });

  required(schemaPath.email, { message: "Email is required" });
  email(schemaPath.email, { message: "Must be a valid email" });

  required(schemaPath.password, { message: "Password cannot be empty" });
  minLength(schemaPath.password, 12, {
    message: "Password must be at least 12 characters",
  });
});
```

სქემის ფუნქცია **ერთხელ** გაეშვება, ფორმის ინიციალიზაციისას. ის პარამეტრად
`schemaPath` ობიექტს იღებს, რომელიც ყველა ველზე მიგვითითებს (სახელი
ნებისმიერი შეიძლება იყოს).

ჩაშენებული წესებია `required()`, `email()`, `min()`, `max()`,
`minLength()`, `maxLength()`, `pattern()`.

ვალიდაცია **ავტომატურად ეშვება** ყოველ ცვლილებაზე. ის არ ჩერდება პირველ
შეცდომაზე — თუ ველს ორივე წესი აქვს, ორივე გაეშვება და ორივემ შეიძლება
ერორი დააბრუნოს.

### ერორების გამოტანა

ველის მდგომარეობაში `errors()` სიგნალია, სადაც ერორების მასივია. თითოეულ
ერორს აქვს `kind` (რომელი წესი ჩავარდა) და არასავალდებულო `message`:

```html
<label>
  Name
  <input type="text" [formField]="signupForm.name" />
</label>

@if (signupForm.name().touched() && signupForm.name().invalid()) {
  @for (error of signupForm.name().errors(); track error.kind) {
    <span class="error">{{ error.message }}</span>
  }
}
```

`touched()` შემოწმება იმისთვისაა, რომ ერორები მაშინვე არ გამოჩნდეს —
მომხმარებელს ჯერ ველთან შეხება უნდა ჰქონდეს. [Template-driven
ფორმებში](./template-driven.html) ამისთვის `pristine`-ს ვიყენებდით.

### ბრაუზერის ვალიდაცია არ გამოიყენება

Signal Forms **განზრახ** არ ეყრდნობა ბრაუზერის ჩაშენებულ ვალიდაციას.
მიზეზი ისაა, რომ ფორმის კონტროლი შეიძლება ნებისმიერი კომპონენტი იყოს,
და არა მხოლოდ native `<input>`.

`required()`, `min()`, `max()`, `minLength()`, `maxLength()` სათანადო
HTML ატრიბუტებს მაინც აყენებენ — მაგრამ ეს **ხელმისაწვდომობისთვისაა**
(screen reader-ებისთვის), და არა ვალიდაციის გასაშვებად.

აქედან გამომდინარე: `:valid` და `:invalid` CSS ფსევდო-კლასებს **ნუ
დაეყრდნობით**. სტილიზაციისთვის კლასები ველის სიგნალებზე მიაბით:

```html
<input [formField]="signupForm.email" [class.is-invalid]="signupForm.email().invalid()" />
```

## ფორმის გაგზავნა

გაგზავნისას რამდენიმე რამ ერთდროულად უნდა მოხდეს: ერორები გამოჩნდეს,
ორმაგი გაგზავნა აღიკვეთოს, მონაცემი სერვერს გაეგზავნოს. ამას `submission`
ოფცია და `FormRoot` დირექტივა აგვარებს.

```ts
import { Component, signal } from "@angular/core";
import { form, FormField, FormRoot, required } from "@angular/forms/signals";

@Component({
  selector: "app-signup",
  imports: [FormField, FormRoot],
  templateUrl: "./signup.html",
})
export class Signup {
  signupModel = signal({ name: "", email: "" });

  signupForm = form(
    this.signupModel,
    (schemaPath) => {
      required(schemaPath.name);
      required(schemaPath.email);
    },
    {
      submission: {
        action: async (field) => {
          const result = await saveUser(field().value());
          if (result.ok) return;

          return { kind: "serverError", message: "Failed to submit form" };
        },
      },
    }
  );
}
```

```html
<form [formRoot]="signupForm">
  <input [formField]="signupForm.name" />
  <input [formField]="signupForm.email" />

  <button type="submit" [disabled]="signupForm().submitting()">Register</button>
</form>
```

`FormRoot` სამ საქმეს აკეთებს ავტომატურად: `novalidate` ატრიბუტს აყენებს,
ბრაუზერის ნაგულისხმევ ქცევას აჩერებს (გვერდი არ გადაიტვირთება) და
გაგზავნისას `submit()`-ს იძახებს.

გაგზავნის თანმიმდევრობა ასეთია:

1. ყველა ინტერაქტიული ველი აღინიშნება როგორც `touched` — ანუ დამალული
   ერორები გამოჩნდება
2. ვალიდაცია მოწმდება. თუ რამე ჩავარდა, **`action` საერთოდ არ გაეშვება**
3. `action` ეშვება. მისი მუშაობის განმავლობაში `submitting()` აბრუნებს `true`-ს
4. თუ `action` ერორს დააბრუნებს, ის სათანადო ველს მიენიჭება

`action`-ის პარამეტრი არის თვითონ field tree, ამიტომ მნიშვნელობას
`field().value()`-ით ვკითხულობთ.

ერორის კონკრეტულ ველზე მისამართებისთვის `fieldTree` თვისებას ვამატებთ:

```ts
action: async (field) => {
  const result = await saveUser(field().value());
  if (result.ok) return;

  return { kind: "taken", message: result.message, fieldTree: field.email };
};
```

## რომელი ფორმა ავირჩიოთ

| | Signal Forms | Reactive | Template-driven |
|---|---|---|---|
| სტატუსი | Stable (v22+) | Stable | Stable |
| სთეითი | სიგნალები | observable-ები | თემფლეითის ცვლადები |
| მოდელი | ჩვეულებრივი ინტერფეისი | `FormGroup`/`FormControl` | ობიექტი + `ngModel` |
| ვალიდაცია | სქემის ფუნქცია | ვალიდატორების მასივი | თემფლეითის ატრიბუტები |

**ახალი პროექტისთვის Signal Forms ლოგიკური არჩევანია** — განსაკუთრებით
თუ აპლიკაციის დანარჩენი ნაწილი უკვე სიგნალებზეა.

**Reactive Forms არსად არ მიდის.** ის stable-ია, მასზე უამრავი პროექტია
აშენებული და ანგულარი მას მხარდაჭერას აგრძელებს. არსებული ფორმების
გადაწერა მხოლოდ იმიტომ, რომ ახალი API გამოჩნდა, საჭირო არ არის.

**Template-driven** კვლავ ყველაზე მოკლე გზაა ძალიან პატარა ფორმებისთვის.
