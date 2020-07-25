import Command, {HandlerType, MatcherFunction} from './Command';
import DiscordManager from '../DiscordManager';
import { Message } from 'discord.js';
import { STATELESS_COMMAND, END_OF_CONVERSATION } from '../state/StateManager';

const handlerAdd: HandlerType = async (manager: DiscordManager, message: Message) => {
    const databaseManager = manager.getDatabaseManager();
    const stateManager = manager.getStateManager();

    stateManager.updateState(STATELESS_COMMAND, message);
    const matchResult = /add (\w+) (.*)/.exec(message.content);
    if(matchResult && matchResult.length == 3){
        const collection = matchResult[1];
        const toAdd = matchResult[2];
        const json = {
            content: toAdd,
            author: message.author.id,
            tag: message.author.tag,
        }
        message.reply(`Attempting to add \`${toAdd}\` to collection \`${collection}\``)
        const response = await databaseManager.send(collection, json);
        switch(response){
            case 'ok':
                message.reply(`Successfully added!`);
                break;
            case 'duplicate':
                message.reply(`Item \`${toAdd}\` already exists in collection \`${collection}\``)
                break;
            case 'error':
                message.reply(`Issue adding to database please try again!`)
                break;
        }
    }else{
        message.reply(`Format of command incorrect please try again!`)
    }
    stateManager.updateState(END_OF_CONVERSATION, message);
}

const testFn: MatcherFunction = (message: Message) => {
    return /add \w+ .*/.test(message.content);
}

const addCommand = new Command('add', 'Adds a message to the specified collection', testFn, handlerAdd);
export default addCommand;