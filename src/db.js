const mongoose = require('mongoose');

module.exports = {
    connect: DB_HOST => {
        // Просто подключаемся к базе данных
        mongoose.connect('mongodb://localhost:27017/notedly', { 
            bufferCommands: false, // Отключаем буферизацию команд
        });

        mongoose.connection.on(
            'error', error => {
                console.error('Error in DB connection:', error);
            }
        );

        mongoose.connection.on(
            'connected', () => {
                console.log('MongoDB connected!');
            }
        );
    },
    close: () => {
        mongoose.connection.close();
    }
};