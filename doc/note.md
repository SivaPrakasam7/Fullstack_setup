# Notes

- AI not generating code like existing codebase. Its not accepting full codebase at API request
- May be need to upgrade plan or need to train model with codebase

curl https://api.openai.com/v1/chat/completions \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer OPENAI_API_KEY" \
 -d '{
"model": "gpt-4o-mini",
"store": true,
"messages": [
{"role": "user", "content": "write a haiku about ai"}
]
}'
