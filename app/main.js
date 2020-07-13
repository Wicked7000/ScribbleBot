const Discord = require('discord.js')
const MongoClient = require('mongodb').MongoClient
const client = new Discord.Client();

const connectionUrl = process.env.DB_URL
const databaseName = 'words'

const dbClient = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@scribblecluster.sqash.mongodb.net/${databaseName}?retryWrites=true&w=majority`);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
});

async function retrieveFromDatabase(collection_name, message){
    const dbConnection = await dbClient.connect();
    const wordsDatabase = dbConnection.db(databaseName)
    const allObjects = await wordsDatabase.collection(collection_name).find(true).toArray();
    const stringifiedObjects = allObjects.map(item => item.content).join(', ')
    message.reply(stringifiedObjects)
}

async function sendToDatabase(author, content, collection_name, message){
    const dbConnection = await dbClient.connect();
    const wordsDatabase = dbConnection.db(databaseName)
    const matchingDocument = await wordsDatabase.collection(collection_name).findOne({ content });
    if(!matchingDocument){
        wordsDatabase.collection(collection_name).insertOne({
            author,
            content,
        }, (error) => {
            if(error){
                message.reply('The message failed to add to the database please try again!')
            }else{
                message.reply('Message added!')
            }
        });
    }else{
        message.reply(`The entry '${content}' is already present!`)
    }    
}

client.on('message', async (message) => {
    if (!message.author.bot){
        if (message.content === 'help'){
            const helpEmbed = new Discord.MessageEmbed()
                .setTitle('Help')
                .setAuthor('Help - Commands', '', 'https://discord.js.org')
                .addFields(
                    { name: 'skribbl add [TEXT_HERE]', value: 'Adds to the database of skribbl words!' },
                    { name: 'skribbl retrieve', value: 'Returns back all words currently in the skribbl database!' },
                    { name: 'cah add [TEXT_HERE]', value: 'Adds to the database of cards against humanity words!' },
                    { name: 'cah retrieve', value: 'Returns back all words currently in the cards against humanity database!' }
                )
            message.reply(helpEmbed)
        }else if (message.content.match(/skribbl add.*/)){
            sendToDatabase(message.author, message.content.split('skribbl add ')[1], 'skribbl', message)
        }else if (message.content.match(/cah add.*/)){
            sendToDatabase(message.author, message.content.split('cah add ')[1], 'cah', message)
        }else if(message.content === 'skribbl retrieve'){
            retrieveFromDatabase('skribbl', message)
        }else if(message.content === 'cah retrieve'){
            retrieveFromDatabase('cah', message)
        }else{
            message.reply('That is not a valid command! see help')
        }
    }    
});


client.login(process.env.BOT_TOKEN)

