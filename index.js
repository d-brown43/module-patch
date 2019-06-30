const path = require('path');
const fs = require('fs');
const Module = require('module');
const requireFromString = require('require-from-string');
const espree = require('espree');
const tokenTypes = require('espree/lib/ast-node-types');

module.exports = (moduleName) => {
    const resolvedFilepath = Module._resolveFilename(moduleName, module.parent);
    const moduleContent = fs.readFileSync(resolvedFilepath).toString('utf-8');

    const unexposedVariableNames = [];

    espree.parse(moduleContent, { ecmaVersion: 6 }).body.forEach((rootExpression) => {
        if ([
            tokenTypes.AssignmentExpression,
            tokenTypes.VariableDeclaration,
            tokenTypes.VariableDeclarator,
            tokenTypes.ExpressionStatement,
            tokenTypes.FunctionDeclaration,
        ].includes(rootExpression.type)) {
            // console.log(JSON.stringify(rootExpression, null, 4));
            if (rootExpression.type === tokenTypes.VariableDeclaration) {
                rootExpression.declarations.forEach((declaration) => {
                    if (declaration.type === tokenTypes.VariableDeclarator) {
                        unexposedVariableNames.push(declaration.id.name);
                    }
                });
            }

            if (rootExpression.type === tokenTypes.FunctionDeclaration) {
                unexposedVariableNames.push(rootExpression.id.name);
            }
        }
    });

    // console.log(unexposedVariableNames);

    let wrapped = `(function() {\n` + moduleContent;

    wrapped += `exports.__get__ = function(variableName) {\n`;

    unexposedVariableNames.forEach((variableName) => {
        wrapped += `if (variableName === '${ variableName }') {
            return ${ variableName };
        }
        `;
    });
    wrapped += `throw new Error(variableName + ' is not defined in the root scope');
    };
    `;

    wrapped += '})();';

    return requireFromString(wrapped);
};
