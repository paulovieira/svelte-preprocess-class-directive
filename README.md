# svelte-preprocess-class-directive

A svelte preprocessor that adds syntactic sugar for multiple css classes in the [class directive](https://svelte.dev/docs#class_name).

## Introduction / motivation

The [class directive](https://svelte.dev/docs#class_name) in svelte can be used to toggle only one css class, depending on some expression:

```js
<script>

// example 1

function isActive() {
	// ...
}

</script>

<style>

.active {
	font-weight: 700;
	color: green;	
}

</style>


<div class:active={isActive()}>...</div>
```

However in some scenarions it's desirable to toggle two or more classes:

```js
<script>

// example 2

function isActive() {
	// ...
}

</script>

<div class:font-bold={isActive()} class:text-green-500={isActive()}>...</div>
```

This works because it's possible to use multiple `class:` directives in a svelte component. However it makes the code ugly and redundant because the expression is repeated for different classes. And when the styling is done using a [utility-first framework](https://tailwindcss.com/docs/utility-first) (such as Tailwind CSS) it's normal to toggle 5 or 10 classes, not 2.

This preprocessor extends the `class:` directive to allow multiple classes to be toggled (depending on one expression):

```js
<script>

// example 3

function isActive() {
	// ...
}

</script>

<div class:font-bold,text-green-500={isActive()}>...</div>
```

The previous 2 code snippets are identical when this preprocessor is used, that is, it will convert example 3 into example 2. The preprocessor recognizes that the original class name (`font-bold,text-green-500`) is actually a list of class names (because it has a comma, which is the default separator). The original `class:` directive is splitted into multiple `class:` directives. Because of this all the expected features (such as reactivity) are intact.



Options

Install

Install in your svelte application:
```sh
npm install svelte-preprocess-class-directive --save-dev
```

It's likely that you're using rollup or webpack to build the app.

Add to...

## TODO

- allow the special comment `class-directive-disable` to work more efficiently, if it is the first comment in component (that is, don't call `SvelteCompiler.parse` in that case); 
	-the original content should be split by lines? to avoid calling a regular expression in the whole content (which can be large)
	-or maybe use `str.startsWith` + `s.trim()`?
- deactivated by default (enable with a comment like `class-directive-enable`)
- add notes about performance when used in a medium-large app
- add test for `class:active` (without expression)
- add reference to the relevant issue + PR + RFC