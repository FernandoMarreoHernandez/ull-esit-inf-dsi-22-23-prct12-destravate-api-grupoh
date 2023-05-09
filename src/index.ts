import { app } from './app.js';

const port = process.env.PORT;

// inicia el servidor y muestra el puerto por el que se está ejecutando
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});


