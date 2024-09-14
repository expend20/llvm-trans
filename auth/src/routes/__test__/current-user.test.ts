import request from 'supertest';
import { app } from '../../app';

const emailValid = 'test@test.com';

it('responds with details about the current user', async () => {
  const cookie = await global.signin();
  const responseCurrentUser = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(responseCurrentUser.body.currentUser.email).toEqual(emailValid);
});

it('responds with null if not authenticated', async () => {
  const responseCurrentUser = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  expect(responseCurrentUser.body.currentUser).toEqual(null);
});

