const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    const token = req.headers.authorization;
    const confirmed = jwt.verify(token, 'mohammadFarghalyAliSaadawy');
        if(confirmed) {
            next();
        } else {
            res.json({message: 'Not autherized'});
        }
}
