---
title: "Reactive Forms"
---

# Reactive Forms

რეაქტიული ფორმების გამოსაყენებლად საჭიროა `ReactiveFormsModule`-ის
დაიმპორტება `@angular/forms`-დან და მისი იმპორტების სიაში დამატება სათანადო
კომპონენტში ან მოდულში.

## მარტივი კონტროლი

სასრულველ კომპონენტში, სადაც ფორმა გვექნება, ჩვენ უნდა შევქმნათ
კონტროლები. შესაძლებელია თითოეული ველისთვის `FormControl` ინსტანციის შექმნა.
აქ ჩვენ კოპმონენტში ვქმნით ახალ კონტროლს, სადაც მომხმარებლის სახელს შევინახავთ.

```ts
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

@Component({
  selector: "app-signup-form",
  imports: [ReactiveFormsModule],
  templateUrl: "./signup-form.html",
  styleUrl: "./signup-form.css",
})
export class SignupForm {
  name = new FormControl("");
}
```

ფორმა ჩვეულებრივ იწყობა. განსხვავება ის არის, რომ ჩვენ `formControl`
თვისებაზე ახლა property binding-ით ვაწვდით ჩვენი `FormControl`-ის ინსტანციას.

```html
<form>
  <div class="form-block">
    <label for="name">Name</label>
    <input type="text" id="name" [formControl]="name" />
  </div>
</form>
<div>
  <h3>Result:</h3>
  <div>{{ name.value }}</div>
</div>
```

დანარჩენს ანგულარი თავისით აგვარებს და კონტროლის თვისებებს მოდიფიკაციას
უკეთეს შეყვანილი მნიშვნელობების მიხედვით. შეყვანილ მნიშვნელობის სნეპშოტს ვწვდებით
კონტროლზე `value` თვისებით, რომელსაც გამოვსახავთ თემფლეითში.

### კონტროლთა ჯგუფი

ხშირად ჩვენ ფორმაში ერთზე მეტი კონტროლი გვექნება. შესაძლებელია ცალკეული
კონტროლების ინსტანციების შექმნა და მათი დაკავშირება ფორმის ველებთან, თუმცა
ასევე შესაძლებელია ფორმის კონტროლების დაჯგუფების ერთიანად შექმნაც. ამისთვის
ანგულარს აქვს `FormBuilder` სერვიცი, რომელიც შეგვიძლია კლასში დავაინჯექთოთ.

```ts
import { Component, inject } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

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

`group` მეთოდით და მასში ობიექტის მიწოდებით შეგვიძლია კონტროლთა
დაჯგუფების შექმნა. თვისების სახელი იქნება კონტროლის სახელი, ხოლო მათი
მნიშვნელობა უნდა იყოს მასივი. მასივში პირველი ელემენტი იქნება მათი საწყისი
მნიშვნელობა. მასივის შემდეგი ელემენტები საწყისი მნიშვნელობის შემდეგ უნდა
იყვნენ ვალიდატორები. ვალიდატორებზე მოგვიანებით ვისაუბრებთ. ჩვენ აქ
კიდევ ორი დამატებითი ველი `email` და `password` დავამატეთ.

თემფლეითში ჩვენ ახლა არა ცალკეულ კონტროლებს ვაკავშირებთ ველებთან,
არამედ მთლიან ფორმას `formGroup` თვისებაზე ვაბამთ ჩვენი `FormGroup`-ის
ინსტანციას:

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
  <button>Submit</button>
</form>
<div>
  <h3>Result:</h3>
  <div>{{ signupForm.value | json }}</div>
</div>
```

შემდგომ თითოეულ ველს formControlName-ზე მივაწვდით სათანადო კონტროლის
სახელს, რომელიც ჩვენ `FormGroup`-ზე შევქმენით. ასე კონტროლების ჯგუფი
დაკავშირებულია თემფლეითთან. `form`-ზე `onSubmit` ივენთზე მოსმენით
შეგვიძლია ვირეაგიროთ ფორმის დასაბმითების ივენთზე, რომელიც ავტომატურად
აქტიურდება, როცა ფორმის ელემენტის შიგნით არსებულ ღილაკზე დაკლიკება
ფიქსირდება. შედეგს უბრალოდ კონსოლში ვლოგავთ. აქვე თემფლეითში
მთლიანი ფორმის ჯგუფის მნიშვნელობას გამოვსახავთ. როგორც ხედავთ,
ვიღებთ ობიექტს, სადაც key არის კონტროლის სახელი, ხოლო value
ამ კონტროლის ველში შეყვანილი მონაცემები.

რეაქტიული ფორმების პლიუსი ის არის, რომ ჩვენ მაქსიმალური კონტროლი გვაქვს
ამ ფორმაზე. ჩვენ შეგვიძლია კონტროლებში მნიშვნელობების მოდიფიკაცია ან
განსაკუთრებული გზით ვალიდაცია. ჯერ მოდიფიკაციას მივხედოთ.

### მნიშვნელობების მანიპულაცია

ვთქვათ გვინდა, რომ სახელის ველს ერთი ღილაკის დაჭერით შევუცვალოთ მნიშვნელობა.
მაშინ ჩვენ შევქმნით ღილაკს:

```html
<!-- form ending -->
</form>
<button (click)="onUpdateName()">Update name</button>
<div>
  <h3>Result:</h3>
  <div>{{ signupForm.value | json }}</div>
</div>
```

რომელზე დაკლიკების შემდეგაც გავააქტიურებთ ფორმის
კონტროლზე არსებულ `setValue` მეთოდს.

```ts
  onUpdateName() {
    this.signupForm.controls['name'].setValue('Thelonious Monk');
  }
```

`FormGroup`-ს გააჩნია `controls` ობიექტი, საიდანაც ვიღებთ კონტროლის ინსტანციას,
რომელიც `name` key-ში ინახება. კონტროლზე `setValue` მეთოდი ცვლის ამ კონტროლის
და შესაბამის ველში შეყვანილი მონაცემის მნიშვნელობას.

შესაძლებელია `setValue`-ს მთლიან ჯგუფზე გამოყენებაც:

```ts
  onUpdateName() {
    // this.signupForm.controls['name'].setValue('Thelonious Monk');
    this.signupForm.setValue({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'badpassword123',
    });
  }
```

აქ აუცილებელია, რომ ყველა კონტროლს დავუწეროთ მნიშვნელობა, სხვა მხრივ
ანგულარ დაქომფაილებაზე უარს იტყვის.

თუ გვინდა რომ ჯგუფში კონკრეტული ველები შევცვალოთ და დანარჩენი ისე
დავტოვოთ, როგორც იყო, მაშინ ვიყენებთ `patchValue`-ს:

```ts
  onUpdateName() {
    // this.signupForm.controls['name'].setValue('Thelonious Monk');
    this.signupForm.patchValue({
      name: 'John',
      email: 'John@mail.com',
    });
  }
```

აქ ჩვენ `password` გამოვტოვეთ, თუმცა ამის გამო პრობლემა არ შეგვექმნება.

დასაბმითებისას ხშირა ფორმის დაცარიელება ხოლმე. ამისთვის შეგვიძლია ჯგუფზე
ან კონტროლებზე `reset` მეთოდის დაძახება.

```ts
  onSubmit() {
    console.log(this.signupForm.value);
    this.signupForm.reset();
  }
```

ეს მეთოდი დააბრუნებს ფორმას პირვანდელ მნიშვნელობებზე.

### კონტროლების მასივი

ზოგჯერ გვაქვს ფორმის ისეთი ნაწილები, რომლებიც დინამიკურად
უნდა შეიქმნას და მათთვის კონტროლის სახელი არ გვჭირდება. ვთქვათ
ჩვენს სარეგისტრაციო ფორმას გვინდა რომ მომხმარებელმა იმდენი პოზიცია
დაუწეროს, რამდენიც მას მოესურვება. მაშინ ჩვენ უნდა შევქმნათ კონტროლების
მასივი, `FormArray`-ს ინსტანცია. შეგვიძლია პირდაპირ ამ კლასის ინსტანცია
გამოვიყენოთ, მაგრამ რადგან `FormBuilder` გვაქვს, მისი მეთოდი გამოვიყენოთ.

```ts
export class SignupForm {
  private fb = inject(FormBuilder);

  signupForm = this.fb.group({
    name: [""],
    email: [""],
    password: [""],
    positions: this.fb.array([this.fb.control("")]),
  });

  get positions() {
    return this.signupForm.controls["positions"];
  }

  onSubmit() {
    console.log(this.signupForm.value);
  }

  onUpdateName() {
    // this.signupForm.controls['name'].setValue('Thelonious Monk');
    // this.signupForm.setValue({
    //   name: 'John',
    //   email: 'John@mail.com',
    //   password: 'badpassword123',
    // });
  }

  addPosition() {
    this.positions.push(this.fb.control(""));
  }
}
```

ჩვენ ცალკე თვისებაშიც შეგვიძლია `FormArray`-ს შექმნა, მაგრამ
უკვე არსებული ჯგუფის თვისების `position`-ის ქვეშ შევქმნათ ეს მასივი. `array` მეთოდს
მასივში ვატანთ ბილდერით შექმნილ კონტროლს. თავდაპირველად გვქონდეს მხოლოდ
ერთი კონტროლი.

აქვე getter მეთოდს ვქმნით რათა `positions`-ის კონტროლებს უფრო მოკლედ და მარტივად ჩავწვდეთ.
ანუ როცა ჩვენ `positions`-ს გამოვიყენებთ, ეს სინამდვილეში იქნება `this.signupForm.controls["positions"]`.
ჩვენ დაგვჭირდება მეთოდი, რომლის საშუალებითაც ამ მასივს ახალი კონტროლი დაემატება. სწორედ ამას
აკეთებს `addPosition` მეთოდი. იგი არსებული კონტროლების მასივს ახალი კონტროლის ისნტანციას ამატებს.
ახლა საჭიროა მისი თემფლეითთან დაკავშირება.

```html
<div class="form-block" formArrayName="positions">
  <div class="positions-title">
    <h3>Positions</h3>
    <button type="button" (click)="addPosition()">+</button>
  </div>
  @for (position of positions.controls; track $index) {
    <input type="text" [formControlName]="$index" />
  }
</div>
```

გაითვალისწინეთ, რომ positions არის signupForm-ის წევრი. აქ `formArrayName`-ის საშუალებით
რაიმე მშობელ კონტეინერზე სათანადო მასივის სახელს ვუთითებთ. ახლა ანგულარმა იცის, რომ
ამ ბლოკში `positions` ველში არსებულ კონტროლებთან გვაქვს საქმე. ჩვენ `@for` ბლოკით
ვლუპავთ პოზიციის კონტროლებზე და თითოეული პოზიციისთვის ვიღებთ ინდექსს `$index`
ცვლადში, რომელსაც
ფროფერთი ბაინდინგით ვაკავშირებთ `formControlName`-ზე. `FormArray`-ში კონტროლის სახელი
მასივის ინდექსია. + ღილაკზე დაჭერით ახალი კონტროლი იქმნება და შესაბამისად ახალი ველიც გამოჩნდება.
მათი მნიშვნელობებს ქვემოთაც დავინახავთ, სადაც ფორმის მნიშვნელობას გამოვსახავთ.

## შეჯამება

ამ თავში ჩვენ ვისაუბრეთ რეაქტიულ ფორმებზე, შევქმენით ფორმის კონტროლები
ერთ დაჯგუფებად `FormBuilder`-ის საშუალებით და დავაკავშირეთ ის თემფლეითთან.
ჩვენ ასევე განვიხილეთ მეთოდები, რომლითაც შეგვიძლია კონტროლების
და მთლიანი ფორმის ჯგუფების მნიშვნელობების მოდიფიკაცია. ჩვენ ასევე განვიხილეთ
`FormArray` სადაც დინამიკურად შევქმენით უსახელო კონტროლები. შემდეგ თავში ჩვენ
განვიხილავთ რეაქტიული ფორმების ვალიდაციას.
