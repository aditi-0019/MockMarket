import sqlite3

DB_PATH = "mockmarket.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Add authentication fields if they don't already exist
try:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN name TEXT DEFAULT 'User'"
    )
except sqlite3.OperationalError:
    pass

try:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN email TEXT DEFAULT 'user@mockmarket.com'"
    )
except sqlite3.OperationalError:
    pass

try:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''"
    )
except sqlite3.OperationalError:
    pass

conn.commit()

print("Authentication fields added successfully.")

cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()

print("\nUsers table columns:")
for column in columns:
    print(column[1])

conn.close()