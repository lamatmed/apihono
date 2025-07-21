CREATE TABLE users (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  nom text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  created_at integer
); 