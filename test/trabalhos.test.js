import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin, loginAluno } from './helpers/login.js';
import { carregarDados } from './helpers/dados.js';

const { aluno, disciplinaMatriculada, entregas } = carregarDados('trabalhos.json');

describe('POST /api/alunos/:alunoId/trabalhos', () => {
  let tokenAdmin;
  let tokenAluno;
  let alunoId;
  const trabalhosCriados = [];

  before(async () => {
    tokenAdmin = await loginAdmin();

    const cadastro = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(aluno);
    expect(cadastro.status).to.equal(201);

    const matricula = await request(app)
      .post(`/api/admin/disciplinas/${disciplinaMatriculada}/matriculas`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ alunoId: cadastro.body.id });
    expect(matricula.status).to.equal(201);

    ({ token: tokenAluno, id: alunoId } = await loginAluno(aluno.email, aluno.senha));
  });

  after(async () => {
    for (const id of trabalhosCriados) {
      await request(app).delete(`/api/admin/trabalhos/${id}`).set('Authorization', `Bearer ${tokenAdmin}`);
    }
    await request(app).delete(`/api/admin/alunos/${alunoId}`).set('Authorization', `Bearer ${tokenAdmin}`);
  });

  entregas.forEach(({ descricao, alunoId: outroAlunoId, dados, statusEsperado, erroEsperado }) => {
    it(`${descricao} deve retornar ${statusEsperado}`, async () => {
      const resposta = await request(app)
        .post(`/api/alunos/${outroAlunoId ?? alunoId}/trabalhos`)
        .set('Authorization', `Bearer ${tokenAluno}`)
        .send(dados);

      expect(resposta.status).to.equal(statusEsperado);

      if (statusEsperado === 201) {
        trabalhosCriados.push(resposta.body.id);
        expect(resposta.body).to.include({
          alunoId,
          disciplinaId: dados.disciplinaId,
          titulo: dados.titulo,
          descricao: dados.descricao ?? null,
          status: 'entregue',
        });
        expect(resposta.body.dataEntrega).to.be.a('string');
      } else {
        expect(resposta.body.error).to.equal(erroEsperado);
      }
    });
  });

  it('trabalhos entregues devem aparecer na listagem do aluno', async () => {
    const resposta = await request(app)
      .get(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${tokenAluno}`);

    expect(resposta.status).to.equal(200);
    expect(resposta.body.map((t) => t.id)).to.have.members(trabalhosCriados);
  });
});
