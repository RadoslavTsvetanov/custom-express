import  express  from 'express';
const app = express();
const router = express.Router();

router.get('/use', (req, res) => { 
    res.status(200).json({});
})

app.use(router)

app.listen(3001)