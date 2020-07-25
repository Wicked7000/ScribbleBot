import Command, {HandlerType, MatcherFunction} from './Command';
import DiscordManager from '../DiscordManager';
import { Message } from 'discord.js';
import { STATELESS_COMMAND, END_OF_CONVERSATION } from '../state/StateManager';
import StateObject from '../state/StateObject';

export const PURGE_REQUEST_RECIEVED = "PURGE_REQUEST_RECIEVED";
export const PURGE_REQUEST_CANCELLED = "PURGE_REQUEST_CANCELLED";
export const PURGE_REQUEST_ACCEPTED = "PURGE_REQUEST_CANCELLED";

type PurgeState = {
    collection?: string;
}

const purgeHandlerConfirmation: HandlerType = async (manager: DiscordManager, message: Message, stateObject: StateObject) => {
    const stateManager = manager.getStateManager();
    const trimmedContent = message.content.trim().toLowerCase();
    const purgeState = stateObject.getState() as PurgeState;

    if (trimmedContent === 'y') {
        const databaseManager = manager.getDatabaseManager();
        stateManager.updateState(PURGE_REQUEST_ACCEPTED, message);
        if (purgeState.collection) {
            const didPurge = await databaseManager.purge(purgeState.collection);
            if(didPurge){
                message.reply(`Successfully purged collection \`${purgeState.collection}\``)
            }else{
                message.reply(`Failed to purge collection \`${purgeState.collection}, try again later!\``)
            }
        } else {
            message.reply(`An internal error occured while executing the command, try again later!`);
        }        
    } else if (trimmedContent === 'n') {
        stateManager.updateState(PURGE_REQUEST_CANCELLED, message);
        message.reply(`Purge cancelled for collection \`${purgeState.collection}\`!`);
    } else {
        stateManager.updateState(PURGE_REQUEST_CANCELLED, message);
        message.reply(`Purge cancelled, please specify \`y\` or \`n\` you entered an invalid option!`);
    }
    stateManager.updateState(END_OF_CONVERSATION, message);
}

const purgeHandlerStart: HandlerType = async (manager: DiscordManager, message: Message, stateObject: StateObject) => {
    const stateManager = manager.getStateManager();

    const matchResult = /purge (\w+)/.exec(message.content);
    if(matchResult && matchResult.length == 2){
        const collection = matchResult[1];
        stateObject.updateState({
            collection,
        });
        message.reply(`Request received to purge collection \`${collection}\``)
        stateManager.updateState(PURGE_REQUEST_RECIEVED, message, purgeHandlerConfirmation);
        message.reply(`Do you want to proceeding with purging all data in collection \`${collection}\`?`);
        message.reply(`Please type \`y\` or \`n\` to proceed!`);
    }else{
        message.reply(`Format of command incorrect please try again!`)
    }
}

const testFn: MatcherFunction = (message: Message) => {
    return /purge \w+/.test(message.content);
}

const purgeCommand = new Command('purge', 'purges the specified collection', testFn, purgeHandlerStart);
export default purgeCommand;