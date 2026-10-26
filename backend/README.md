# Backend configuration

The backend requires a private `JWT_SECRET_KEY` to sign and verify access
tokens. Provide it through the process environment or a local `backend/.env`
file. The `.env` file is ignored by Git.

Generate a key with at least 32 characters, for example:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Set `JWT_SECRET_KEY` to the generated value before starting the backend. The
application fails during startup if the key is missing or shorter than 32
characters. Never commit the generated key or reuse it across environments.

The ML model is a local artifact and is not committed. Obtain it only from a
trusted artifact source; loading untrusted pickle/joblib files can execute
arbitrary code.
