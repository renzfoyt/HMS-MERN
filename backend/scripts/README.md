## Creating an admin account

From `backend/`, run:

    node scripts/createAdmin.js <username> <password>

- Username must be unique — the script exits if it already exists.
- Password must be at least 8 characters.
- Passwords are hashed with bcrypt before being stored; never enter
  a real password anywhere in this repo except when running this command.