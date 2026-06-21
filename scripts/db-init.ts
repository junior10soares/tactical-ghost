import { initDb } from '../lib/db';

initDb()
  .then(() => {
    console.log('Banco de dados inicializado (tabelas plays e challenges).');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Falha ao inicializar o banco de dados:', error);
    process.exit(1);
  });
