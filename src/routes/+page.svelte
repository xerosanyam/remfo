<script>
	import Google from '$lib/components/Google.svelte';
	import { ROUTES } from '$lib/routes.util';
</script>

<h1>Remfo</h1>

<ol type="A">
	<li>
		<h2>New User</h2>
		<table>
			<tbody>
				<tr>
					<th>Summary:</th>
					<td>A tool that helps you memorise</td>
				</tr>
				<tr>
					<th>Action(s):</th>
					<td>
						<ol>
							<li>
								<a
									target="_blank"
									href="https://docs.google.com/presentation/d/15eZbXXVoR0B73-2Ct-eYs2ukjJsQoZFWxEh5WYqUGAc/edit?usp=sharing"
									>Why do you need Remfo? - Learn more thru Google Slides</a
								>
							</li>
							<li><a href={ROUTES.PRICING}>Pricing (Free & Membership Plan)</a></li>
							<li><Google text={'Sign Up'} /></li>
						</ol>
					</td>
				</tr>
			</tbody>
		</table>
		<hr />
	</li>
	<li>
		<h2>Old User</h2>
		<table>
			<tbody>
				<tr>
					<th>Action(s):</th>
					<td>
						<ol>
							<li><Google text={'Sign In'} /></li>
							<li>Recommend to a friend</li>
						</ol>
					</td>
				</tr>
			</tbody>
		</table>
		<hr />
	</li>
	<li>
		<h2>Developers</h2>
		<table>
			<tbody>
				<tr>
					<th>Action(s):</th>
					<td>
						<ol>
							<li>
								<a href="https://github.com/xerosanyam/remfo" target="_blank">View code on Github</a
								>
							</li>
							<li>
								<a href="https://github.com/xerosanyam/remfo/tree/main/essays" target="_blank"
									>All Essays</a
								>
								<ol>
									<li>
										<a href="https://github.com/xerosanyam/remfo/milestones" target="_blank"
											>Why this website is so ugly?- Milestones we are chasing</a
										>
									</li>
								</ol>
							</li>
							<li>
								<a href="https://github.com/xerosanyam/remfo" target="_blank"
									>Star this project on Github</a
								>
							</li>
						</ol>
					</td>
				</tr>
				<tr>
					<th>Last Updated:</th>
					<td>{new Date().toUTCString()}</td>
				</tr>
			</tbody>
		</table>
	</li>
</ol>
