# svelte-class-directive-extras

A svelte preprocessor that adds syntactic sugar for multiple css classes in the [class directive](https://svelte.dev/docs#class_name).

## Introduction / motivation

The [class directive](https://svelte.dev/docs#class_name) can be used to toggle one css class:

```svelte
<script>

let isActive = false;
let toggle = () => { isActive = !isActive; }

</script>

<style>

.active {
	font-weight: bold;
	color: red;
	text-decoration-line: underline;
}

</style>


<div class:active={isActive}>some content</div>
<button on:click={toggle}>click me</button>
```

However sometimes it's necessary to toggle more than one:

```svelte
<script>

let isActive = false;
let toggle = () => { isActive = !isActive; }

</script>

<style>

.text-red {
	color: red;	
}

.font-bold {
	font-weight: bold;
}

.underline {
	text-decoration-line: underline;
}

</style>


<div class:text-red={isActive} class:font-bold={isActive} class:underline={isActive}>some content</div>
<button on:click={toggle}>click me</button>
```

We can repeat the `class:` directive in the same element, but the simple example above already reveals how ugly this can become.


This works because it's possible to use multiple `class:` directives in a svelte component. However it makes the code ugly and redundant because the expression is repeated for different classes. When the styling is done using a [utility-first framework](https://tailwindcss.com/docs/utility-first) (such as Tailwind CSS) it's normal to toggle 5 or 10 classes, not 2.

Using this [svelte preprocessor](https://svelte.dev/docs/svelte-compiler#preprocess) the markup code in the example above can be simplified to this:

```svelte
<script>
	/* ... */
}
</script>

</style>
	/* ... */
</style>

<div class:text-red,font-bold,underline={isActive}>some content</div>
<button on:click={toggle}>click me</button>
```

That is, `class:text-red,font-bold,underline={isActive}` is just "syntactic sugar" for `class:text-red={isActive} class:font-bold={isActive} class:underline={isActive}`. The processor will simply replace the original class directive (where the class name is in fact a list of classes) with multiple class directives (one for each class in the list).

A Svelte processor is executed before the compilation, so all the expected features remain intact (namely, reactivity).

## Technical background

## Installing and adding to the project

## Drawbacks

This warning will be emitted: `Unused CSS selector ".class-a,class-b`.

TODO: how can this be turned off?
TODO: add a dummy class to the style block?

#Options

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