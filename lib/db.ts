import mysql, { Connection } from 'mysql2/promise';

let connection: Connection | null = null;

export const dbConnection = async (): Promise<Connection> => {
  if (connection) {
    return connection;
  }

  try {
    console.log('Connecting to the database...',"host",process.env.MYSQL_HOST,"MYSQL_USER", process.env.MYSQL_USER,"MYSQL_PASSWORD", process.env.MYSQL_PASSWORD,"MYSQL_DATABASE" ,process.env.MYSQL_DATABASE);
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,     
      user: process.env.MYSQL_USER,       
      password: process.env.MYSQL_PASSWORD, 
      database: process.env.MYSQL_DATABASE, 
    });

    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Could not connect to the database');
  }
};
