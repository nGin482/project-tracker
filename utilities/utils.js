const jwt = require("jsonwebtoken");

const createdDate = () => {
    const created = new Date();
    const createdDateString = created.toDateString();
    const createdTimeString = created.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});

    return `${createdDateString} ${createdTimeString}`
}

const checkToken = authHeader => {
    if (authHeader && authHeader.startsWith('Bearer')) {
        return authHeader.replace('Bearer ', '');
    }
    return null;
}

const isAuthorised = requestHeaders => {
    if (!requestHeaders.authorization) {
        return false;
    }
    const { authorization } = requestHeaders;
    const token = checkToken(authorization);
    if (!token) {
        return false;
    }
    let decodedToken = undefined;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
        return decodedToken;
    }
    catch(err) {
        return false;
    }
}

module.exports = {
    createdDate,
    checkToken,
    isAuthorised
}