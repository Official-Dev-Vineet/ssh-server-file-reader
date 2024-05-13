const { Client } = require('ssh2');
const { config } = require('dotenv')


const conn = new Client();
config();
conn.on('ready', () => {
  console.log('Client :: ready');

  // Execute a command after the connection is ready
  conn.exec('uptime', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      stream.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });

  // Request SFTP after the connection is ready
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.readdir('/root', (err, files) => {
      if (err) throw err;
      // download files from remote server
      console.log(files);
      files.forEach(file => {
        // sftp.fastGet('/root/' + file, 'download/' + file);
        console.log(file);
      })
      conn.end(); // End the connection after handling files
    });
  });

}).on('error', (err) => {
  console.log('Client :: error :: ' + err);
}).connect({
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT,
  username: process.env.SSH_USERNAME,
  password: process.env.SSH_PASSWORD  // Ensure you provide a password if required
});

