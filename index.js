const { performTransaction, performSelect } = require ('./pgutils')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 5000;
const cors = require('cors');
const bcrypt = require('bcryptjs');

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


class sigupservice {
    signup(username, email, phone, encpassword) {
        const stmt = 'select * from insertsign($<username>, $<email>, $<phone>, $<encpassword>)';
        const values = { username, email, phone, encpassword };
        const batch = [{ statement: stmt, values: { username, email, phone, encpassword } }];
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



app.listen(PORT, function(){
  console.log('Server is running on Port: ',PORT);
});

