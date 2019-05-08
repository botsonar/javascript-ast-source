var esprima = require("esprima");
var estraverse = require("estraverse");
var escodegen = require("escodegen");

var scopeList = [];

const code = `
const pi = 3.14;

function sum(number_list) {
let total = 0;
for (let a in number_list) {
    total += a;
}
return total
}

const multi = function(a, b){
{
    let c = 4;
}
return a * b;
}
`;
var ast = esprima.parse(code, { loc: true });

estraverse.traverse(ast, {
  enter: enter,
  leave: leave
});

// convert to javascript
console.log("javascript: ");
console.log(escodegen.generate(ast));

// enter the node
function enter(node) {
  if (createsNewScope(node)) {
    scopeList.push({});
  }

  if (node.type === "VariableDeclarator") {
    var currentScope = scopeList[scopeList.length - 1];
    currentScope[node.id.name] = null;
    if (node.init) {
      currentScope[node.id.name] = node.init.value;
    }
  }

  if (
    node.type === "FunctionDeclaration" ||
    node.type == "FunctionExpression"
  ) {
    var currentScope = scopeList[scopeList.length - 1];
    for (const val of node.params) {
      currentScope[val.name] = "funtion_params_" + val.name;
    }
  }
  if (node.type === "AssignmentExpression") {
    var currentScope = scopeList[scopeList.length - 1];
    currentScope[node.left.name] = node.right.value;
    // console.log("update variable: ", node.left.name);
  }

  if (node.type === "Identifier") {
    let _var = findVariableInScopeStack(node.name);
    let regex = RegExp("funtion_params");
    if (_var && regex.test(_var)) {
      node.name = _var;
    }
  }
}

// leave the node
function leave(node) {
  if (createsNewScope(node)) {
    scopeList.pop();
  }
}

// new scope
function createsNewScope(node) {
  return (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "Program" ||
    node.type === "BlockStatement"
  );
}

// find variable in scope stack
function findVariableInScopeStack(name) {
  for (const scope of scopeList) {
    if (name && scope && name in scope) {
      return scope[name];
    }
  }
  return null;
}