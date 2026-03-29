import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`Atlas server on http://localhost:${port}`));
