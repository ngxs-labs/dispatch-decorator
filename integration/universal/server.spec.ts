import * as http from 'http';

function request(url: string) {
  return new Promise<string>((resolve) => {
    http.get(url, (response) => {
      let body = '';

      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => resolve(body));
    });
  });
}

afterAll((done: jest.DoneCallback) => {
  request('http://localhost:4200/stop').then(done);
});

describe('Dispatch decorator server-side rendering', () => {
  it('should render counter state', async () => {
    const body = await request('http://localhost:4200');

    const paragraphIndex = body.indexOf('Server-side rendered state using @Dispatch decorator is:');
    expect(paragraphIndex).toBeGreaterThan(-1);

    const counterJsonIndex = body.indexOf('"counter": 1');
    expect(counterJsonIndex).toBeGreaterThan(-1);
  });
});
