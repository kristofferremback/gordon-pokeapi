require("ts-node/register")

import dotenv from "dotenv"

export default async function setup() {
  dotenv.config({ path: "env-test" })
}
