import { http, HttpResponse } from 'msw'

export const handlers = [
	http.post('/review', () => {
		return HttpResponse.json({ success: true });
	}),
	http.post('/delete', () => {
		return HttpResponse.json({ success: true });
	})
]