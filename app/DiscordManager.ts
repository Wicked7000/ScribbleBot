import Discord, { Message } from 'discord.js';
import DatabaseManager from './DatabaseHandler';
import { StateManager } from './state/StateManager';
import CommandHandler from './commands/CommandHandler';
import BehaviourHandler from './behaviour/BehaviourHandler';

export default class DiscordManager{
    private client: Discord.Client;
    private commandHandler: CommandHandler;
    private behaviourHandler: BehaviourHandler;
    private stateManager: StateManager;
    private databaseManager: DatabaseManager;

    constructor(){
        if(process.env.BOT_TOKEN){
            this.client = new Discord.Client();
            this.commandHandler = new CommandHandler();            
            this.behaviourHandler = new BehaviourHandler();
            this.databaseManager = new DatabaseManager('words');        
    
            this.onReady = this.onReady.bind(this);
            this.stateManager = new StateManager(this);

            this.client.on('ready', this.onReady);
            this.client.on('message', this.stateManager.handleMessage);
        } else {
            throw new Error('BOT_TOKEN was not provided!')
        }
    }

    private onReady(){
        if(this.client.user){
            console.log(`Logged in as ${this.client.user.tag}`);
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

    public getBehaviourHandler(){
        return this.behaviourHandler;
    }
}
