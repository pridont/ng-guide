---
title: "Property & Attribute Binding"
---

# Property & Attribute Binding

დატა ბაინდინგის საშუალებით ჩვენ შეგვიძლია თემფლეითში მნიშვნელობები
დინამიკურად მივაბათ HTML ელემენტის კონკრეტულ ატრიბუტებს, ან DOM
ელემენტის თვისებებს.

ვთქვათ კლასში გვაქვს განსაზღვრული შემდეგი თვისებები და მეთოდები:

```ts
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styles: `
    div {
      transition: background 500ms ease;
    }
    .square-red {
      width: 100px;
      height: 100px;
      background: red;
    }
    .square-blue {
      width: 100px;
      height: 100px;
      background: blue;
    }
  `,
  ,
})
export class App {
  imgData = {
    src: "https://angular.dev/assets/images/press-kit/angular_wordmark_gradient.png",
    alt: "Angular Logo",
  };
  btnDisabled = true;
  squareClass = "square-red";

  changeSquare() {
    this.squareClass =
      this.squareClass === "square-red" ? "square-blue" : "square-red";
  }
}
```

თუ გვსურს რომ `imgData` ობიექტში არსებული `src` და `alt` თვისებათა მნიშვნელობები
მივაბათ თემფლეითში არსებულ `img` ელემენტს, მაშინ ელემენტზე არსებულ ატრიბუტს ვაქცევთ
ოთკუთხედ ფრჩხილებში და ტოლობის შემდეგ ვწერთ იმ ცვლადებს, რომლებიც კლასსში არსებობს.
ახლა რაღაც თვალსაზრისით, ბრჭყალებში ტაიპსკრიპტის/ჯავასკრიპტის ექსფრეშენები (expressions) მუშაობს.

```html
<!-- no binding -->
<img src="https://example.com" alt="some alt text" />
<!-- with binding -->
<img [src]="imgData.src" [alt]="imgData.alt" />
<button [disabled]="btnDisabled">Can't Click</button>
<br />
<div [class]="squareClass"></div>
<button (click)="changeSquare()">Change Color</button>
```

იგივე ეხება ღილაკზე `disabled` ატრიბუტს, რომელსაც boolean ცვლადს ვაბამთ.
შესაძლებელია `class` ატრიბუტზე სტრინგის მნიშვნელობების დინამიკურად მიბმაც:
ამ შემთხვევაში ჩვენ კლასში არსებულ ცვლადს ვაბამთ `div`-ზე `class` ატრიბუტს,
ხოლო ღილაკზე დაჭერით (ე.წ event binding-ის საშუალებით) ვააქტიურებთ მეთოდს,
რომელიც ამ `squareClass` ცვლადის მნიშვნელობას ცვლის. რადგან კომპონენტის
`styles`-ში ჩვენ შესაძლო კლასის სახელებისთვის სტილები გვაქვს გაწერილი, `div`
ელემენტი კლასის ცვლილებასთან ერთად სტილებსაც იცვლის.

შესაძლებელია თვითონ ელემენტზე სტილის ან სტილის კონკრეტული ფროფერთის მოდიფიკაციაც:

```ts
// Inside the class
myBgColor = "violet";
```

```html
<button (click)="changeSquare()" [style.background]="myBgColor">
  Change Color
</button>
```

აუცილებელია ხაზი გავუსვათ იმას, რომ ჩვენ ახლა განვიხილავთ property binding-ს და
არა attribute binding-ს. ამ ორს შორის მნიშვნელოვანი განსხვავებაა. როცა ჩვენ
HTML-ში ერთი შეხედვით ელემენტის ატრიბუტებს ვუწერთ მნიშვნელობას - იქნება ეს binding-ით თუ
მის გარეშე - ანგულარი პირდაპირ ამ HTML ელემენტს არ განათავსებს დოკუმენტში. იგი
ინიციალიზაციას უკეთებს DOM-ის ნოუდებს, და მათ ანიჭებს ფროფერთიებს - ანუ HTML-ში
ატრიბუტზე ტექსტსა და მისი DOM-ის ნოუდის ანალოგურ ფროფერთის შეიძლება ზოგჯერ ერთი
და იგივე მნიშვნელობები არ ჰქონდეთ.

უშუალოდ HTML-ის ელემენტების ატრიბუტის მოდიფიკაციისთვის, ისევე როგორც ფროფერთი ბაინდინგის
შემთხვევაშია, ატრიბუტის სახელს ოთხკუთხედ ფრჩხილებში ვწერთ, თუმცა წინ ვუწერთ `attr` პრეფიქსსა
და წერტილს, ხოლო ტოლობის შემდეგ ბრჭყალებში უნდა დაიწეროს ექსფრეშენი, რომელის სტრინგს აბრუნებს:

```html
<button
  (click)="changeSquare()"
  [style.background]="myBgColor"
  [attr.aria-label]="actionLabel"
>
  Change Color
</button>
```

```ts
// in the class
actionLabel = "Change square color";
```

ატრიბუტის ბაინდინგს ყველაზე ხშირად accsessibility-სთვის იყენებენ.

## შეჯამება

რომ შევაჯამოთ, ამ თავში ჩვენ განვიხილეთ ფროფერთი და ატრიბუტ ბაინდინგი, რომლის საშუალებითაც
კომპონენტის კლასში არსებული მნიშვნელობები მივაბით ელემენტის თვისებებსა და ატრიბუტებს. ერთმანეთისგან
განვასხვავეთ ფროფერთისა და ატრიბუტის ბაინდინგი, სადაც ფროფერთი ბაინდინგი DOM-ის ნოუდს უცვლის თვისებებს,
ხოლო ატრიბუტის ბაინდინგი ელემენტის HTML ატრიბუტების მნიშვნელობას, რომელიც აუცილებლად სტრინგი უნდა იყოს.
