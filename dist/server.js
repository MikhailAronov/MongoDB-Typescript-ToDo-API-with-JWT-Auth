const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./../doc/swagger.json');
const app = new express();
app.use(cors());
app.options('*', cors());
app.use(require('./managers/Auth').tokenValidation);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/', require('./routes/ToDoRoutes').router);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server started on port : ", PORT);
});
//# sourceMappingURL=server.js.map