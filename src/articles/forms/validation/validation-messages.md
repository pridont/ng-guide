---
title: "ვალიდაციის მესიჯები"
---

# ვალიდაციის მესიჯები

ახლა განვათავსოთ მესიჯები. ჯერ კლასსში შევქმნათ გეთერი, რომ
თითოეულ კონტროლს უფრო მოკლედ ჩავწვდეთ:

```ts
  get controls() {
    return this.signupForm.controls;
  }
```

შემდეგ თითოეული კონტროლის მიხედვით განვათავსოთ მესიჯი.

```html
<form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
  <div class="form-block">
    <label for="name">Name</label>
    <input type="text" id="name" formControlName="name" />
    @if (controls['name'].invalid && controls['name'].dirty) {
      <span>Must provide a proper name!</span>
    }
    @if (controls['name']?.errors?.['badName']) {
      <span>{{ controls['name'].errors?.['badName'] }}</span>
    }
  </div>
  <div class="form-block">
    <label for="email">Email</label>
    <input type="email" id="email" formControlName="email" />
    @if (controls['email'].invalid && controls['email'].dirty) {
      <span>Must provide a proper email!</span>
    }
  </div>
  <div class="form-block">
    <label for="password">Password</label>
    <input type="password" id="password" formControlName="password" />
    @if (controls['password'].invalid && controls['password'].dirty) {
      <span>Password is required!</span>
    }
  </div>
  <button type="submit" [disabled]="signupForm.invalid">Submit</button>
</form>
<div>
  <h3>Result:</h3>
  <div>{{ signupForm.value | json }}</div>
</div>
```

თუ კონტროლი არ არის ვალიდური, ჩვენ მესიჯი უნდა გამოვაჩინოთ, მაგრამ ასე მესიჯი
თავიდანვე ხილვადი იქნება. ჩვენ მომხმარებელს ჯერ უნდა ვაცადოთ ინფორმაციის შეყვანა.
ამიტომ ასევე უნდა დავრწმუნდეთ, რომ არავალიდურობასთან ერთად, მომხმარებელი
უკვე შეხებია და ცვლილება შეუტანია ამ ველში. სწორედ ამაზე მიუთითებს `dirty`
თვისება. მისი საპირისპირო თვისებაა `pristine`.

აქვე სახელის ველში კონტროლის ერორებს ვწვდებით. ეს ერორები მაშინ ჩნდება,
როცა ვალიდატორებში ვაბრუნებთ ერორებს. ცუდი სახელის პატერნის შემთხვევვაში
ეს ერორი იარსებებს და შესაბამისად ჩვენ მას შეგვიძლია ჩავწვდეთ და ის მესიჯი
გამოვსახოთ, რომელიც ვალიდატორის ფუნქციაში შევქმენით. `?` გვჭირდება
ყოველი თვისების წინ, რადგან შესაძლოა ისინი არ არსებობდნენ.

### შეჯამება

ამ თავში ჩვენ ვისწავლეთ ანგულარის ვალიდატორების შესახებ, შევქმენით ჩვენი ვალიდატორიც
და გამოვსახეთ ვალიდაციის მესიჯები.
