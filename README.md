nanoislands-check-nb-call
=========================

[![Build Status](https://travis-ci.org/yandex-ui/nanoislands-check-nb-call.png?branch=master)](https://travis-ci.org/yandex-ui/nanoislands-check-nb-call)

Прототип защиты от XSS в nanoislands.

Проблема состоит в том, что часто надо прокидывать html-разметку в вызовы `nb-*`. Но это черевато XSS.

Чтобы упростить API, хочется делать вот так:
```

match / {
    islandHTMLContent = apply / island-content
    nb-island({
        content: islandHTMLContent 
    })
}

func nb-island (obj) {
    // ...
    
    // вставляем .content как есть без эскейпинга
    html(.content)

    // ...
}
```

Или можно городить [вот такие конструкции](https://github.com/yandex-ui/nanoislands/pull/115)


Пока пришли к такой проверке:
 1. `content` должен быть типом xml, т.е. прошел через `yate` и безопасен для вставки. Сюда попадают и вызовы функций, возвращающие xml.
 2. Если `content` имеет тип `scalar`, состоит из одного элемента и не имеет `<>`, то тоже подходит
```
nb-island({
        content: 'OK' 
})
nb-island({
        content: 'OK &lt;' 
})
nb-island({
        content: '<FAIL>' 
})
```

 3. Все остальное - теоретический XSS и должны быть запрещены.



Пока проверяются вызовы (указывается в конфиге):
 * `nb-island` и свойство `content`
 * `nb-checkbox` и свойство `text`

## Запуск

```sh
$ node ./check.js my-templates.yate
```
