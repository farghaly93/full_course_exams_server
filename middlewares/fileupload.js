const multer = require('multer');

const mimeTypes = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'video/mp4': 'mp4'
  };
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if(typeof file === 'string') return;
      let err = new Error('Not right file type');
      const isValid = mimeTypes[file.mimetype];
      console.log('here kkkkk', file.mimetype, isValid)
      if(isValid) {
        err = null;
      }
      cb(err, 'images');
    },
    filename: (req, file, cb) => {
      const name = file.originalname.toLowerCase().split(' ').join('-');
      const ext = mimeTypes[file.mimetype];
      cb(null, name + '-' + Date.now() + '.' + ext);
    },
    //bucket: 'eyesshop-bucket',
     // region: 'us-east-2',
      //aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
      //aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  module.exports =  multer({storage: storage}).fields([{name: 'video', maxCount: 1}, {name: 'image', maxCount: 1}]) //fields([{
     // name: 'image', maxCount: 1
    //}]);
  
