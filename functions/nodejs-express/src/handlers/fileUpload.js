const fetch = require("node-fetch")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const handler = async (req, res, next) => {
  const { name, type, base64str } = req.body.input;
  let fileBuffer = Buffer.from(base64str, 'base64');
  try {
    fs.writeFileSync("public/files/" + name, fileBuffer, 'base64');
    // insert into db
    const HASURA_MUTATION = `
      mutation ($file_path: String!) {
      	insert_files_one(object: {
      		file_path: $file_path
      	}) {
      		id
      	}
      }
    `;
    const variables = { file_path: "/files/" + name };

    // execute the parent mutation in Hasura
    const fetchResponse = await fetch(
        "http://172.17.0.1:8080/v1/graphql",
        {
          method: 'POST',
          body: JSON.stringify({
            query: HASURA_MUTATION,
            variables
          })
        }
    );
    console.log("debug 1")
    const { data, errors } = await fetchResponse.json();
    console.log(data);

    // if Hasura operation errors, then throw error
    if (errors) {
      return res.status(400).json({
        message: errors.message
      })
    }

    // success
    return res.json({ file_path: "/files/" + name });
  } catch (e) {
    next(e);
  }
}

module.exports = handler;