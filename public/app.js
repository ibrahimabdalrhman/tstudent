const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const Product = require("./models/mysql/productModel");
const User = require("./models/mysql/userModel");
const Cart = require("./models/mysql/cartModel");
const CartItem = require("./models/mysql/cartItemModel");
const Order = require("./models/mysql/orderModel");
const OrderItem = require("./models/mysql/orderItemModel");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routing
const productsRouter = require("./routes/productsRouter");
const usersRouter = require("./routes/usersRouter");
const { fail } = require("assert");

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      console.log("user============>", user);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/api/v1/products", productsRouter);
// app.use('/api/v1/users', usersRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    Message: "can't find this page :( ",
  });
});

Product.belongsTo(User, { constraints: true, oneDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through : OrderItem})

const sequelize = require("./utils/mysqlDatabase");
// 

// sequelize.sync({ force: true })
sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "ibrahim", email: "test@test.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log('user:::::', user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000, () => {
      console.log("server running...");
    });
  })
  .catch((err) => {
    console.log("err : ", err);
  });
