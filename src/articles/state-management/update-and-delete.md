---
title: "წაშლა და მონიშვნა"
---

# წაშლა და მონიშვნა

ახლა ისღა დაგვრჩენია, რომ შევძლოთ ნივთების დასრულებულად მონიშვნა და წაშლა.
სერვისში დავამატოთ მათი მეთოდები `deleteItem` და `updateItem`:

```ts
 public deleteItem(id: number) {
    this.todosLoading$.next(true);

    this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(
        tap(() => {
          this.todos$.next(this.todos$.value.filter((item) => item.id !== id));
        }),
        catchError((error: HttpErrorResponse) => {
          this.error$.next(error);
          return of(null);
        })
      )
      .subscribe();
  }

  public updateItem(updatedItem: TodoItem) {
    this.todosLoading$.next(true);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http
      .patch<TodoItem>(`${this.url}/${updatedItem.id}`, updatedItem, {
        headers,
      })
      .pipe(
        tap((updatedItem) => {
          const updatedList = this.todos$.value.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          this.todos$.next(updatedList);
        }),
        catchError((error: HttpErrorResponse) => {
          this.error$.next(error);
          return of(null);
        })
      )
      .subscribe();
  }
```

პრინციპი აქ იგივეა.

`deleteItem`-ში წასაშლელი ნივთის აიდის მივიღებთ პარამეტრში. ჯერ `loadingTodos$`
სთეითს განვაახლებთ და შემდეგ გავგზავნი DELETE მოთხოვნას ამ აიდის ენდფოინთზე.
საპასუხოდ მონაცემი არ გვიბრუნდება, თუმცა HTTP მოთხოვნის წარმატების შემთხვვაში.
`tap` მაინც გააქტიურდება. ჩვენ წაშლილი ნივთის აიდის მიხედვით ვფილტრავთ უახლეს
მასივს, რათა ის წაშლილ ნივთს არ შეიცავდეს და ამ გაფილტრულ მასივს გადავცემთ
`todos$` სტრიმს. ერორის შემთხვევაში ერორის ობიექტს მოვიხელთებთ
`catchError` ოპერატორით და გადავცემთ მას `error$` სტრიმს.

`updateItem`-ში პარამეტრად ვიღებთ თვითონ განახლებულ ნივთს და მას გადავცემთ
PATCH მოთხოვნას ამ ნივთის აიდის მქონე ენდფოინთზე. მაქამდე `loading$` სთეითს
ვაწვდით `trues`-ს და `HttpHeaders`-ის ინსტანციას
ვქმნით, ისევე როგორც POST მოთხოვნაზე -- მას მესამე არგუმენტად ობიექტში ვაწვდით.
ეს მოთხოვნა აბრუნებს განახლებული ნივთის ობიექტს, რომელსაც ჩვენ `tap` ოპერატორში
ვიღებთ და საპასუხოდ ვქმნით განახლებულ სიას, სადაც აიდით ვპულობთ იმ ძველ ნივთს,
რომელიც ბექენდში განვაახლეთ და მას ვანაცვლებთ ახალი ნივთით. ამ მასივს გადავცემთ
`todos$` სტრიმს.

კომპონენტში შევქმნათ სათანადო მეთოდები მათ დასაძახებლად:

```ts
  changeDone(itemToChange: TodoItem) {
    const updatedItem = {
      ...itemToChange,
      done: !itemToChange.done,
    };

    this.todoService.updateItem(updatedItem);
  }

  deleteItem(id: number) {
    this.todoService.deleteItem(id);
  }
```

როცა ნივთს მოვნიშნავთ, ჩვენ პარამეტრში მივიღებთ სამიზნე ობიექტს და მას
შევუცვლით `done` თვისებას არსებულის საპირისპიროთი. შემდეგ ამ ობიექტს
გავატანთ სერვისის მეთოდს.

წაშლის შემთხვევაში პირდაპირ აიდის მივიღებთ პარამეტრში, რომელსაც მეთოდს გავატანთ.

სადაც თითოეულ ნივთს ვარენდერებთ `@for` ბლოკით, შემდეგი ცვლილებები შეგვაქვს:

```html
@for (item of vm.todos; track item.id) {
  <li class="list-group-item d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center">
      <input type="checkbox" [checked]="item.done" (click)="changeDone(item)" />
      <span class="ms-2">{{ item.title }}</span>
    </div>
    <button class="btn btn-danger" (click)="deleteItem(item.id)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-trash3-fill"
        viewBox="0 0 16 16"
      >
        <path
          d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"
        />
      </svg>
    </button>
  </li>
}
```

`input`-ზე ვამატებთ დაკლიკების ივენთ ბაინდინგს, რომელსაც ვაკავშირებთ `changeItemDone`
ფუნქციასთან და მას არგუმენტად ვაწვდით მთლიან ობიექტს.

გვერდით ვამატებთ წაშლის აიქონიან ღილაკს, რომელსაც ივენთ ბაინდინგით ვაკავშირებთ
`deleteItem` მეთოდთან და მას ვაწვდით ნივთის აიდის.

ახლა ჩვენი აპლიკაცია სრულფასოვნად უნდა მუშაობდეს. უნდა შესაძლებელი იყოს:

- არსებული ნივთების ნახვა
- ახალი ნივთის დამატება
- ნივთის წაშლა
- ნივთის მონიშვნა
- ყოველი მოთხოვნის გაგზავნის დროს სპინერის გამოჩენა
- ერორის შემთხვევაში ერორის მესიჯის გამოჩენა

დროა [შევაჯამოთ, რა ვისწავლეთ ამ გაკვეთილში?](./summary.html)
