import { Message, Snowflake, Client } from "discord.js";
import { PURGE_REQUEST_ACCEPTED, PURGE_REQUEST_CANCELLED, PURGE_REQUEST_RECIEVED } from "../commands/purge";
import Command, { HandlerType } from "../commands/Command";
import StateObject from "./StateObject";
import DiscordManager from "../DiscordManager";

export const NO_CONVERSATION = "NO_CONVERSATION";
export const START_OF_CONVERSATION = "START_OF_CONVERSATION";
export const STATELESS_COMMAND = "STATELESS_COMMAND";
export const END_OF_CONVERSATION = "END_OF_CONVERSATION";

export type PossibleStates = typeof NO_CONVERSATION |
                      typeof START_OF_CONVERSATION | 
                      typeof STATELESS_COMMAND | 
                      typeof END_OF_CONVERSATION |
                      typeof PURGE_REQUEST_ACCEPTED |
                      typeof PURGE_REQUEST_CANCELLED |
                      typeof PURGE_REQUEST_RECIEVED;

const DEFAULT_MESSAGE_EXPIRY_TIME_IN_SECONDS = 10000;

export class StateManager{
    private readonly discordManager: DiscordManager;
    private conversationStates: Map<Snowflake, StateObject>;


    constructor(discordManager: DiscordManager){
        this.conversationStates = new Map();
        this.discordManager = discordManager;
    }

    private purgeConversation(userid: Snowflake){
        const toDelete = this.conversationStates.get(userid);
        if(this.conversationStates.delete(userid) && toDelete){
            toDelete.sendMessageToUser(`You took too long to reply, please try the operation again!`);
        }
    }

    public handleMessage(message: Message){
        if(this.conversationStates.has(message.author.id)){            
            this.continueConversation(message);
        }else{
            const matchedCommand = this.discordManager.getCommandHandler().matchCommand(message);
            if(matchedCommand && !this.conversationStates.has(message.author.id)){            
                this.newConversation(message, matchedCommand);
            } else { 
                message.reply('That is not a valid command! Please see help for more info')
            }      
        }        
    }

    public newConversation(message: Message, command: Command){
        const handlerFunction = command.getHandler();
        console.log(`Started conversation with user - ${message.author.tag}`);
        const newStateObject = new StateObject(message.author, START_OF_CONVERSATION);
        this.conversationStates.set(message.author.id, newStateObject);        
        handlerFunction(this.discordManager, message, newStateObject);
    }

    public continueConversation(message: Message){
        const stateObject = this.conversationStates.get(message.author.id);
        const nextHandler = stateObject?.getNextHandler();
        if(stateObject && nextHandler){
            nextHandler(this.discordManager, message, stateObject);
        }
    }

    public updateState(state: PossibleStates, message: Message, nextStateHandler?: HandlerType){
        console.log(`Conversation state updated: [USER: ${message.author.tag}, STATE: ${state}]`);
        let timeoutId: NodeJS.Timeout | undefined;
        if(nextStateHandler && state !== END_OF_CONVERSATION){
            timeoutId = setTimeout(() => this.purgeConversation(message.author.id), DEFAULT_MESSAGE_EXPIRY_TIME_IN_SECONDS);
        }
        
        if (state === END_OF_CONVERSATION) {
            this.conversationStates.delete(message.author.id);
        } else {
            const currentStateObject = this.conversationStates.get(message.author.id);
            const newStateObject = new StateObject(message.author, state, timeoutId, nextStateHandler);
            if(currentStateObject){
                newStateObject.updateState(currentStateObject.getState());
            }
            this.conversationStates.set(message.author.id, newStateObject);
        }
    }

    public getState(message: Message): StateObject | typeof NO_CONVERSATION{
        const result = this.conversationStates.get(message.author.id);
        if(result){
            return result;
        }
        return NO_CONVERSATION;
    }
}