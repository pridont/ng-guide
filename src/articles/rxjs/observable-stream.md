---
title: "Observable Stream"
---

# Observable Stream

RxJS-ის ფუნდამენტური კონცეფცია არის observable stream, ანუ დაკვირვებადი
მონაცემის ნაკადი. განვიხილოთ observable-ების ელემენტარული მაგალითები.
ამისთვის გამოვიყენებთ ანგულარის საწყის აპლიკაციას.

როგორ მოვუსმენდით დოკუმენტში მაუსის დაკლიკებას?
ჯავასკრიპტში ვიცით ივენთ ლისენერის გამოყენება, მაგრამ
rxjs-ს თავისი ალტერნატივა აქვს. ეს არის fromEvent ოპერატორი, რომელიც
უნდა დავაიმპორტოთ "rxjs"-დან.

```ts
import { Component, OnInit } from "@angular/core";
import { fromEvent } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  // create an observable of mouse clicks on document
  myObservable$ = fromEvent(document, "click");

  ngOnInit(): void {}
}
```

მონაცემთა ნაკადი ნებისმიერი ინფორმაცია შეიძლება იყოს, თუმცა ყველაზე
ხშირად ეს ივენთებია. `fromEvent` ოპერატორი შექმნის ჩვენთვის სასურველი
ელემენტის რაიმე მოვლენათა სტრიმს, მათ შორის `click`-ს.
ამ სტრიმს ჩვენ ვინახავთ `myObservable$` თვისებაში.
კონვენციურად ანგულარსი სტრიმებს ბოლოში დოლარის ნიშანს ვუწერთ.
ჩვენ კი შევქმენით სტრიმი, თუმცა ის არაფერს გააკეთებს.

სტრიმების კარგი ანალოგიაა წყალგაყვანილობა. წყალი არის მონაცემების ნაკადი,
თუმცა ის ჩვენამდე ვერ მოაღწევს, თუ ჩვენ ონკანს არ მოვუშვით. ონკანს რომ
მოვუშვათ, ამისთვის საჭიროა `subscribe` მეთოდი, ანუ ამ სტრიმის გამოწერა.

```ts
import { Component, OnInit } from "@angular/core";
import { Subscription, fromEvent } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  // create an observable of mouse clicks on document
  myObservable$ = fromEvent(document, "click");

  ngOnInit(): void {
    // When component is initialized, start reacting
    this.myObservable$.subscribe((event) => {
      console.log(event);
    });
  }
}
```

ასე ჩვენ სტრიმს მივაწოდეთ `subscribe`-ში ფუნქცია, რომელიც უნდა განხორციელდეს
ნაკადში ყოველი ახალი მონაცემის გამოჩენის დროს. ანუ ჩვენ ასე განვსაზღვრავთ როგორ
ვირეაგიროთ კონკრეტულ მოვლენებზე. ეს კონკრეტული სტრიმი მოვლენის
შესახებ ინფორმაციას გვაწვდის. ის უბრალოდ კონსოლში დავლოგოთ.

აქამდე observable-ის მაგალითი ნანახი გექნებათ HttpClient-თან
მუშაობის დროს:

```ts
this.http.get("https://example.com").subscribe((response) => {
  console.log(response);
});
```

რომელიც იგივე პრინციპით მუშაობს.

სუბსქრაიბ ფუნქციაში კონკრეტული ტიპის ობიექტის მიწოდებაც შეიძლება,
სადაც უფრო კონკრეტულად შეგვიძლია ვუთხრათ რა მომენტში რაზე გვინდა
რეაგირება. მაგალითად `next` არის ნაკადში მონაცემის წარმატებით გაცემის
დროს განხორციელებული ფუნქცია. `error` არის ნაკადში რაიმე ერორის
აღმოცენების დროს საპასუხო ფუნქცია და `complete` არის ფუნქცია, რომელიც
უნდა განხორციელდეს როცა `observable` დასრულდება.

```ts
// instead of a function, we will pass an object with next, error, and complete methods
myObservable.subscribe({
  // on successful emissions
  next: (event) => console.log(event),
  // on errors
  error: (error) => console.log(error),
  // called once on completion
  complete: () => console.log("complete!"),
});
```

სტრიმზე `subscribe` მეთოდი აბრუნებს subscription-ს, რომელიც სურვილისამებრ შეგვიძლია
შევინახოთ ცვლადში. შესაძლებელია ერთზე მეტი subscription-ის შექმნა:

```ts
import { Component, OnInit } from "@angular/core";
import { Subscription, fromEvent } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  // create an observable of mouse clicks on document
  myObservable$ = fromEvent(document, "click");
  mySubscription$!: Subscription;
  mySubscriptionTwo$!: Subscription;

  ngOnInit(): void {
    this.mySubscription$ = this.myObservable$.subscribe((event) => {
      console.log("subscription one", event);
    });

    this.mySubscriptionTwo$ = this.myObservable$.subscribe((event) => {
      console.log("subscription two", event);
    });
  }
}
```

ჩვენ ორ ცალკეულ თვისებაში, რომლებიც `subscription` ტიპის არიან, ვინახავთ
საბსქრიფშენებს.
აქ სტრიმებსა და მათ საბსქრიფშენებს შორის მიმართება რის ერთი ერთთან. ანუ ეს
იგივეა რაც ორი `addEventListener`-ის გამოყენება და მასში ორი სხვადასხვა ფუნქციის
მიწოდება. თითოეულ საბსქრიბშენს ყავს თავისი ობზერვებლი. თუ გვსურს რომ ერთ
სტრიმზე დავასუბსქრაიბოთ სხვადასხვა ადგილას, მაშინ გვჭირდება `Subject`-ების გამოყენება,
რომელზეც მოგვიანებით ვისაუბრებთ.

subscription-ის ინსტანცია შეიძლება მაშინ გამოგვადგეს, როცა
მაგალითად მოლენებისთვის მოსმენა აღარ გვიჭირდება. ამისთვის შეგვიძლია მასზე `unsubscribe`
მეთოდს დავუძახოთ. ეს ხშირად კომპონენტის განადგურების დროს არის საჭირო, რათა
მეხსიერება და სისტემის რესურსები დავზოგოთ. სტრიმების უყურადღებოდ დატოვება
აპლიკაციაში მეხსიერების პრობლემებს ქმნის.

```ts
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, fromEvent } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit, OnDestroy {
  // create an observable of mouse clicks on document
  myObservable$ = fromEvent(document, "click");
  mySubscription$!: Subscription;
  mySubscriptionTwo$!: Subscription;

  ngOnInit(): void {
    this.mySubscription$ = this.myObservable$.subscribe((event) => {
      console.log("subscription one", event);
    });

    this.mySubscriptionTwo$ = this.myObservable$.subscribe((event) => {
      console.log("subscription two", event);
    });
  }

  ngOnDestroy(): void {
    this.mySubscription$.unsubscribe();
    this.mySubscriptionTwo$.unsubscribe();
  }
}
```

ასე რომ არ მოვიქცეთ, სტრიმებზე მაშინაც გვექნება აქტიური სუბსქრაიბი, როცა
სხვა კომპონენტზე ვიმყოფებით და ისინი რეალურად არ გვჭირდება.

RxJS-ის პლიუსი ის არის, რომ შეგვიძლია სტრიმების მრავალფეროვნად მანიპულაცია,
მათი გაცემული მნიშვნელობების გარდაქმნა და სხვადასხვა სტრიმების გარკვეული
გზებით კომბინაცია. ამისთვის ჩვენ [ოპერატორებს](./operators/) ვიყენებთ.
