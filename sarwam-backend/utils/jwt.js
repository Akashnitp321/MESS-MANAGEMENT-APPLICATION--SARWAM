import pkg from 'jsonwebtoken';
const { sign, verify, decode, JsonWebTokenError, TokenExpiredError } = pkg;
export { sign, verify, decode, JsonWebTokenError, TokenExpiredError };
export default pkg;
