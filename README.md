nanoislands-check-nb-call
=========================

[![Build Status](https://travis-ci.org/yandex-ui/nanoislands-check-nb-call.png?branch=master)](https://travis-ci.org/yandex-ui/nanoislands-check-nb-call)

Прототип защиты от XSS в nanoislands.

Проблема состоит в том, что часто надо прокидывать html-разметку в вызовы `nb-*`. Но это черевато XSS.

Чтобы упростить API, в `nanoislands` делается вот так:
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

## Алгоритм проверки
**Всё - теоретический XSS!**

Есть два типа разрешенных вызова:
 1. `content` имеет тип xml, т.е. прошел через `yate` и безопасен для вставки. Сюда попадают и вызовы функций, возвращающие xml.
 2. `content` имеет тип `scalar`, вычисляем (т.е. статичен) и не имеет `<>`
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

Проверяются все свойства `*content*` (в т.ч. `buttonContent`, `leftContent` и т.п.) в вызовах nb-функций.

Игнорируется свойство `content` для `nb-input` и `nb-textarea`, потому что оно используются безопасно.

## Запуск

```sh
$ node ./bin/nb-check-call my-templates.yate
```
