/**
 * Created by aandrosov on 30.12.13.
 */

var PATH = require('path');
var input = PATH.resolve(process.argv[2]);

var yate = require('yate');

var res = yate.compile(input);
var root = res.ast.p.Block;

var TO_CHECK = [
    {func: 'nb-island', prop: 'content'},
    {func: 'nb-checkbox', prop: 'text'}
];

// ищем определение функций
var funcIDS = findNBFuncs(root.scope, TO_CHECK);

// парсим все вызовы в функциях
root.p.Defs.p.Items.forEach(function(funcDecl) {
    var isExternal = funcDecl.f.IsExternal;
//    console.log('func', funcDecl.p.Name, isExternal ? 'is extenal' : '');
    if (!isExternal) {
        findNbIslandCall(funcDecl);
    }
});

// парсим все вызовы в шаблонах
root.p.Templates.p.Items.forEach(function(tmplDecl) {
//    console.log('tmpl', printSelector(tmplDecl), tmplDecl.p.Mode.p.Value);
    findNbIslandCall(tmplDecl);
});

function printWhere(funcCall) {
    return funcCall.where.input.filename + ' ' + funcCall.where.x + ':' + (funcCall.where.y + 1);
}

function printCall(funcCall, arg) {
    if (arg.p.Expr) {
        arg = arg.p.Expr;
        return funcCall.p.Name + '( ' + arg.p.Name + ':' + arg.p.AsType + ' )';
    } else {
        return funcCall.p.Name + '( :' + arg.p.AsType + ' )';
    }
}

function printSelector(tmplDecl) {
    return tmplDecl.p.Selectors.p.Items.map(function(selector) {
        return selector.p.Key;
    }).join(' | ');
}

function findNbIslandCall(decl) {
    // у функций, которые возвращаеют статический контент, Body нет
    if (!decl.p.Body) {
        return;
    }

    var body = decl.p.Body.p.Block;
    // пробежимся по всем выражениям
    body.p.Exprs.p.Items.forEach(function(funcExpr) {
        // нам надо выражение, у которого Id == Id nb-функции
        var funcIdx;
        if (funcExpr.p.Value && (funcIdx = funcIDS.indexOf(funcExpr.p.Value.p.Id)) > - 1) {
            var funcCall = funcExpr.p.Value;
            var funcCallArg = funcCall.p.Args.p.Items[0].p.Expr;

            console.log(' call', printCall(funcCall, funcCallArg), printWhere(funcCall));

            var propToCheck = TO_CHECK[funcIdx].prop;

            // инлайн-объект
            if (funcCallArg.p.Block) {
                checkObject(funcCallArg, propToCheck);

            } else {
                // id переменной, которую передаем как аргумент
                var varId = funcCallArg.p.Expr.p.Id;

                body.p.Defs.p.Items.forEach(function(decl) {
                    if (decl.p.Id == varId) {
                        console.log('  ', decl.p.Name, 'is', decl.p.Value.__type);
                        checkObject(decl.p.Value, propToCheck);
                    }
                });
            }
        }
    });
}

function checkObject(decl, propToCheck) {
    var propsDecl = decl.p.Block;
    propsDecl.p.Exprs.p.Items.forEach(function(prop) {
        var propType = prop.p.Value.__type;
        var propName = prop.p.Key.p.Value.p.Items[0].p.Value;

        var checkResult = '';
        var checkResult2 = '';
        var value = '';
        if (propName == propToCheck) {
            checkResult = ' ** OK';
            if (propType != 'xml') {
                checkResult = ' ** ACHTUNG! **';

                var someVal = prop.p.Value.p.Value;
                if (someVal.p.Name) {
                    value = 'var ' + someVal.p.Name;

                } else {
                    value = prop.p.Value.p.Value.p.Value.p.Items.map(function(item) {
                        if (item.p.Value) {
                            if (/<[a-z]|<\/[a-z]/i.test(item.p.Value)) {
                                checkResult2 = ' ** HAS TAGS!!! **';
                            }

                            return JSON.stringify(item.p.Value)
                        } else {
                            return 'some_expr';
                        }
                    }).join(' + ');
                }
            }
        }

        console.log('    ', propName, ':', propType, checkResult, value, checkResult2);
    });
}

function findNBFuncs(scope, funcsToFind) {
    return funcsToFind.map(function(funcToFind) {
        var funcToFindName = funcToFind.func;

        var functions = scope.functions;
        for (var funcName in functions) {
            if (funcName == funcToFindName) {
                funcToFind.id = functions[funcName].p.Id;
                return functions[funcName].p.Id;
            }
        }

        throw 'funcToFindName in not defined!';
    });
}
