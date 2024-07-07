import express, { Request, Response } from 'express';

const app = express();
const port = process.env.NODE_PORT || 3000;

app.get('/', (req: Request, res: Response) => res.send('Hello World!'));

app.get('/health/check', (req: Request, res: Response) => res.send('OK'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
