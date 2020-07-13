const Discord = require('discord.js');
const { del } = require('request');
const MongoClient = require('mongodb').MongoClient
const client = new Discord.Client();

const connectionUrl = process.env.DB_URL
const databaseName = 'words'

const dbClient = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@scribblecluster.sqash.mongodb.net/${databaseName}?retryWrites=true&w=majority`);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`)
});

collections = ['cah', 'skribbl']

const fields = []
collections.forEach((collection) => {
    fields.push({ name: `${collection} add [TEXT_HERE]`, value: `Adds option to the ${collection} collection.`})
    fields.push({ name: `${collection} retrieve`, value: `Retrives all options in the ${collection} collection.`})
    fields.push({ name: `${collection} purge`, value: `Remove all options in the ${collection} collection.`})
})

function isHigherAccessLevel(message){
    return message.author.tag === 'Wicked#3867' || message.author.tag === 'darko#0515';
}

async function purge(collection_name, message){
    if(isHigherAccessLevel(message)){
        const dbConnection = await dbClient.connect();
        const wordsDatabase = dbConnection.db(databaseName)
        const deleted = (await wordsDatabase.collection(collection_name).deleteMany({})).result
        if(deleted.ok){
            message.reply(`All items have been purged from the collection! ${deleted.n}`)
        } else {
            message.reply('Error purging from collection!')
        }        
    }else{
        message.reply('Permission not allowed, only Wicked or Darko can see collections.')
    }
}

async function retrieveFromDatabase(collection_name, message){
    if(isHigherAccessLevel(message)){
        const dbConnection = await dbClient.connect();
        const wordsDatabase = dbConnection.db(databaseName)
        const allObjects = await wordsDatabase.collection(collection_name).find(true).toArray();
        if(allObjects.length !== 0){
            const stringifiedObjects = allObjects.map(item => item.content).join(', ')
            message.reply(stringifiedObjects)
        } else {
            message.reply('No items are present within this collection!')
        }        
    }else{
        message.reply('Permission not allowed, only Wicked or Darko can see collections.')
    }
}

async function sendToDatabase(author, content, collection_name, message){
    const dbConnection = await dbClient.connect();
    const wordsDatabase = dbConnection.db(databaseName)
    const matchingDocument = await wordsDatabase.collection(collection_name).findOne({ content });
    if(!matchingDocument){
        wordsDatabase.collection(collection_name).insertOne({
            author: author.tag,
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
        const msg_collection_name = message.content.split(" ")[0];
        if (message.content === 'help'){
            const helpEmbed = new Discord.MessageEmbed()
                .setTitle('Help')
                .setAuthor('Help - Commands', '', 'https://discord.js.org')
                .addFields(fields)
            message.reply(helpEmbed)
        }else if (collections.includes(msg_collection_name)){
            const command = message.content.split(" ")[1]
            if(command === 'add'){
                const msg_content_option = message.content.split(" ")[2];
                sendToDatabase(message.author, msg_content_option, msg_collection_name, message)
            }else if(command === 'retrieve'){
                retrieveFromDatabase(msg_collection_name, message);
            }else if(command === 'purge'){
                purge(msg_collection_name, message);
            }
        }else{
            message.reply('That is not a valid command! see help')
        }
    }    
});


client.login(process.env.BOT_TOKEN)

