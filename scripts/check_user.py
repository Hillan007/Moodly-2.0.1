import sqlite3
import json
import sys

def main():
    db='moodly.db'
    try:
        conn=sqlite3.connect(db)
        cur=conn.cursor()
        cur.execute('SELECT id, username, email, created_at FROM users WHERE email=?', ('testuser123@example.com',))
        rows=cur.fetchall()
        print(json.dumps(rows))
        conn.close()
    except Exception as e:
        print('ERROR:'+str(e))
        sys.exit(1)

if __name__ == '__main__':
    main()
