const { performTransaction, performSelect } = require ('./pgutils')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8000;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const productData = require('./rawData');
app.set('port', process.env.PORT || 5000);

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



app.get("/",(req,res)=>{
    console.log("hello world!");
    res.send("Hello world!");
});

app.post("/signup", async function(req, res,){
    const { body } = req;
    console.log(req.body)
    const { username, email, phonenumber, password } = body;
    const encpassword = await bcrypt.hash(password,8); //password encrypt
    const controller = new sigupservice();
    const result = await controller.getvalidatesign(email);

    if(result[0].status === 'Already exist'){
        res.send(result[0].status)
    }
    else{
        const result = await controller.signup(username, email, phonenumber, encpassword);
        res.send('Sucessfully Signed Up');
    }
});

app.post("/login", async function(req, res){
    const { body } = req;
    // console.log(body)
    const { email, password } = body;
    const controller = new loginservice();
    const result = await controller.login(email);
    if(result.length === 0){
            res.send('Invalid Email')
     }
        else{
            const validpassword = await bcrypt.compare(password,result[0].password);
            if(validpassword){
                    res.send('login sucessfully.')
            }
            else{
                res.send('Password does not Match')
            }   
   }
})

app.get('/products', async function(req,res){
    const productList = productData.slice().reverse().filter((v,i,a)=>a.findIndex(t=>(t.product_id === v.product_id))===i).reverse()
    const controller = new Productservice();
    const result = await controller.allProduct();
    const newProduct = result.length > 0 ? [...productList, ...result] : productList;
    res.json(newProduct);
})

app.post("/addproduct", async function(req, res,){
    const { body } = req;
    console.log(req.body)
    const { name, brand, product_id, colors } = body;//password encrypt
    const controller = new Productservice();
    const result = await controller.addProduct(name, brand, product_id, colors);
    console.log(result);
    res.send('Product Added successfully');
});

app.post("/product/update", async function(req, res,){
    const { body } = req;
    console.log(req.body)
    const { name, brand, product_id, colors, dimension, categories, price, weight } = body;
    const controller = new Productservice();
    const result = await controller.updateProduct(name, brand, product_id, colors, dimension, categories, price, weight);
    console.log(result);
    res.send('Product Added successfully');
});

app.post("/product/delete", async function(req, res,){
    const { body } = req;
    console.log(req.body)
    const { product_id } = body;
    const controller = new Productservice();
    const result = await controller.deleteProduct(product_id);
    console.log(result);
    res.send('Product Added successfully');
});

app.get(`/product/validate/product_id`, async function(req,res){
    console.log(req.params);
    const { product_id } = req.params;
    const controller = new Productservice();
    const result = await controller.getProductById(product_id);
    const newResult = result.length === 0 ? result[0]['status'] = 'Id does not exist' : result[0][`status`] = 'Exist';
    res.json(newResult);
})
class sigupservice {
    signup(username, email, phone, encpassword) {
        const stmt = 'select * from insertsign($<username>, $<email>, $<phone>, $<encpassword>)';
        const values = { username, email, phone, encpassword };
        const batch = [{ statement: stmt, values }];
        return performTransaction(batch);
    }
      getvalidatesign(email){
        const stmt = 'select * from  getvalidatesign($<email>)';
        const values = { email };
        // console.log(email);
        return performSelect(stmt, values);
      }
}

class loginservice{
    login(email){
        const stmt = 'select * from isvalidlogin($<email>)';
        const values = { email };
        // console.log(email);
        return performSelect(stmt, values);
      }
}

class Productservice{
    addProduct(name, brand, product_id, colors) {
        const stmt = 'select * from insertproduct($<name>, $<brand>, $<product_id>, $<colors>, $<effstatus>)';
        const values = { name, brand, product_id, colors, effstatus: 'A' };
        const batch = [{ statement: stmt, values }];
        return performTransaction(batch);
    }
    allProduct() {
        const stmt = 'select * from getAllProduct()';
        const values = {};
        return performSelect(stmt, values);
    }
    updateProduct(name, brand, product_id, colors, dimension, categories, price, weight) {
        const stmt = 'select * from updateproduct($<name>, $<brand>, $<product_id>, $<colors>, $<dimension>, $<categories>, $<price>, $<weight>)';
        const values = { name, brand, product_id, colors, dimension, categories, price, weight };
        const batch = [{ statement: stmt, values }];
        return performTransaction(batch);
    }
    deleteProduct(product_id) {
        const stmt = 'select * from deleteproduct($<product_id>)';
        const values = { product_id };
        const batch = [{ statement: stmt, values }];
        return performTransaction(batch);
    }
    getProductById(product_id){
        const stmt = 'select * from getproductbyid($<product_id>)';
        const values = { product_id };
        return performSelect(stmt, values);
    }
}

app.listen(PORT, function(){
  console.log('Server is running on Port: ',PORT);
});

