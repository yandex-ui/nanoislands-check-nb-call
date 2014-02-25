/**
 * Created by aandrosov on 30.12.13.
 */

var yate = require('yate');
var Errors = require('./errors');

const EXCLUDE_FUNCTIONS = [
    'nb-block',
    'nb-deep-extend',
    'nb-extend',
    'nb-uniq',
    'nb-warn',
    'nb-wrap'
];

exports.check = function(input, importModule, opts) {
    opts = opts || {};

    var errors = new Errors();

    yate.modules = {};
    if (importModule) {
        var obj = JSON.parse( require('fs').readFileSync(importModule, 'utf-8') );
        yate.modules[ obj.name ] = obj;
    }

    if (opts['ast']) {
        yate.cliOptions['write-ast'] = true;
        // use yate parse to write AST
        yate.parse(input);
    }

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

    function findNbIslandCall(decl) {
        // у функций, которые возвращаеют статический контент, Body нет
        if (!decl.p.Body) {
            return;
        }

        var body = decl.p.Body.p.Block;

        // пробежимся по всем выражениям
        body.p.Exprs.p.Items.forEach(function(funcExpr) {
            // нам надо выражение, у которого Id == Id nb-функции
            if (funcExpr.p.Value && funcIDS.indexOf(funcExpr.p.Value.p.Id) > - 1) {
                var funcCall = funcExpr.p.Value;

                // не проверяем сами nanoislands
                if (/node_modules\/nanoislands\//.test(funcCall.where.input.filename)) {
                    return;
                }

                // key declaration
                if (!funcCall.p.Args) {
                    return;
                }

                var funcCallArg = funcCall.p.Args.p.Items[0].p.Expr;

                // инлайн-объект
                if (funcCallArg.p.Block) {
                    checkObject(funcCallArg);

                } else {
                    // id переменной, которую передаем как аргумент
                    var varId = funcCallArg.p.Expr.p.Id;

                    body.p.Defs.p.Items.forEach(function(decl) {
                        if (decl.p.Id == varId) {
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

            if (propName.toLowerCase().indexOf('content') > -1) {
                if (propType != 'xml') {

                    var someVal = prop.p.Value.p.Value;

                    /*
                    str = '<text>'

                    nb-checkbox({
                        'content': str
                    })
                     */
                    if (someVal.p.Name) {
                        // пытаемся найти значение переменной, игнорируя внешние функции
                        if (propType === 'scalar' && !someVal.f.IsExternal && !someVal.f.IsUser) {
                            var varId = someVal.p.Id;
                            var parent = someVal;
                            var found = false;
                            // защита от бесконечного цикла
                            var c = 100;

                            var checkDefs = function(def) {
                                if (def.p.Id === varId) {
                                    checkScalarValue(def, errors, propName, propType);
                                    found = true;
                                }
                            };

                            while (c-- && parent && !found) {
                                if (parent.defs) {
                                    parent.defs.forEach(checkDefs);
                                }
                                parent = someVal.scope.parent;
                            }

                            if (c < 1) {
                                throw 'INFINITE LOOP! File a bug to GitHub please.';
                            }

                            if (found) {
                                return;
                            }
                        }

                        /*
                        nb-checkbox({
                            'content': some-var
                        })
                        */
                        errors.add(
                            Errors.TYPE.INVALID_VAR_TYPE,
                            {
                                propName: propName,
                                propType: propType,
                                varName: someVal.p.Name
                            },
                            {
                                line: prop.where.y,
                                column: prop.where.x,
                                filename: prop.where.input.filename
                            }
                        );

                    } else {

                        if (prop.p.Value.p.Value.p.Expr) {
                            /*
                            nb-checkbox({
                                'content': .xss-data
                            })
                            */
                            errors.add(
                                Errors.TYPE.INVALID_TYPE,
                                {
                                    propName: propName,
                                    propType: propType
                                },
                                {
                                    line: prop.where.y,
                                    column: prop.where.x,
                                    filename: prop.where.input.filename
                                }
                            );

                        } else {
                            checkScalarValue(prop, errors, propName, propType);
                        }
                    }
                }
            }
        });
    }

    function checkScalarValue(prop, errors, propName, propType) {
        prop.p.Value.p.Value.p.Value.p.Items.forEach(function(item) {
            if (item.p.Value) {
                if (/<|>/i.test(item.p.Value)) {
                    errors.add(
                        Errors.TYPE.STRING_HAS_TAGS,
                        {
                            propName: propName,
                            propType: propType,
                            propValue: item.p.Value
                        },
                        {
                            line: prop.where.y,
                            column: prop.where.x,
                            filename: prop.where.input.filename
                        }
                    );
                }

            } else {
                errors.add(
                    Errors.TYPE.UNKNOWN,
                    {
                        propName: propName,
                        propType: propType
                    },
                    {
                        line: prop.where.y,
                        column: prop.where.x,
                        filename: prop.where.input.filename
                    }
                );
            }
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

    return {
        errors: errors,
        compiled: res
    };
};
