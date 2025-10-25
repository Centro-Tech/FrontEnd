// Load .env (default .env). If you prefer .env.dev use your own workflow.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const PORTA_APP = process.env.APP_PORT || 8080;
const HOST_APP = process.env.APP_HOST || '0.0.0.0';

const app = express();

// helper to require routers safely (so server still starts while files are being cleaned)
function tryRequire(relPath) {
	try {
		return require(relPath);
	} catch (err) {
		console.warn(`Aviso: não foi possível carregar ${relPath}: ${err.message}`);
		return null;
	}
}

const indexRouter = tryRequire('./src/routes/index');
const aquariosRouter = tryRequire('./src/routes/aquarios');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// serve frontend production build from src-dash/public when present
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

if (indexRouter) app.use('/', indexRouter);
if (aquariosRouter) app.use('/aquarios', aquariosRouter);

app.listen(PORTA_APP, HOST_APP, function () {
	console.log(`Servidor rodando em http://${HOST_APP}:${PORTA_APP}`);
});
