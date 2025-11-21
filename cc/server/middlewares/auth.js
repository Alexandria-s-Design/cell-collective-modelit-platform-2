import Response from "../response";

const AuthRequired = (req, res, next) => {
    const response = new Response();
    if ( req.user ) {
        next();
    } else {
        response.setError(Response.Error.UNAUTHORIZED, "Sign In required.");
        res.status(response.code)
           .json(response.json);
    }
};

export { AuthRequired };