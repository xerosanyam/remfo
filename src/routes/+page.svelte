<script>
	import Google from '$lib/components/Google.svelte';
</script>

<h1>Remfo</h1>

<h2>New User</h2>
<table>
	<tbody>
		<tr>
			<th>Summary:</th>
			<td>A tool that helps you memorise</td>
		</tr>
		<tr>
			<th>Detail:</th>
			<td
				><a
					target="_blank"
					href="https://docs.google.com/presentation/d/15eZbXXVoR0B73-2Ct-eYs2ukjJsQoZFWxEh5WYqUGAc/edit?usp=sharing"
					>Understand the idea on Google Slides</a
				></td
			>
		</tr>
		<tr>
			<th>Action(s):</th>
			<td>
				<ol>
					<li><Google text={'Sign Up'} /></li>
				</ol>
			</td>
		</tr>
	</tbody>
</table>
<hr />
<h2>Old User</h2>
<table>
	<tbody>
		<tr>
			<th>Action(s):</th>
			<td>
				<ol>
					<li><Google text={'Sign In'} /></li>
				</ol>
			</td>
		</tr>
	</tbody>
</table>
<hr />

<h2>Other Info</h2>
<table>
	<tbody>
		<tr>
			<th>Code Link:</th>
			<td><a href="https://github.com/xerosanyam/remfo" target="_blank">See code on Github</a></td>
		</tr>
		<tr>
			<th>Last Updated:</th>
			<td>{new Date().toUTCString()}</td>
		</tr>
	</tbody>
</table>
