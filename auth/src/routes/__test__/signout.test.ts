import request from 'supertest';
import { app } from '../../app';

const emailValid = 'test@test.com';

it('expectes that the cookie is cleared', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: emailValid,
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
  expect(response.get('Set-Cookie')?.[0].includes('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly')).toBe(true);
});
