let test = require('tape');
let { sveltePreprocessClassDirective } = require('../index.js');

let trim = s => s.trim();

test('comma separator, without delimiters', function (t) {

	let input = trim(`

		<main class:c1,c2={true}>Hello world</main>

	`);

	let expected = trim(`

		<main class:c1={true} class:c2={true}>Hello world</main>

	`)

	let preprocessor = sveltePreprocessClassDirective({ classSeparator: ',', delimiters: null });
	let actual = preprocessor.markup({ content: input })

	t.equal(actual.code, expected);

    t.end()
});

test('comma separator, without delimiters, with a single class', function (t) {

	let input = trim(`

		<main class:c1={true}>Hello world</main>

	`);

	let expected = trim(`

		<main class:c1={true}>Hello world</main>

	`)

	let preprocessor = sveltePreprocessClassDirective({ classSeparator: ',', delimiters: null });
	let actual = preprocessor.markup({ content: input })
	
	t.equal(actual.code, expected);

    t.end()
});

test('comma separator, with delimiters', function (t) {

	let input = trim(`

		<main class:(c1,c2)={true}>Hello world</main>

	`);

	let expected = trim(`

		<main class:c1={true} class:c2={true}>Hello world</main>

	`)

	let preprocessor = sveltePreprocessClassDirective({ classSeparator: ',', delimiters: ['(',')'] });
	let actual = preprocessor.markup({ content: input })

	t.equal(actual.code, expected);

    t.end()
});

test('comma separator, with delimiters with a single class', function (t) {

	let input = trim(`

		<main class:(c1)={true}>Hello world</main>

	`);

	let expected = trim(`

		<main class:c1={true}>Hello world</main>

	`)

	let preprocessor = sveltePreprocessClassDirective({ classSeparator: ',', delimiters: ['(',')'] });
	let actual = preprocessor.markup({ content: input })
	
	t.equal(actual.code, expected);

    t.end()
});

test('disabling with the special comment', function (t) {

	let input = trim(`
		<!-- class-directive-ignore -->
		<main class:c1,c2={true}>Hello world</main>

	`);

	let expected = trim(`
		<!-- class-directive-ignore -->
		<main class:c1,c2={true}>Hello world</main>

	`)

	let preprocessor = sveltePreprocessClassDirective({ classSeparator: ',', delimiters: null });
	let actual = preprocessor.markup({ content: input })

	t.equal(actual.code, expected);

    t.end()
});