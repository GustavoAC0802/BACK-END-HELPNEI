import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { runSeeders } from './seed/seederAll';
import { resetDatabase } from './config/resetDatabase';
import routes from './routes';

interface CustomError extends Error {
  status?: number;
}

const app = express();
const port = 3000;

app.use(express.json());

const start = async () => {
  try {
    await resetDatabase(); // 🔥 Dropa e recria o banco
    await AppDataSource.initialize(); // Conecta ao banco
    console.log('✅ Conexão com o banco de dados estabelecida.');

    await runSeeders(); // Executa os seeders
    console.log('✅ Seeders executados com sucesso.');

    // Rotas
    app.get('/', (_req: Request, res: Response) => {
      res.send('Aqui será a página do projeto');
    });

    app.use('/api', routes); // Endpoint da API REST

    // Middleware para rota não encontrada (404) - **após** as rotas
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({ error: 'Rota não encontrada' });
    });

    // Middleware global de tratamento de erros (500) - **após** o 404
    app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
      const statusCode = err.status || 500;
      const message = err.message || 'Erro interno do servidor';
      console.error('Erro:', err.stack);
      res.status(statusCode).json({ error: true, message });
    });

    // Inicia o servidor após tudo estar pronto
    app.listen(port, () => {
      console.log(`🚀 Projeto rodando em: http://localhost:${port}`);
    });

  } catch (err) {
    console.error('❌ Erro ao iniciar a aplicação:', err);
  }
};

start();
