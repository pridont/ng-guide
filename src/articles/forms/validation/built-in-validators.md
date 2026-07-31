---
title: "ჩაშენებული ვალიდატორები"
---

# ჩაშენებული ვალიდატორები

ჯერ განვიხილოთ ანგულარში არსებული ვალიდატორები. ჩვენი პროექტი ასე გამოიყურება:
გვაქვს შექმნილი SignupForm, სადაც გვაქვს მარტივი კონტროლების ჯგუფი,
რომელიც დაკავშირებულია თემფლეითთან.

```ts
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-signup-form",
  imports: [ReactiveFormsModule],
  templateUrl: "./signup-form.html",
  styleUrl: "./signup-form.css",
})
export class SignupForm {
  private fb = inject(FormBuilder);

  signupForm = this.fb.group({
    name: [""],
    email: [""],
    password: [""],
  });

  onSubmit() {
    console.log(this.signupForm.value);
  }
}
```

```html
<form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
  <div class="form-block">
    <label for="name">Name</label>
    <input type="text" id="name" formControlName="name" />
  </div>
  <div class="form-block">
    <label for="email">Email</label>
    <input type="email" id="email" formControlName="email" />
  </div>
  <div class="form-block">
    <label for="password">Password</label>
    <input type="password" id="password" formControlName="password" />
  </div>
  <button type="submit">Submit</button>
</form>
<div>
  <h3>Result:</h3>
  <div>{{ signupForm.value | json }}</div>
</div>
```

ვალიდატორებს ჩვენ ფორმის კონტროლის შექმნისას ვარეგისტრირებთ. ვაიმპორტებთ
`Validators` კლასს, და აქედან ვარჩევთ სასურველ ვალიდატორს:

```ts
signupForm = this.fb.group({
  name: ["", Validators.required],
  email: ["", [Validators.required, Validators.email]],
  password: ["", Validators.required],
});
```

მასივში პირველი ელემენტის შემდეგ შეგვიძლია ვალიდატორის დამატება.
აქვე გზად `email` კონტროლს `email` ვალიდატორიც მივცეთ.
თუ ვალიდატორი ერთზე მეტია, ისინი ცალკე მასივში უნდა მოთავსდნენ.
ახლა, ყოველ
ცვლილებაზე კონტროლებში, ანგულარი ამ ვალიდატორებით შეამოწმებს კონტროლების
ვალიდურობას და მთლიან ჯგუფს მიანიჭებს `valid` და `invalid` თვისებებზე რაიმე
ბულიან მნიშვნელობას. required ვალიდატორი საჭიროებს რომ ველი არ იყოს ცარიელი.
იმეილის ვალიდატორი საჭიროებს იმეილის პატერნს.

საპასუხოდ შეგვიძლია ღილაკი ჩავაქროთ `disabled` თვისებაზე ბაინდინგით, თუკი მთლიანი
ჯგუფი არის invalid. თუ ერთი კონტროლი მაინც არ არის ვალიდური, მთლიანი ჯგუფიც არავალიდურია.

```html
<button type="submit" [disabled]="signupForm.invalid">Submit</button>
```

არის უფრო ზოგადი ხასიათის ვალიდატორიც, სახელად `pattern`. მასში მივუთითოთ ის სასურველი
პატერნი, რომელსაც მომხმარებლის შეყვანილი ინფორმაცია უნდა ექვემდებარებოდეს. მასში შეგვიძლია
სტრინგის მიწოდება, და შედეგად შეყვანილი ინფორმაცია უნდა შეიცავდეს ამ სტრინგს. ასევე შეგვიძლია
ამ ვალიდატორში რეგექსის გამოყენება.

```ts
signupForm = this.fb.group({
  name: ["", [Validators.required, Validators.pattern(/^[A-z]/)]],
  email: ["", [Validators.required, Validators.email]],
  password: ["", Validators.required],
  confirmPassword: ["", Validators.required],
});
```

სახელს ვაძლევთ ვალიდატორს, სადაც მხოლოდ ისეთ ტექსტს დავუშვებთ, რომელიც
არ იწყება რიცხვით ან სხვა განსაკუთრებული სიმბოლოთი, გარდა უბრალო ასოებისა.

ასევე არსებობს `minLength`/`maxLength` ვალიდატორებიც, რომლებიც სტრინგის
მინიმალურ და მაქსიმალურ ზომას გულისხმობენ.

```ts
name: ["", [Validators.required, Validators.pattern(/^[A-z]/), Validators.minLength(2)]],
```

აქ მივუთითებთ, რომ სახელი ორ ასოზე მოკლე არ უნდა იყოს.

## errors თვისება

ვალიდაციის ერორის არსებობის შემთხვევაში თითოეული ვალიდატორი უნიკალურ თვისებას ამატებს
კონტროლის ინსტანციის `errors` თვისებაზე. მაგალითად, `Validators.minLength` ვალიდატორს,
არავალიდურობის შემთხვევაში, შეუძლია კონტროლს მიანიჭოს `controls.errors.minLength` თვისებაზე
ობიექტი. ვალიდატორის სახელი ემთხვევა ერორის თვისების სახელს. ობიექტის თვისებები დამოკიდებულია
თვითონ ვალიდატორზე, ამიტომ უშუალოდ ამ ვალიდატორის დოკუმენტაციას ან იმპლემენტაციას
უნდა ჩახედოთ.
