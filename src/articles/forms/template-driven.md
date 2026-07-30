---
title: "Template Driven Forms"
---

# Template Driven Forms

## მნიშვნელოვანი დირექტივები

template-driven ფორმები ეყრდნობიან `FormsModule`-ში არსებულ შემდეგ დირექტივებს:

- `NgModel` - იგი ათანხმებს ჰოსტ ფორმის ელემენში შეცვლილ მნიშვნელობებს დატა მოდელთან, რაც საშუალებას გვაძლევს, რომ ვირეაგიროთ შეყვანილ ინფორმაციაზე.
- `NgForm` - ქმნის ზედა დონის `FormGroup`-ის ინსტანციას და მას `<form>` ელემენტს აბამს, რათა თვალყური ადევნოს გაერთიანებული ფორმის მნიშვნელობასა და ვალიდაციის სტატუსს. როგორც კი ჩვენ `FormsModule`-ს ვაიმპორტებთ, ეს დირექტივი ავტომატურად აქტიურდება ყველა `<form>` ელემენტზე.
- `NgModelGroup` - ქმნის და აბამს `FormGroup`-ის ინსტანციას DOM ელემენტს.

აუცილებელია `FormsModule`-ის დაიმპორტება საჭირო კომპონენტში (ან მოდულში), რათა ამ დირექტივებზე წვდომა გვქონდეს.

## ფორმის აწყობა

ვთქვათ, გვინდა ფორმის აწყობა, სადაც ვეფხისტყაოსნის გმირებს
დარეგისტრირება შეეძლებათ ახალი თავგადასავლის დასაწყებად,
და სადაც ასევე შეძლებენ თანამგზავრი მეგობრის არჩევას.

### მარტივი ფორმა

შევქმნათ კომპონენტი HeroForm და მის თემფლეითში ავაგოთ მარტივი ფორმა:

```html
<form>
  <h1>Start your journey</h1>

  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" />
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" />
  </div>

  <div class="form-group">
    <label for="friend">Friend</label>
    <select id="friend" name="friend">
      @for (friend of friends; track friend) {
        <option [value]="friend">{{ friend }}</option>
      }
    </select>
  </div>
</form>
```

ეს სტანდარტული ფორმის მარკაპია, უბრალოდ `select`-ში ვიყენებთ
`@for` ბლოკს რათა ასარჩევი მეგობრების სია გამოვსახოთ,
მათი მნიშვნელობები მივანიჭოთ value თვისებაზე და ასევე ეს
მნიშვნელობა გამოვსახოთ ინტერპოლაციით.

`friends` ასე გამოიყურება კომპონენტის კლასი:

```ts
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-hero-form",
  imports: [FormsModule],
  templateUrl: "./hero-form.html",
  styleUrl: "./hero-form.css",
})
export class HeroForm {
  friends = ["Tariel", "Avtandil", "Nuradin-Pridon"];
  heroData = {
    name: "",
    email: "",
    friend: "",
  };

  submitted = false;

  onSubmit() {
    this.submitted = true;
  }
}
```

`friends`-ში ვინახავთ მეგობრების მასივს. heroData იქნება ის
პირადი ინფორმაციის ობიექტი, სადაც მომხმარებლის შეყვანილ მონაცემებს
შევინახავთ. ეს თვისებები თავიდან ცარიელია.

აქვე გვექნება `submitted`, რომელიც იმას განსაზღვრავს submit ღილაკზე
დავაჭირეთ თუ არა. სწორედ ღილაკზე დაჭერისას უნდა გააქტიურდეს `onSubmit` მეთოდი.

`NgModel`-ის საშუალებით ფორმაში შეყვანილი მონაცემები შეგვიძლია შევინახოთ
`heroData`-ს თვისებებში:

```html
<form (ngSubmit)="onSubmit()">
  <h1>Start your journey</h1>

  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" [(ngModel)]="heroData.name" />
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" [(ngModel)]="heroData.email" />
    @if (emailCtrl.invalid && !emailCtrl.pristine) {
      <span>Email is required!</span>
    }
  </div>

  <div class="form-group">
    <label for="friend">Friend</label>
    <select id="friend" name="friend" [(ngModel)]="heroData.friend">
      @for (friend of friends; track friend) {
        <option [value]="friend">{{ friend }}</option>
      }
    </select>
    @if (friendCtrl.invalid) {
      <span>You shouldn't go alone!</span>
    }
  </div>
  <button>Submit</button>
</form>

@if (submitted) {
  <div>
    <h3>OUTPUT:</h3>
    <div>{{ heroData | json }}</div>
  </div>
}
```

ახლა ღილაკზე დაჭერისას უნდა გამოჩნდეს შედეგი, რაც ადასტურებს იმას, რომ
შეყვანილ მონაცემებს სწორად ვინახავთ. იდეაში ღილაკზე დაჭერის შემდეგ
ჩვენ რაიმე HTTP მოთხოვნა უნდ აგავაგზავნოთ, თუმცა ახლა შედეგს უბრალოდ
თემფლეითში გამოვსახავთ.

### ვალიდაცია

საჭიროა, რომ ღილაკზე დაჭერა იქამდე არ იყოს შესაძლებელი, სანამ ყველა ველი სწორად
არ შეივსება. ამისთვის ფორმის კონტროლებს უნდა ჩავწვდეთ და შევამოწმოთ მათი ვალიდურობა.
ეს შესაძლებელია ლოკალური ცვლადებით და ვალიდატორებით:

```html
<form (ngSubmit)="onSubmit()" #heroForm="ngForm">
  <h1>Start your journey</h1>
  <div class="form-group">
    <label for="name">Name</label>
    <input
      type="text"
      id="name"
      name="name"
      [(ngModel)]="heroData.name"
      required
      #nameCtrl="ngModel"
    />
    @if (nameCtrl.invalid && !nameCtrl.pristine) {
      <span>Name is required!</span>
    }
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      [(ngModel)]="heroData.email"
      required
      email
      #emailCtrl="ngModel"
    />
    @if (emailCtrl.invalid && !emailCtrl.pristine) {
      <span>Email is required!</span>
    }
  </div>
  <div class="form-group">
    <label for="friend">Friend</label>
    <select
      id="friend"
      name="friend"
      [(ngModel)]="heroData.friend"
      required
      #friendCtrl="ngModel"
    >
      @for (friend of friends; track friend) {
        <option [value]="friend">{{ friend }}</option>
      }
    </select>
    @if (friendCtrl.invalid) {
      <span>You shouldn't go alone!</span>
    }
  </div>
  <button [disabled]="heroForm.invalid">Submit</button>
</form>

@if (submitted) {
  <div>
    <h3>OUTPUT:</h3>
    <div>{{ heroData | json }}</div>
  </div>
}
```

მივყვეთ ზემოდან ქვემოთ. ჩვენ ლოკალურ ცვლადს ვქმნით #-ით - `heroForm`, რომელსაც
`ngForm` დირექტივს ვუტოლებთ. ასე თემფლეითში იქმნება ცვლადი, რომელიც `FormGroup`-ის
ინსტანციას ინახავს. ღილაკს სწორედ ამ ცვლადში არსებული `invalid` თვისების მიხედვით
ვთიშავთ. ფორმის ჯგუფი არავალიდურია მაშინ, თუ მასში ერთი კონტროლი მაინც არ არის ვალიდური.

თითოეულ ფორმის ელემენტს მივეცით ატრიბუტი `required`. ამის მიხედვით `NgModel` ადგენს,
რომ თუ ფორმა ცარიელია, მაშინ ის არავალიდურია და სათანადო კონტროლს ანიჭებს `invalid`
თვისებაზე true-ს, ხოლო `valid` თვისებაზე false-ს. ამ თვისებებს მსგავსი პრინციპით ვიღებთ:
ლოკალურ ცვლადს ვქმნით და მას ვუტოლებთ `ngModel`-ს. ასე ჩვენ ცვლადებში `FormControl`-ის
ისნტანციას ვინახავთ, რომელსაც გარკვეული თვისებები გააჩნია. თუ კონტროლი არავალიდურია, ჩვენ
გვინდა რომ თითოეული ველის ქვეშ ამის შესახებ მინიშნება გამოჩნდეს. მაგრამ ეს მინიშნება არ გვინდა,
რომ თავიდანვე ხილვადი იყოს, ფორმა კი თავიდან არავალიდურია. სწორედ ამიტომ ასევე ვიყენებთ
`pristine` ცვლადს. ეს ნიშნავს, რომ მომხმარებელს ჯერ არეფერი შეუყვანია ველში. ჩვენ
მინიშნება მაშინ გვინდა გამოვაჩინოთ, როცა კონტროლი არავალიდურია და მასში ცვლილება
უკვე შეტანილი იყო. `pristine`-ის საპირისპირო თვისებაც არსებობს -- `dirty`, რომელიც შეგვიძლია
გამოვიყენოთ ამ პირველის ნეგაციის მაგივრად.

იმელის ველზე email ატრიბუტის მინიჭება `ngModel`-ს ანიშნებს, რომ ამ ველში მეილის პატერნი უნდა იყოს,
და სანამ ეს პატერნი არ დაფიქსირდება, ფორმა არავალიდური იქნება.

## შეჯამება

ამ თავში ჩვენ გამოვიყენეთ template-driven ფორმები მარტივი ფორმის შესაქმნელად, რომელსაც გააჩნია
ვალიდაცია: იმის მიხედვით, არის თუ არა შევსებული ველი, ჩვენ ღილაკს ვაუქმებთ, ან ვაჩვენებთ მინიშნებებს.
ჩვენ ასევე იმასაც ვაქცევთ ყურადღებას, რომ მინიშნება ტექსტის შეყვანის მცდელობის შემდეგ უნდა გამოჩნდეს.
ამ ყველაფერს დირექტივებით და ლოკალური ცვლადებით ვაკეთებთ თემფლეითში, რაც უფრო მოხერხებულია
პატარა ფორმებისთვის, მაგრამ ზოგჯერ ეს საკმარისი არ არის.
