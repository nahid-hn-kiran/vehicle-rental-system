import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

const config = {
  conection_str: process.env.CONECTION_STR,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
};

export default config;
