---
title: "ngx-translate"
---

# ngx-translate

განსხვავებით ანგულარის `i18n` პაკეტისაგან, `ngx-translate`-ის იდეა არის რეალურ დროში მოხდეს თარგმანის გაშვება, რაც არიდებს მომხარებელს ვებ გვერდის რეფრეშისაგან და
სხვა მისამართზე გადასვლისაგან. შესაბამისად, ის არ საჭიროებს ბილდის პროცესში სხვადასხვა ტიპის ლოკალიზაციის გაშვებას.

პირველ რიგში დავიწყოთ პაკეტების ინსტალაციით:

```sh
npm install @ngx-translate/core @ngx-translate/http-loader
```

პაკეტების ინსტალაციის შემდგომ საჭიროა მათი გამართვა `app.module.ts`:

```ts
// ...
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [/* ... */],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [/* ... */]
})
export class AppModule { }
```

`ngx-translate`-ის გამოყენების დროს გვჭირდება ანგულარის ჩაშენებული კლასების (`HttpClientModule`, `HttpClient`) გამოყენება, რაც გვეხმარება ფაილების ჩატვირთვაში.
`HttpLoaderFactory` ფუნქცია ემსახურება ფაქტორის შექმნას, რომელიც ჩატვირთავს იმ ფაილს, რომლის თარგმანიც უნდა გამოვიყენოთ.
`TranslateModule.forRoot`-ის საშუალებით კი ვტვირთავთ იმ ფუნქციონალის ნაკრებს, რომელიც მოგვაწოდა `ngx-translate`-მა.

`app.module.ts`-ის გამართვის შემდგომ, გვჭირდება `assets` ფოლდერში დავამატოთ ახალი ფოლდერი `i18n` და მასში შევქმნათ კონკრეტული ლოკალის ფაილები,
ჩვენს შემთხვევაში `en.json` და `ka.json`.

`en.json`-ში დავამატოთ ახალი მნიშვნელობები:

```json
{
  "page_header": "Page header",
  "alt_text_for_image": "Educata project image",
  "update_button_text": "Change language to georgian"
}
```

`ka.json`-შიც დავამატოთ იგივე მნიშვნელობები ოღონდ ქართული თარგმანით:

```json
{
  "page_header": "გვერდის სათაური",
  "alt_text_for_image": "Educata პროექტის სურათი",
  "update_button_text": "შეცვალეთ ენა ინგლისურზე"
}
```

ამ ფაილებში `nesting`-ის გამოყენებაც შეიძლება:

```json
{
  "homepage": {
    "title": "მთავარი გვერდი"
  }
}
```

შემდგომ `app.html`-ში დავიწყოთ ცვლილებების შეტანა:

```html
<h1>{{"page_header" | translate }}</h1>
<img
  src="https://raw.githubusercontent.com/educata/everrest/main/assets/images/educata-bg-white.png"
  alt="{{'alt_text-for_image' | translate }}"
>
<button (click)="updateLangauge()">{{"update_button_text" | translate }}</button>
```
როგორც ვხედავთ, თიმფლეითში იდენტიფიკატორად გაგვაქვს ის სტრინგები, რომლებსაც თვისებებად ვინახავთ ლოკალის `json`-ში, ამ იდენტიფიკატორს
ვატარებთ `translate` ფაიფში, რომელიც შედგომ გვიბრუნებს თარგმანს. ეს ფაიფი მოდის `TranslateModule`-დან.
ვიზუალის დამატების შემდგომ დავიწყოთ `app.ts` მოდიფიცირება:

```ts
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
...
private translateService = inject(TranslateService);

constructor() {
  this.initLanguage();
}

private initLanguage() {
  const prevLanguage = localStorage.getItem('language') || 'en';
  this.translateService.use(prevLanguage);
}

updateLangauge() {
   const nextLang = this.translateService.currentLang === 'en' ? 'ka' : 'en';
   this.translateService.use(nextLang);
   localStorage.setItem('language', nextLang);
}
```

`constructor`-ში ვაინჯექტებთ `TranslateService`, `@ngx-translate/core`-დან. სერვისს საკმაოდ ბევრი კარგი მეთოდი და თვისებები აქვს,
[გირჩევთ გაეცნოთ](https://github.com/ngx-translate/core#api). `initLanguage` ჩვენ მიერ შექმნილი ფუნქციაა, რომელიც ამოწმებს ლოკალურ მეხსიერებაში
ხომ არ არის რაიმე ენა შენახული. თუ არ არის, მაშინ ნაგულისხმევად ინგლისური ენა ჩავტვირთოთ. `updateLanguage` მეთოდი კი პასუხისმგებელია განახლებაზე და ახალი ენის ინფორმაციის შენახვაზე ლოკალურ მეხსიერებაში. `translateService`-დან გამოვიყენეთ `currentLang`, რაც აბრუნებს ამჟამინდელ ენას და `use` მეთოდი, რომელსაც პარამეტრებში გადაეცემა თუ რა ენა უნდა ჩატვირთოს, გაითვალისწინეთ გადაცემული მნიშვნელობის `.json` ფაილი უნდა არსებობდეს `assets/i18n` ფოლდერში, რომ ის ენა ჩაიტვროთს. ეს კოდი
მარტივი მაგალითი არის და შესაძლებელია მისი ბევრნაირად გაუმჯობესება, მაგალითისთვის: ამ და მსგავსი მეთოდების მთლიანად სერვისში გატანა, რომლებიც შეიქმენება ინტერნაციონალიზაციისთვის. ასევე, შესაძლებელია ენის `enum`-ის შექმნა, რაც უფრო მეტად დახვეწავს ჩვენს კოდს. ბონუსად კი შეგიძლიათ მომხარებლისთვის სასურველი (ამჟამინდელი) ენაც კი ჩატვირთოთ `getBrowserLang` მეთოდის გამოყენებით `TranslateService`-დან. `TranslateService`-ს ასევე გააჩნია `instant` მეთოდი, რომლის საშუალებითაც შეგვიძლია პარამეტრად `key` გადავცეთ და მივიღოთ თარგმანი. შეგვიძლია უკვე შევამოწმოთ ვიზუალზე თუ როგორ მუშაობს რეალურ დროში ენის ცვლილება.

ასეთი მიდგომით მივიღეთ რეალურ დროში ენის ცვლილება `ngx-translate` გამოყენებით. მსგავსი მიდგომა ეფექტურია ისეთი ტიპის ვებგვერდებზე, რომლებზეც ხშირად
გვჭირდება ენის ცვლილება, მაგალითისთვის როგორიცა სასწავლებელი ვებგვერდები.

რომელი ხელსაწყო ავარჩიოთ ჩვენი ვებგვერდისთვის? ამას განვიხილავთ [შეჯამებაში](./summary.html).