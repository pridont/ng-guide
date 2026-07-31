---
title: "Creation Operators"
---

# Creation Operators

შექმნის ოპერატორების საშუალებით შესაძლებელია სტრიმების შექმნა რაიმე
წყაროდან, ეს შეიძლება იყოს http მოთხოვნა, მომხმარებლის რაიმე ივენთი
ან სულაც სტატიკური მონაცემები. ჩვენ ფაქტობრივად ყველაფრისგან შეგვიძლია
სტრიმის შექმნა.

## fromEvent

`fromEvent`-ის საშუალებით შეგვიძლია რაიმე ელემენტზე (ან მთლიან დოკუმენტზე)
არსებული მოვლენისგან სტრიმის შექმნა, სადაც ქოლბექში ფუნქცია დაგვიბრუნებს
ამ ივენთის მოვლენის ინფორმაციას.

პირველ არგუმენტად ამ ფუნქციას ვაწვდით სასურველ ელემენტს ხოლო მეორე არგუმენტად
მოვლენის სახელის სტრინგის ფორმით:

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

  ngOnInit(): void {
    // When component is initialized, start reacting
    this.myObservable$.subscribe((event) => {
      console.log(event);
    });
  }
}
```

## from

`from` ოპერატორით შესაძლებელია array-ის, promise-ის ან iterable მონაცემისგან
სტრიმის შექმნა. არგუმენტად ეს ოპერატორი სწორედ ასეთ მონაცემებს იღებს.

```ts
import { Component, OnInit } from "@angular/core";
import { from } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  // emit array as a sequence of values
  numbers$ = from([1, 2, 3, 4, 5]);

  ngOnInit(): void {
    // listen to the emission and log each value
    this.numbers$.subscribe((val) => console.log(val));
  }
}
```

ესე შევქმნით სტრიმს, რომელიც თანმიმდევრულად გასცემს მასივის თითოეული
წევრის მნიშვნელობას. ანუ კონსოლში ჯერ დაილოგება 1, შემდეგ 2, 3 და ასე
5-ის ჩათვლით. წარმოიდგინეთ ქარხანაში კონვეიერი, სადაც თანმიმდევრულად
ვალაგებთ მასივის ელემენტებს. დანიშნულების ადგილზეც ისინი შესაბამისად არა
ერთდროულად, არამედ ერთი მეორის შემდეგ მივლენ.

## of

`of` ოპერატორი თანმიმდევრულად გასცემს ცვალებადი რაოდენობის მნიშვნელობებს,
რომელიც მას არგუმენტად მიეწოდება.

```ts
import { Component, OnInit } from "@angular/core";
import { of } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  //emits values of any type
  values$ = of({ name: "Brian" }, [1, 2, 3], function hello() {
    return "Hello";
  });

  ngOnInit(): void {
    //output: {name: 'Brian'}, [1,2,3], function hello() { return 'Hello' }
    this.values$.subscribe((val) => console.log(val));
  }
}
```

## შეჯამება

ამ თავში ჩვენ განვიხილეთ შექმნის ოპერატორები, რომლებითაც საშუალება გვაქვს
სტრიმები შევქმნათ ივენთებისა და სტატიკური მონაცემებისგან.
