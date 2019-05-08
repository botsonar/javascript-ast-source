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
}

// leave the node
function leave(node) {
  if (createsNewScope(node)) {
    let currentScope = scopeList.pop();
    console.log("variables inside scope: ", currentScope);
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
```

### scope_check.js

```javascript
// 遍历所有的作用域并标记
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

// enter the node
function enter(node) {
  if (createsNewScope(node)) {
    scopeList.push(node.type);
    console.log("+".repeat(scopeList.length), " enter new scope, type: ", node.type, "start: ", node.loc.start.line);
  }
}

// leave the node
function leave(node) {
  if (createsNewScope(node)) {
    console.log("-".repeat(scopeList.length), " leave scope, type: ", node.type, "start: ", node.loc.start.line);
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
