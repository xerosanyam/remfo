import { http, HttpResponse } from 'msw';

// SvelteKit form actions post to `?/review` and `?/delete`, so they all land on pathname
// `/` with only the search string telling them apart. MSW matches on origin + pathname and
// ignores the query, so a handler per action name (`/review`, `/delete`) matches nothing at
// all -- which is how these requests used to escape to the real network.
//
// `use:enhance` reads the reply with `deserialize(await response.text())`, a bare
// JSON.parse, so the body has to be a serialized ActionResult rather than arbitrary JSON.
export const handlers = [
	http.post('/', () => HttpResponse.text(JSON.stringify({ type: 'success', status: 200 })))
];
