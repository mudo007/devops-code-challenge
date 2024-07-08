import express, { Request, Response } from 'express';

const app = express();
const port = process.env.NODE_PORT || 3000;

app.get('/', (req: Request, res: Response) => res.send('Hello World!'));

app.get('/health/check', (req: Request, res: Response) => res.send('OK'));

// Endpoint bobo para dar trigger no pipeline de CI/CD
app.get('/chuck-norris', (req: Request, res: Response) => res.send('Round House Kicks you on the face'));

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

export default app;
