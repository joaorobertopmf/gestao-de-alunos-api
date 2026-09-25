import request from 'supertest';
import { expect } from 'chai';
import app from '../../src/app.js';

async function login(email, senha) {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });

  expect(resposta.status, `falha ao logar com ${email}`).to.equal(200);
  return resposta.body;
}

export async function loginAdmin() {
  const { token } = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_SENHA);
  return token;
}

export async function loginAluno(email, senha) {
  const { token, usuario } = await login(email, senha);
  return { token, id: usuario.id };
}
