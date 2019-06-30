const fs = require('fs');
const Module = require('module');
const requireFromString = require('require-from-string');
const espree = require('espree');
const tokenTypes = require('espree/lib/ast-node-types');

const getFileContentSync = (moduleName) => {
    const resolvedFilepath = Module._resolveFilename(moduleName, module.parent);
    return fs.readFileSync(resolvedFilepath).toString('utf-8');
};

const parseContent = (moduleContent) => {
    return espree.parse(moduleContent, { ecmaVersion: 6 });
};

const collectUnexposedFunctionsAndVariables = (ast) => {
    return ast.body.reduce((unexposedVariableNames, rootExpression) => {
        if ([
            tokenTypes.VariableDeclaration,
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
        return unexposedVariableNames;
    }, []);
};

const addGetFunction = (unexposedVariableNames) => {
    let result = `exports.__get__ = function(variableName) {`;

    unexposedVariableNames.forEach((variableName) => {
        result += `
    if (variableName === '${ variableName }') {
        return ${ variableName };
    }
`;
    });
    result += `
    throw new Error(variableName + ' is not defined in the root scope');
};
`;

    return result;
};

const addSetFunction = (unexposedVariableNames) => {
    let result = `exports.__set__ = function(variableName, newValue) {`;
    unexposedVariableNames.forEach((variableName) => {
        result += `
    if (variableName === '${ variableName }') {
        ${ variableName } = newValue;
        return;
    }
`;
    });
    result += `
    throw new Error(variableName + ' is not defined in the root scope');
};
`;
    return result;
};

function replaceRange(string, start, end, substitute) {
    return string.substring(0, start) + substitute + string.substring(end);
}

const replaceConstWithLet = (moduleContent) => {
    function helper(nodeIndex, ast, moduleContent) {
        for (let i = nodeIndex; i < ast.body.length; i++) {
            const rootNode = ast.body[i];
            if (tokenTypes.VariableDeclaration === rootNode.type) {
                if (rootNode.kind === 'const') {
                    moduleContent = replaceRange(moduleContent, rootNode.start, rootNode.start + 'const'.length, 'let');
                    return helper(i + 1, parseContent(moduleContent), moduleContent);
                }
            }
        }
        return moduleContent;
    }

    return helper(0, parseContent(moduleContent), moduleContent);
};

module.exports = (moduleName) => {
    let moduleContent = getFileContentSync(moduleName);
    const ast = parseContent(moduleContent);

    const unexposedVariableNames = collectUnexposedFunctionsAndVariables(ast);
    moduleContent = replaceConstWithLet(moduleContent);

    let wrapped = moduleContent;
    wrapped += addGetFunction(unexposedVariableNames);
    wrapped += addSetFunction(unexposedVariableNames);

    return requireFromString(wrapped);
};
