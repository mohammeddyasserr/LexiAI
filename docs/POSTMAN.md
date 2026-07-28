Postman Collection: Contract Analysis

Files added:
- postman_contract_analysis_collection.json
- postman_contract_analysis_env.json

How to use

1. Import `postman_contract_analysis_collection.json` into Postman.
2. Import `postman_contract_analysis_env.json` as an environment and select it.
3. Open the request "Analyze two contracts (multipart)", set the two file fields (`contract_a`, `contract_b`) to `File` and choose your PDFs, then send.

Run headless with Newman (optional)

Install newman (requires Node.js):

```bash
npm install -g newman
```

Run the collection against your local server:

```bash
newman run docs/postman_contract_analysis_collection.json -e docs/postman_contract_analysis_env.json --reporters cli,json --reporter-json-export docs/postman_result.json
```

This will save a JSON report to `docs/postman_result.json`.
