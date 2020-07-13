const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const client = new Discord.Client();

const connectionUrl = process.env.DB_URL
const databaseName = 'words'

const dbClient = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@scribblecluster.sqash.mongodb.net/${databaseName}?retryWrites=true&w=majority`);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
});

client.on('message', async (message) => {
    if (message.channel.type === 'dm' && !message.author.bot){
        message.reply('Attempting to add!')
        
        const dbConnection = dbClient.connect();
        const wordsDatabase = dbConnection.db(databaseName)
        wordsDatabase.collection('scribbleio').insertOne({
            author: message.author.tag,
            content: message.content
        }, (error) => {
            if(error){
                message.reply('The message failed to add to the database please try again!');
            }else{
                message.reply('Message added!')
            }
        });
    }
})


client.login(process.env.BOT_TOKEN)

