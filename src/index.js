import { parse } from 'svelte/compiler';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';

let defaultOptions = {
	classSeparator: ',',
	delimiters: ['', ''],
	directiveReplacement: 'data-class-original'
}

function validateOptions({ classSeparator, delimiters, directiveReplacement }) {
	if (classSeparator !== undefined) {
		if (!(isString(classSeparator) && classSeparator.length === 1)) {
			throw new Error('the "classSeparator" option must be a string with 1 character')
		}		
	}

	if (delimiters !== undefined) {
		if (!(Array.isArray(delimiters) && delimiters.length === 2)) {
			throw new Error('the "delimiters" option must be an array with 2 elements')	
		}

		for (let delimiter of delimiters) {
			if (!isString(delimiter)) {
				throw new Error('the values in the "delimiters" array must be a string');
			}
		}
	}

	if (directiveReplacement !== undefined) {
		if (!isString(directiveReplacement)) {
			throw new Error('the "directiveReplacement" option must be a string')
		}
	}
}

function isString(val) {
	return typeof val === 'string';
}

// function isSingleChar(val) {
// 	return isString(val) && val.length === 1;
// }

function splitClassDirective(node, s, options) {

	console.log('splitClassDirective', { node })

	let directiveValue = node.name;
	console.log({ directiveValue })


	if (directiveValue.charAt(0) === options.delimiters[0]) {
		directiveValue = directiveValue.slice(1);
	}

	if (directiveValue.charAt(directiveValue.length - 1) === options.delimiters[1]) {
		directiveValue = directiveValue.slice(0, -1);
	}

	let classList = directiveValue.split(options.classSeparator);
	console.log({ classList })
	let expression = s.slice(node.expression.start, node.expression.end);

	for (let classItem of classList) {
		if (classItem === '') { continue } // test

		let classDirectiveSingle = `class:${classItem}={${expression}} `;
		console.log({ classDirectiveSingle })
		
		s.appendLeft(node.start, classDirectiveSingle);		
	}

	if (options.directiveReplacement === '') {
		s.remove(node.start, node.end);	
	}
	else {
		s.update(node.start, node.start + 5, options.directiveReplacement);
	}

}

function preprocessor(customOptions) {
	let options = Object.assign({}, defaultOptions, customOptions);

	validateOptions(options);

	let out = {
		markup: function markup ({ content: contentOriginal, filename }) {

			//console.log({ filename })
			//return { code: contentOriginal }

			let ast;

			try {
				ast = parse(contentOriginal); 
				// console.log('ast\n', ast);
				// console.log('ast.html\n', ast.html);
				console.log('ast.html.children\n', ast.html.children);
				console.log('ast.html.children[0]\n', ast.html.children[0]);
				// console.log('ast.html.children[0].children[0]\n', ast.html.children[0].children[0]);
				// console.log('ast.html.children[0].children[1]\n', ast.html.children[0].children[1]);
				// console.log('ast.html.children[1]\n', ast.html.children[1]);
				console.log('---')
			}
			catch(err) {
				console.log({ err })
				return { code: contentOriginal }
			}

			for(let node of ast.html.children) {
				if (node.type === 'Comment' && node.data.trim().toLowerCase() === 'class-directive-ignore') {
					// TODO: send 
					return { code: contentOriginal }		
				}
			}

			let s = new MagicString(contentOriginal, { filename });

			walk(ast.html.children, {
			  enter(node, parent, prop/*, index*/) {
			    
			    // reference: https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/compiler/legacy.js#L198-L200
			  	let isClassDirective = (prop === 'attributes' && node.type === 'Class');

			  	if (!isClassDirective) { return }

		  		splitClassDirective(node, s, options);
			  },
			});
			
			return {
				code: s.toString(),
				// map: s.generateMap()
				// map: s.generateMap({
				// 	source: filename,
				// 	includeContent: false,
				// 	hires: true
				// })
				
			}

		}
	}

	return out;

}

// export {
// 	sveltePreprocessClassDirective
// }

export default preprocessor;