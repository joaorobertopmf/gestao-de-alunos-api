import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin } from './helpers/login.js';
import { carregarDados } from './helpers/dados.js';

const cenarios = carregarDados('alunos.json');

describe('POST /api/admin/alunos', () => {
  let tokenAdmin;
  const alunosCriados = [];

  before(async () => {
    tokenAdmin = await loginAdmin();
  });

  after(async () => {
    for (const id of alunosCriados) {
      await request(app).delete(`/api/admin/alunos/${id}`).set('Authorization', `Bearer ${tokenAdmin}`);
    }
  });

  cenarios.forEach(({ descricao, dados, statusEsperado, erroEsperado }) => {
    it(`${descricao} deve retornar ${statusEsperado}`, async () => {
      const resposta = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(dados);

      expect(resposta.status).to.equal(statusEsperado);

      if (statusEsperado === 201) {
        alunosCriados.push(resposta.body.id);
        expect(resposta.body).to.include({
          nome: dados.nome,
          email: dados.email,
          matricula: dados.matricula,
          role: 'aluno',
        });
        expect(resposta.body).to.not.have.property('senha');
      } else {
        expect(resposta.body.error).to.equal(erroEsperado);
      }
    });
  });

  it('deve retornar 401 sem token de autenticação', async () => {
    const resposta = await request(app).post('/api/admin/alunos').send(cenarios[0].dados);

    expect(resposta.status).to.equal(401);
  });
});
