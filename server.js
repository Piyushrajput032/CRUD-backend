const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer=require("multer");
const AWS=require("aws-sdk");
fileUpload=require('express-fileupload')
const path=require('path');
const Connection = require("mysql2/typings/mysql/lib/Connection");




AWS.config.update({
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    region: 'YOUR_AWS_REGION'
});
const s3=new AWS.S3();

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"public/images");
    },
    filename:function(req,file,cb){
        const ext=file.mimetype.split("/")[1];
        cb(null,`uploads/${file.originalname}-${Date.now()}.${ext}`)
    }
});

const upload =multer({storage:storage});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "registration_db",
});

app.post("/register",upload.single("profile_picture"), (req, res) => {
  const data = req.body;
  const file=req.file;
  db.query(
    "INSERT INTO users(first_name,last_name,mobile_number,password,profile_picture,created_date,created_by,updated_date,updated_by)VALUES(?,?,?,?,?,?,?,?,?)",
    [
      data.first_name,
      data.last_name,
      data.mobile_number,
      data.password,
      data.profile_picture,
      data.created_date,
      data.created_by,
      data.updated_date,
      data.updated_by,
    ],
    (err, result, fields) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      } else {
        res.sendStatus(200);
      }
    }
  );
});

app.post("/api/image",upload.single('image'),(req,res,err)=>{
    if(!req.file.originalname.match(/\.(jpg|JPG|jepg|JPEG|png|PNG|gif|GIF)$/)){
        res.send({msg:'Only image file are allowed'})
    }else{
        const image=req.file.filename;
        const id=1;
        const sqlInsert="UPDATE images SET `image` =? WHERE id=?;"

        connection.query(sqlInsert,[image,id],(err,result)=>{
            if(err){
                console.log(err)
                res.send({
                    msg:err
                })
            }
            if(result){
                res.send({
                    data:result,
                    msg:"Your iamge has been updated"
                })
            }
        })
    }
})
app.use('/',express.static(path.join(__dirname,'/')));

app.post("/login", (req, res) => {
  const password = req.body.password;
  const first_name = req.body.first_name;
  db.query(
    "SELECT * FROM users WHERE first_name = ? and password = ?",
    [first_name, password],
    (err, result) => {
      if (err) {
        req.setEncoding({ err: err });
      } else {
        if (result.length > 0) {
            const user=result[0];
            // const url=s3.getSignedUrl("getObject",{
            // Bucket: "image-saver",
            // Key: "public/images/" + user.profile_picture,
            // Expires: 60 * 60 * 24,
            // })
          res.send({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            mobile_number: user.mobile_number
            // profile_picture_url: url,
          });
        //   s3.upload(params, (err, data) => {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         console.log(`File uploaded successfully. File URL: ${data.Location}`);
        //     }
        // });
        } else {
          res.send({ message: "WRONG UserName OR Password" });
        }
      }
    }
  );
});
app.get("/api/image",(req,res)=>{
    const id=1;
    const sqlInsert="SELECT * FROM images WHERE id=?;";

    connection.query(sqlInsert,[id],(err,result)=>{
        if(err){
            console.log(err)
            res.send({
                msg:err
            })
        }
        if(result){
            res.send({ image:result[0].image})
           
        }
    })
})

app.get("/", (req, res) => {
  return res.json("From backend side");
});

app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    }
    return res.json(data);
  });
});

app.listen(8081, () => {
  console.log("listening");
});
