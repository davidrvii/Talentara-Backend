const bcrypt = require("bcryptjs")

function hashedPassword(plainPassword){
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(plainPassword,salt)
}

function comparedPassword (plainPassword,hashedPassword){
    return bcrypt.compareSync(plainPassword,hashedPassword)
}


module.exports={
    hashedPassword,
    comparedPassword
}