---
title: "პროექტის მომზადება"
---

# პროექტის მომზადება

გავცეთ ბრძანება ახალი პროექტის შესაქმნელად:

```sh
ng new todo-signals
```

აპლიკაციაში არ გამოვიყენებთ რაუთინგს.
მარკაპისთვის გამოვიყენებთ ბუტსტრაპს. მას index.html-ში შემოვიტანთ CDN-ის საშუალებით:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Todo Signals</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ"
      crossorigin="anonymous"
    />
  </head>
  <body>
    <app-root></app-root>
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.min.js"
      integrity="sha384-Y4oOpwW3duJdCWv5ly8SCFYWqFDsfob/3GkgExXKV4idmbt98QcxXYs9UoXAB7BZ"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
```

`HttpClient`-ის დასაინჯექთებლად არაფრის დარეგისტრირება არ გვჭირდება —
ანგულარის 21-ე ვერსიიდან ის ნაგულისხმევად ხელმისაწვდომია. `app.config.ts`
უცვლელი რჩება.

`App`-ის იმპორტებში შემოვიტანოთ `FormsModule`:

```ts
import { FormsModule } from "@angular/forms";
@Component({
  imports: [/* ... */ FormsModule]
})
```

ახლა პატარა ბექენდის სიმულატორი გვჭირდება. ამ პროექტში გამოვიყენებთ
`json-server` ბიბლიოთეკას, რომელიც ლოკალურად უნდა დავაინსტალიროთ პროექტში:

```sh
npm install json-server
```

ეს ბიბლიოთეკა საშუალებას მოგვცემს რომ მარტივი მონაცემთა ბაზა შევქმნათ, როგორც
JSON-ის ფაილი და გავუშვათ ბექენდ სერვერი.

აპლიკაციის ზედა დონეზე შევქმნათ ფაილი `database.json` და მასში რამდენიმე სატესტო
ობიექტი შევიტანოთ `todo` თვისების შიგნით მასივში:

```json
{
  "todos": [
    {
      "title": "Walk the dog",
      "done": false,
      "id": 1
    },
    {
      "title": "Call grandma",
      "done": true,
      "id": 2
    },
    {
      "title": "Buy groceries",
      "done": false,
      "id": 3
    }
  ]
}
```

ახლა package.json-ში დავამატოთ სკრიპტი, რათა ჩავრთოთ `json-srrver`
და მას გამოვაყენებინოთ `database.json`-ს. სკრიპტს `scripts` ველში ვამატებთ
`server` სახელით.

```json
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "server": "json-server database.json"
  },
```

ახლა თუ ჩვენ ტერმინალში გავუშვებთ ბრძანებას `npm run server` ის გააქტიურებს
`json-server`-ს. ეს სერვერი უნდა აქტიური იყოს, რათა ფრონტენდმა მასთან
კავშირი დაამყაროს.

ტერმინალის მეორე ინსტანცია გავხსნათ და მანდ გავუშვათ `npm run start` ან
`ng serve`. ახლა ფრონტენდის და ბექენდის სერვერები გააქტიურებულია და მზად
ვართ რომ პროექტზე მუშაობა დავიწყოთ.

შევუდგეთ [სთეითის ინიციალიზაციას](./initializing-state.html)!
