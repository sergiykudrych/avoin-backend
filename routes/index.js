const Router = require('express').Router;
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const fileMiddleware = require('../middlewares/file-middleeare');
const UserControllers = require('../controllers/user-controllers');
const ProductControllers = require('../controllers/product-controllers');
const CategoryControllers = require('../controllers/category-controllers');

router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 3, max: 32 }), UserControllers.registration);

router.post('/login', UserControllers.login);
router.post('/logout', UserControllers.logout);

router.get('/activate/:link', UserControllers.activate);

router.get('/refresh', UserControllers.refresh);

router.get('/users', authMiddleware, UserControllers.getUsers);
router.post('/update-user-info', UserControllers.updateUserInfo);
router.post('/update-user-role/:id', authMiddleware, UserControllers.updateUserRole);

router.get('/products-search/:name', ProductControllers.getProductsSearch);
router.get('/products/:category', ProductControllers.getProducts);
router.get('/product/:slug', ProductControllers.getProduct);
router.post('/update-product', authMiddleware, ProductControllers.updateProduct);
router.post('/create-product', authMiddleware, ProductControllers.createProduct);
router.delete('/delete-product/:id', authMiddleware, ProductControllers.removeProduct);

router.get('/category', CategoryControllers.getAllCategorys);
router.post('/create-category', authMiddleware, CategoryControllers.createCategory);
router.delete('/remove-category/:title', authMiddleware, CategoryControllers.removeCategory);

router.post('/upload', fileMiddleware.array('images', 5), async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      res.json(req.files); // Відправити інформацію про файли назад
    } else {
      res.status(400).send('No files uploaded.');
    }
  } catch (error) {
    next(error); // Передати помилку до обробника помилок
  }
});

module.exports = router;
