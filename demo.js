import { sveltePreprocessClassDirective } from './src/index.js';
let trim = s => s.trim();

function main() {

	// <main data-xyz=abc class:c1,c2={true} id=123 use:foo on:foo bind:foo bind:this style:foo transition:foo selected in:foo2 out:foo3><span>child_1</span>Hello world</main><div>sibling_1</div>

	let input = trim(`

<main class:[x,,y]={true} data-id=xxx>the_text</main><div>sibling_1</div>

	`);

	//let preprocessor = sveltePreprocessClassDirective({ classSeparator: ',', directiveRelacement: 'ii' });
	let preprocessor = sveltePreprocessClassDirective({ delimiters: ['[', ']']});
	let actual = preprocessor.markup({ content: input })

	console.log(actual.code)
}

main();
