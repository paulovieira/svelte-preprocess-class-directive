let SvelteCompiler = require('svelte/compiler');
let MagicString = require( 'magic-string' );

let options;  // set in the default export

let defaultOptions = {
	classSeparator: ';',
	delimiters: ['(', ')'],
}

function validateOptions() {

	let { classSeparator, delimiters } = options;

	if (/^.$/.test(classSeparator) === false) {
		throw new Error('the "classSeparator" option must be a string with 1 character')
	}

	if (delimiters !== null) {
		if (!Array.isArray(delimiters) || delimiters.length !== 2) {
			throw new Error('the "delimiters" option must be an array with 2 elements')	
		}

		if (/^.$/.test(delimiters[0]) === false || /^.$/.test(delimiters[1]) === false) {
			throw new Error('the elements in the "delimiters" array must be a string with 1 character')
		}
	}
}

function walkDom(children, s, level = -1) {

	level++;
	//console.log({ 'children.length': children.length });

    for(let i = 0; i < children.length; i++) {
        let node = children[i];
        //console.log({ level, 'node.type': node.type, 'node.name': node.name, 'node.data': node.data })

        if (node.type !== 'Element') { continue }
        

    	//console.log({ node })

        //console.log(el.name, el.attribs)
    	//console.log({ 'node.attributes.length': node.attributes.length })

    	for (let j = 0; j < node.attributes.length; j++) {

    		let { type, name } = node.attributes[j];

    		if (type !== 'Class') { continue }
    		
    		// simple case: the classes are grouped in one attribute

    		if (options.classSeparator !== ' ') {

				if (options.delimiters == null) {

					// one common case should be no delimiters and a single class in the directive: class:c1
					// no need to proceed to the splitting in this case

					let hasClassSeparator = name.indexOf(options.classSeparator) !== -1;

					if (!hasClassSeparator) { continue }

					splitClassDirectiveSimple(name, node.attributes[j], s);
				}
				else {
					let hasBalancedDelimiters = name.charAt(0) === options.delimiters[0] && name.charAt(name.length - 1) === options.delimiters[1];
					
					if (!hasBalancedDelimiters) { continue }

					// when delimiters are being used, we always proceed to splitting; even if a single
					// class is being used, the splitting is necessary to remove the delimiters;

					splitClassDirectiveSimple(name.slice(1, -1), node.attributes[j], s);
				}

    		}

    		// complex case: the classes are scattered in 2 or more attributes

    		else {
    			let hasStartDelimiter = name.charAt(0) === options.delimiters[0];
    			
    			if (!hasStartDelimiter) { continue }

    			let classes = name.slice(1);
    			let attributesWithClasses = [node.attributes[j]];

    			// loop until we find the attribute that has the end delimiter

    			for (let k = j + 1; k < node.attributes.length; k++) {

    				if (node.attributes[k].type !== 'Attribute')  {
    					//console.warn('Expected an attribute of type Attribute')
    				}

    				let { name : name2 } = node.attributes[k];
    				//console.log({ name2 })
    				classes = classes + ' ' + name2;
    				attributesWithClasses.push(node.attributes[k])

    				let hasEndDelimiter = name2.charAt(name2.length - 1) === options.delimiters[1];

    				if (hasEndDelimiter) { break }
    			}

    			// console.log({
    			// 	classes,
    			// 	'classes.slice(0, -1)': classes.slice(0, -1)
    			// })
    			splitClassDirectiveComplex(classes.slice(0, -1), attributesWithClasses, s);
    		}

    		/*
    		let hasClassSeparator = name.indexOf(options.classSeparator) !== -1;
    		if (options.delimiters == null) {
    			if (hasClassSeparator) {
    				splitClassDirective(node.attributes[j], s);    				
    			}
    		}
    		else if (options.delimiters != null) {

    			if (options.classSeparator !== ' ') {
    				
    				let hasBalancedDelimiters = name.charAt(0) === options.delimiters[0] && name.charAt(name.length - 1) === options.delimiters[1];
    			}
 				else {

 				}
    		}

    		*/
    	}
    	//console.log('going down...')
        walkDom(node.children, s, level);
    }
    //console.log('going up...')

}

function splitClassDirectiveSimple(name, directive, s) {

	//console.log('splitClassDirectiveSimple', { name, directive })

	let singleClasses = name.split(options.classSeparator);

	singleClasses.forEach((singleClass, idx) => {

		singleClass = singleClass.trim();

		// TEST class:
		// nothing will be added; the original directive will be removed

		if (singleClass === '') { return }

		let singleClassDirective = `class:${singleClass}={${s.slice(directive.expression.start, directive.expression.end)}}`;
		
		if (idx < singleClasses.length - 1) { singleClassDirective += ' ' }

		s.appendLeft(directive.start, singleClassDirective);
	})

	s.remove(directive.start, directive.end)
}

function splitClassDirectiveComplex(classes, attrsWithClasses, s) {

	//console.log('splitClassDirectiveComplex', { classes, attrsWithClasses })

	let singleClasses = classes.split(options.classSeparator);

	let directive = attrsWithClasses[0];
	let { expression } = attrsWithClasses[attrsWithClasses.length - 1].value[0];

	singleClasses.forEach(singleClass => {

		singleClass = singleClass.trim();

		// TEST class:;;;
		// nothing will be added; the original directive will be removed

		if (singleClass === '') { return }

		s.appendLeft(directive.start, `class:${singleClass}={${s.slice(expression.start, expression.end)}} `);	
	});

	attrsWithClasses.forEach(attrObj => {

		s.remove(attrObj.start, attrObj.end);
	});

}

//module.exports = function sveltePreprocessClassDirective(customOptions) {
module.exports.sveltePreprocessClassDirective = function sveltePreprocessClassDirective(customOptions) {

	options = Object.assign({}, defaultOptions, customOptions);

	validateOptions();

	let out = {
		markup: function markup ({ content: contentOriginal, filename }) {

			//console.log({ filename })
			//return { code: contentOriginal }

			let ast = SvelteCompiler.parse(contentOriginal); 

			for(let i = 0; i < ast.html.children.length; i++) {
				let node = ast.html.children[i];
				if (node.type === 'Comment' && node.data.trim().toLowerCase() === 'class-directive-disable') {
					//console.log('SKIP')
					return { code: contentOriginal }		
				}
			}

			let s = new MagicString(contentOriginal, { filename });

			// SvelteCompiler.walk(ast.html.children, {
			// 	enter(node, parent, prop, index) {
			// 		console.log({ node, prop, index })
			// 	},
			// 	leave(node, parent, prop, index) {
			// 		//console.log('leave', { node, prop, index })
			// 	}
			// });


			walkDom(ast.html.children, s);
			//console.log({ 'ast.html': ast.html })
			//let attributes = ast.html.children[2].children[1].attributes;
			//console.log(attributes[0])


			//console.log({ contentOriginal, contentModified: s.toString(),  })

			
			return {
				code: s.toString(),
				map: s.generateMap()
			}

		}
	}

	return out;

}


