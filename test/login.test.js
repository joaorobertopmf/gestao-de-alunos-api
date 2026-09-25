import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { carregarDados } from './helpers/dados.js';

const cenarios = carregarDados('login.json');

describe('POST /api/auth/login', () => {
  cenarios.forEach(({ descricao, email, senha, statusEsperado, roleEsperada, erroEsperado }) => {
    it(`${descricao} deve retornar ${statusEsperado}`, async () => {
      const resposta = await request(app).post('/api/auth/login').send({ email, senha });

      expect(resposta.status).to.equal(statusEsperado);

      if (statusEsperado === 200) {
        expect(resposta.body.token).to.be.a('string');
        expect(resposta.body.usuario.email).to.equal(email);
        expect(resposta.body.usuario.role).to.equal(roleEsperada);
      } else {
        expect(resposta.body.error).to.equal(erroEsperado);
      }
    });
  });
});
