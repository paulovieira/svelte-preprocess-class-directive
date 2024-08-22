let consoleDirOptions = { depth: 10, colors: true };

class ASTNode {
    constructor(type, value, level = null, start = null, end = null, prefix = '') {
        this.type = type; // 'token' or 'group'
        this.value = value; // string for 'token', array of ASTNodes for 'group'
        this.level = level;
        this.start = start;
        this.end = end;
        this.prefix = prefix;
    }
}



function parse(inputStr) {
    let stack = [];
    let getCurrentGroup = () => {
        let currentGroup = stack[stack.length - 1];

        if (currentGroup == null) {
            throw new Error('invalid input');
        }

        return currentGroup;
    };
    // let currentGroup = null;
    // let previousGroup = null;

    // let level = 0;
    let rootGroup = new ASTNode('group', [], 0);
    stack.push(rootGroup);
    // let currentGroup = stack[stack.length - 1];
    //console.log('before', { rootGroup, stack });
    
    for (let i = 0; i < inputStr.length; i++) {
        // console.log('------------')
        // console.log(`i=${i}`)
        if (inputStr[i] === '(') {
            // console.log('case: (')
            // level = level + 1;
            let currentGroup = getCurrentGroup();
            let newGroup = new ASTNode('group', [], currentGroup.level + 1);
            currentGroup.value.push(newGroup);

            // previousGroup = currentGroup;
            // currentGroup = newGroup;
            stack.push(newGroup);
            // currentGroup = stack[stack.length - 1];
            // console.dir({ currentGroup, stack }, consoleDirOptions);
            // currentGroup = newGroup;
            // console.dir({ 'currentGroup (updated)': currentGroup }, consoleDirOptions);
        } else if (inputStr[i] === ')') {
            // console.log('case: )')
            stack.pop();

            if (getCurrentGroup() == null) {
                throw new Error('invalid input');
            }
            // console.dir({ stack }, consoleDirOptions);
            // currentGroup = stack[stack.length - 1];
            // console.dir({ 'currentGroup (updated)': currentGroup }, consoleDirOptions);

            // level = level - 1;
            // currentGroup = previousGroup;
        } else if (inputStr[i] === ',') {
            // console.log('case: ,')
            continue;
        } else {
            
            let token = '';
            let start = i;
            while (i < inputStr.length && !['(', ')', ','].includes(inputStr[i])) {
                token += inputStr[i];
                i++;
            }
            
            let currentGroup = getCurrentGroup();
            let newToken = new ASTNode('token', token, null, start, i);
            currentGroup.value.push(newToken);

            // console.dir({ currentGroup }, consoleDirOptions);
            i--; // Adjust for the next iteration
        }
    }

    if (stack.length !== 1) {
        throw new Error('invalid input');
    }

    return stack[0];
}

function expandASTOld(astNode, prefix = '') {
    if (astNode.type === 'token') {
        return [prefix ? `${prefix}-${astNode.value}` : astNode.value];
    } else if (astNode.type === 'group') {
        let results = [];
        for (let child of astNode.value) {
            let expanded = expandAST(child);
            if (results.length === 0) {
                results = expanded;
            } else {
                let newResults = [];
                for (let res of results) {
                    for (let exp of expanded) {
                        newResults.push(`${res}-${exp}`);
                    }
                }
                results = newResults;
            }
        }
        return results.map(res => prefix ? `${prefix}-${res}` : res);
    }

    return [];
}

function stringify(ast, expand = true) {
    let out = [];
    // console.log({ ast })
    if (ast.type === 'token') {
        return ast.value;
    }
    else if (ast.type === 'group') {
        // let temp = [];
        for (let i = 0; i < ast.value.length; i++) {
            let val = stringify(ast.value[i]);
            // console.log({ i, val })
            out.push(val);
        }

        if (ast.level === 0) {
            console.log('xxx', out)

        }

        return out;
    }
    else {
        throw new Error('invalid type')
    }


    
}




// function spreadTokens(inputStr) {
//     let ast = parse(inputStr);

//     console.log('===')
//     console.dir(ast, consoleDirOptions)
//     console.log('===')
    
//     //let expandedTokens = expandAST(ast);
//     let expanded = stringify(ast);
//     console.log({ expanded })
//     // let expandedTokens = distributeAST(ast);
//     //return expandedTokens.join(',');
// }

// Example usage
//let inputStr = "x-(a-(b,c))";
// let inputStr = "aa,bb";
let inputStr = "aa(bb,cc),dd";
// let inputStr = "aa(bb(cc,dd)),ee";
// let inputStr = "aa(bb,cc),dd(ee,ff)";
// let inputStr = "aa(bb(cc,dd)),ee,(ff(gg,hh))";
// let outputStr = spreadTokens(inputStr);
// console.log(outputStr);  // Output should be "x-a-b,x-a-c"


let ast = parse(inputStr);

console.log('===')
console.dir(ast, consoleDirOptions)
console.log('===')

//let expandedTokens = expandAST(ast);
function applyPrefix(prefix, expanded) {

    let out = [];

    // will only handle the cases where we have a prefix and a group next to it

    for (let i = 0; i < expanded.length; i++) {
        if (typeof expanded[i] === 'string') {
            expanded[i] = prefix + expanded[i];
            let temp = [];

            if (Array.isArray(expanded[i+1])) {
                temp = applyPrefix(expanded[i], expanded[i+1]);
                // console.log({ temp })
                // out = out.concat(temp);
            }
            else {
                // out.push(expanded[i]);
                temp = [expanded[i]]
            }

            out = out.concat(temp);
        }

        // if (typeof expanded[i] === 'string') {
        //     expanded[i] = prefix + expanded[i];
        // }
        // if (typeof expanded[i] === 'string' && Array.isArray(expanded[i+1])) {
        //     let temp = applyPrefix(expanded[i], expanded[i+1]);
        //     console.log({ temp })
        //     out = out.concat(temp);
        // }
        // else if (typeof expanded[i] === 'string') {
        //     out.push(expanded[i]);
        // }
        // console.log({ i, val })
        // out.push(val);
    }

    return out.join(',');
}
 
let expanded = stringify(ast);
console.dir({ expanded }, consoleDirOptions);
let expanded2 = applyPrefix('', expanded);
console.dir({ expanded, expanded2 }, consoleDirOptions);


