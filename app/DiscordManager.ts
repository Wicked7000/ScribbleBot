import Discord, { Message } from 'discord.js';
import DatabaseManager from './DatabaseHandler';
import { StateManager } from './state/StateManager';
import CommandHandler from './commands/CommandHandler';

export default class DiscordManager{
    private client: Discord.Client;
    private commandHandler: CommandHandler;
    private stateManager: StateManager;
    private databaseManager: DatabaseManager;

    constructor(){
        if(process.env.BOT_TOKEN){
            this.client = new Discord.Client();
            this.commandHandler = new CommandHandler();            
            this.databaseManager = new DatabaseManager('words');        
    
            this.onReady = this.onReady.bind(this);
            this.handleMessage = this.handleMessage.bind(this);
            this.stateManager = new StateManager(this);

            this.client.on('ready', this.onReady);
            this.client.on('message', this.handleMessage);
        } else {
            throw new Error('BOT_TOKEN was not provided!')
        }
    }

    private onReady(){
        if(this.client.user){
            console.log(`Logged in as ${this.client.user.tag}`);
        }       
    }

    private handleMessage(message: Message){
        if(!message.author.bot && message.channel.type === 'dm'){
            this.stateManager.handleMessage(message);
        }
    }

    public login(){
        this.client.login(process.env.BOT_TOKEN);
    }

    public getClient(){
        return this.client;
    }

    public getStateManager(){
        return this.stateManager;
    }

    public getDatabaseManager(){
        return this.databaseManager;
    }

    public getCommandHandler(){
        return this.commandHandler;
    }
}
