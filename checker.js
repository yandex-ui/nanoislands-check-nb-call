/**
 * Created by aandrosov on 30.12.13.
 */

var yate = require('yate');

const EXCLUDE_FUNCTIONS = [
    'nb-block',
    'nb-deep-extend',
    'nb-extend',
    'nb-uniq',
    'nb-warn',
    'nb-wrap'
];

exports.check = function(input) {

    var errors = [];

    var res = yate.compile(input);
    var root = res.ast.p.Block;

    // ищем определение функций
    var funcIDS = findNBFuncs(root.scope);

    // парсим все вызовы в функциях
    root.p.Defs.p.Items.forEach(function(funcDecl) {
        var isExternal = funcDecl.f.IsExternal;
        if (!isExternal) {
            findNbIslandCall(funcDecl);
        }
    });

    // парсим все вызовы в шаблонах
    root.p.Templates.p.Items.forEach(function(tmplDecl) {
        findNbIslandCall(tmplDecl);
    });

    function printWhere(funcCall) {
        return funcCall.where.input.filename + ' ' + (funcCall.where.y + 1) + ':' + funcCall.where.x;
    }

    function printCall(funcCall, arg) {
        if (arg.p.Expr) {
            arg = arg.p.Expr;
            return funcCall.p.Name + '( ' + arg.p.Name + ':' + arg.p.AsType + ' )';
        } else {
            return funcCall.p.Name + '( :' + arg.p.AsType + ' )';
        }
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

                // не проверяем сами nanoislands
                if (/node_modules\/nanoislands\/blocks\/.*?\/.*?.yate$/.test(funcCall.where.input.filename)) {
                    return;
                }

                console.log(' call', printCall(funcCall, funcCallArg), printWhere(funcCall));

                // инлайн-объект
                if (funcCallArg.p.Block) {
                    checkObject(funcCallArg);

                } else {
                    // id переменной, которую передаем как аргумент
                    var varId = funcCallArg.p.Expr.p.Id;

                    body.p.Defs.p.Items.forEach(function(decl) {
                        if (decl.p.Id == varId) {
                            console.log('  ', decl.p.Name, 'is', decl.p.Value.__type);
                            checkObject(decl.p.Value);
                        }
                    });
                }
            }
        });
    }

    function checkObject(decl) {
        var propsDecl = decl.p.Block;
        propsDecl.p.Exprs.p.Items.forEach(function(prop) {
            var propType = prop.p.Value.__type;
            var propName = prop.p.Key.p.Value.p.Items[0].p.Value;

            var checkResult = '';
            var checkResult2 = '';
            var value = '';
            if (propName.toLowerCase().indexOf('content') > -1) {
                checkResult = ' ** OK';
                if (propType != 'xml') {
                    checkResult = ' ** ACHTUNG! **';

                    var someVal = prop.p.Value.p.Value;
                    if (someVal.p.Name) {
                        value = 'var ' + someVal.p.Name;

                    } else {

                        if (prop.p.Value.p.Value.p.Expr) {
                            /*
                            nb-checkbox({
                                'content': .xss-data
                            })
                            */
                            value = '';
                            errors.push({
                                error: 'INVALID_TYPE',
                                propName: propName,
                                propType: propType,
                                where: {
                                    line: prop.where.y + 1,
                                    column: prop.where.x,
                                    filename: prop.where.input.filename
                                }
                            });

                        } else {
                            value = prop.p.Value.p.Value.p.Value.p.Items.map(function(item) {
                                if (item.p.Value) {
                                    if (/<[a-z]|<\/[a-z]/i.test(item.p.Value)) {
                                        errors.push({
                                            error: 'STRING_HAS_TAGS',
                                            propName: propName,
                                            propType: propType,
                                            propValue: item.p.Value,
                                            where: {
                                                line: prop.where.y + 1,
                                                column: prop.where.x,
                                                filename: prop.where.input.filename
                                            }
                                        });
                                        checkResult2 = ' ** HAS TAGS!!! **';
                                    }

                                    return JSON.stringify(item.p.Value);

                                } else {
                                    return 'some_expr';
                                }
                            }).join(' + ');
                        }
                    }
                }
            }

            console.log('    ', propName, ':', propType, checkResult, value, checkResult2);
        });
    }

    /**
     * Находит все функции, начинающиеся с nb-
     * @param {Object} scope
     * @returns {Array}
     */
    function findNBFuncs(scope) {
        var nbFuncs = [];

        var functions = scope.functions;
        for (var funcName in functions) {
            if (funcName.indexOf('nb-') === 0 && EXCLUDE_FUNCTIONS.indexOf(funcName) === -1) {
                nbFuncs.push( functions[funcName].p.Id );
            }
        }

        return nbFuncs;
    }

    return errors;
};

exports.printErrors = function(errors) {
    errors.forEach(function(error) {
        console.log('...', error);
    });
};
